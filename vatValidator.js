const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Basis opschoning
    const cleanVAT = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    let number = cleanVAT.substring(2);

    // Specifieke format voor BE nummers
    if (countryCode === 'BE') {
      // Verwijder leading zeros
      number = number.replace(/^0+/, '');
      
      // Check lengte
      if (number.length !== 9 && number.length !== 10) {
        // Pas aan naar correct formaat
        number = number.padStart(9, '0');
      }
    }

    console.log('Sending request with:', {
      countryCode,
      number,
      fullVat: countryCode + number
    });

    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('API Response:', data);

    // Check specifiek voor BE response
    if (countryCode === 'BE' && !data.valid) {
      // Probeer alternatief formaat
      const altNumber = '0' + number;
      console.log('Trying alternative BE format:', altNumber);
      
      const altResponse = await fetch(
        `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${altNumber}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const altData = await altResponse.json();
      if (altData.valid) {
        return {
          isValid: true,
          message: 'BTW nummer is geldig'
        };
      }
    }

    return {
      isValid: data.valid,
      message: data.valid ? 'BTW nummer is geldig' : 'BTW nummer is ongeldig'
    };

  } catch (error) {
    console.error('Error validating VAT:', error);
    throw new Error('Fout bij het valideren van BTW nummer: ' + error.message);
  }
}

module.exports = { validateVAT };
