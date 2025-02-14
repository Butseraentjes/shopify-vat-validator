// vatValidator.js
const fetch = require('node-fetch');

function validateVATFormat(vatNumber) {
  // Basic format validation patterns
  const patterns = {
    BE: /^BE[0-9]{10}$/,
    NL: /^NL[0-9]{9}B[0-9]{2}$/,
    // Add more country patterns as needed
  };
  
  const countryCode = vatNumber.substring(0, 2).toUpperCase();
  if (!patterns[countryCode]) {
    return {
      isValid: false,
      message: `Land code ${countryCode} wordt niet ondersteund.`
    };
  }
  
  if (!patterns[countryCode].test(vatNumber.toUpperCase())) {
    return {
      isValid: false,
      message: `Ongeldig formaat voor ${countryCode} BTW nummer.`
    };
  }
  
  return { isValid: true };
}

async function validateVAT(vatNumber) {
  try {
    // First validate the format
    const formatValidation = validateVATFormat(vatNumber);
    if (!formatValidation.isValid) {
      return formatValidation;
    }

    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    // Use the updated VIES API endpoint
    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'SOAPAction': ''
        },
        body: `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <soapenv:Header/>
            <soapenv:Body>
              <urn:checkVat>
                <urn:countryCode>${countryCode}</urn:countryCode>
                <urn:vatNumber>${number}</urn:vatNumber>
              </urn:checkVat>
            </soapenv:Body>
          </soapenv:Envelope>
        `
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const isValid = text.includes('<valid>true</valid>');
    const nameMatch = text.match(/<name>(.*?)<\/name>/);
    const name = nameMatch ? nameMatch[1] : '';

    return {
      isValid: isValid,
      message: isValid 
        ? `BTW nummer is geldig voor: ${name}. BTW-vrijstelling wordt toegepast.`
        : 'Ongeldig BTW nummer.',
      details: {
        isValid: isValid,
        name: name
      }
    };
  } catch (error) {
    console.error('VIES API error:', error);
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer. Probeer het later opnieuw.',
      error: error.message
    };
  }
}

module.exports = { validateVAT };
