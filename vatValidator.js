// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    // Correcte VIES API endpoint
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`, {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('VIES API error status:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('VIES response:', data); // Debug logging
    
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
