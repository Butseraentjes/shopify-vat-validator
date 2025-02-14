// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Clean and format the VAT number
    let cleanVAT = vatNumber.trim().toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    
    // Remove all non-alphanumeric characters
    let number = cleanVAT.substring(2).replace(/[^A-Z0-9]/g, '');
    
    // Special handling for Netherlands VAT numbers
    if (countryCode === 'NL') {
      // Ensure exactly 12 characters after NL
      if (number.length < 12) {
        number = number.padStart(12, '0');
      }
    }
    
    console.log(`Validating VAT: Country=${countryCode}, Number=${number}`); // Debug log
    
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('VIES API error:', response.status);
      throw new Error(`VIES API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('VIES response:', data); // Debug logging
    
    return {
      isValid: data.valid === true,
      message: data.valid === true
        ? `BTW nummer is geldig voor: ${data.name}. BTW-vrijstelling wordt toegepast.`
        : 'Ongeldig BTW nummer.',
      details: {
        ...data,
        isValid: data.valid === true,
        name: data.name
      }
    };
  } catch (error) {
    console.error('VAT validation error:', error);
    return {
      isValid: false,
      message: `Validatie fout: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = { validateVAT };
