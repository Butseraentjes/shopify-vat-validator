// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    // Log voor debugging
    console.log('Validating:', {
      original: vatNumber,
      countryCode,
      number,
      url: `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`
    });

    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log

    return {
      isValid: data.valid === true,
      message: data.valid === true
        ? `BTW nummer is geldig voor: ${data.name}. BTW-vrijstelling wordt toegepast.`
        : 'Ongeldig BTW nummer.',
      details: {
        ...data,
        isValid: data.valid === true
      }
    };
  } catch (error) {
    console.error('VIES API error:', error);
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer.',
      error: error.message
    };
  }
}

module.exports = { validateVAT };
