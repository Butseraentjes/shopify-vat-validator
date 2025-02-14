// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    // Updated VIES API endpoint
    const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/api/v1/vat/${countryCode}${number}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      isValid: data.valid === true,
      message: data.valid === true
        ? 'Geldig BTW nummer. BTW-vrijstelling wordt toegepast.'
        : 'Ongeldig BTW nummer.',
      details: data
    };
  } catch (error) {
    console.error('VIES API fout:', error);
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer.',
      error: error.message
    };
  }
}

module.exports = { validateVAT };
