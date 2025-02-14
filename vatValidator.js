const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^A-Za-z0-9]/g, '');

    // Direct afwijzen van Belgische nummers
    if (countryCode === 'BE') {
      return {
        isValid: false,
        message: 'Belgische BTW nummers komen niet in aanmerking voor vrijstelling'
      };
    }

    console.log('Validating VAT:', { countryCode, number });

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
    console.log('VIES Response:', data);

    return {
      isValid: data.valid,
      message: data.valid 
        ? `BTW nummer is geldig en vrijgesteld van BTW` 
        : `BTW nummer is ongeldig`
    };
  } catch (error) {
    console.error('VAT Validation Error:', error);
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren. Controleer het nummer en probeer het opnieuw.'
    };
  }
}

module.exports = { validateVAT };
