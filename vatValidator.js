// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    const countryCode = vatNumber.substring(0, 2).toUpperCase();
    const number = vatNumber.substring(2).replace(/[^0-9A-Za-z]/g, '');
    
    // Valideer via VIES API
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`
    );
    
    const data = await response.json();
    
    return {
      isValid: data.valid,
      message: data.valid 
        ? 'Geldig BTW nummer. BTW-vrijstelling wordt toegepast.'
        : 'Ongeldig BTW nummer.',
      details: data
    };
  } catch (error) {
    console.error('VIES API fout:', error);
    throw new Error('Kan BTW nummer niet valideren');
  }
}

module.exports = { validateVAT };
