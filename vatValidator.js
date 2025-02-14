// vatValidator.js
const fetch = require('node-fetch');
const https = require('https');

async function validateVAT(vatNumber) {
  try {
    const formatValidation = validateVATFormat(vatNumber);
    if (!formatValidation.isValid) {
      return formatValidation;
    }

    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    console.log(`Validating VAT: ${countryCode} ${number}`);
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      {
        method: 'POST',
        agent,
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'Accept': 'text/xml',
          'SOAPAction': ''
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope 
          xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
          xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
          <soap:Body>
            <tns:checkVat>
              <tns:countryCode>${countryCode}</tns:countryCode>
              <tns:vatNumber>${number}</tns:vatNumber>
            </tns:checkVat>
          </soap:Body>
        </soap:Envelope>`
      }
    );

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verbeterde XML parsing
    const isValid = responseText.includes('<ns2:valid>true</ns2:valid>');
    const nameMatch = responseText.match(/<ns2:name>(.*?)<\/ns2:name>/s);
    const addressMatch = responseText.match(/<ns2:address>(.*?)<\/ns2:address>/s);
    
    const name = nameMatch ? nameMatch[1].trim() : '';
    const address = addressMatch ? addressMatch[1].trim() : '';

    console.log('Parsed results:', { isValid, name, address });

    return {
      isValid: isValid,
      message: isValid 
        ? `BTW nummer is geldig voor: ${name}${address ? ` (${address})` : ''}. BTW-vrijstelling wordt toegepast.`
        : 'Ongeldig BTW nummer.',
      details: {
        isValid: isValid,
        name: name,
        address: address
      }
    };
  } catch (error) {
    console.error('Gedetailleerde validatie error:', error);
    return {
      isValid: false,
      message: `Validatie fout: ${error.message}`,
      error: error.message
    };
  }
}

function validateVATFormat(vatNumber) {
  const patterns = {
    BE: /^BE[0-9]{10}$/,
    NL: /^NL[0-9]{9}B[0-9]{2}$/
  };
  
  const countryCode = vatNumber.substring(0, 2).toUpperCase();
  
  console.log(`Validating format for: ${vatNumber}`);
  console.log(`Country code: ${countryCode}`);
  
  if (!patterns[countryCode]) {
    return {
      isValid: false,
      message: `Land code ${countryCode} wordt niet ondersteund. Alleen BE en NL zijn momenteel beschikbaar.`
    };
  }
  
  const isValidFormat = patterns[countryCode].test(vatNumber.toUpperCase());
  console.log(`Format validation result: ${isValidFormat}`);
  
  if (!isValidFormat) {
    return {
      isValid: false,
      message: `Ongeldig formaat voor ${countryCode} BTW nummer. Gebruik ${countryCode === 'BE' ? 'BE0123456789' : 'NL123456789B01'} formaat.`
    };
  }
  
  return { isValid: true };
}

module.exports = { validateVAT };
