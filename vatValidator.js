// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Verwijder spaties en maak hoofdletters
    const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    const number = cleanVAT.substring(2);

    console.log('Cleaning VAT number:', { 
      original: vatNumber,
      cleaned: cleanVAT,
      countryCode,
      number
    });

    // VIES API aanroepen
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`;
    console.log('Calling VIES API:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('VIES API status:', response.status);

    if (!response.ok) {
      console.error('VIES API error status:', response.status);
      throw new Error(`VIES API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('VIES API response:', data);

    return {
      isValid: data.valid === true,
      message: data.valid === true
        ? 'Geldig BTW nummer. BTW-vrijstelling wordt toegepast.'
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
