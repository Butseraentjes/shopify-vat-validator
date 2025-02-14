// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Verwijder alle niet-alfanumerieke karakters
    const cleanVAT = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    let number = cleanVAT.substring(2);

    // Voor Belgische BTW nummers
    if (countryCode === 'BE') {
      // Format het nummer volgens VIES specificaties
      number = number.padStart(10, '0'); // Zorg voor 10 cijfers met leading zeros
    }

    console.log('Processing VAT:', {
      original: vatNumber,
      cleaned: cleanVAT,
      countryCode,
      number,
      requestUrl: `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`
    });

    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('VIES API response:', data);

    if (data.valid) {
      return {
        isValid: true,
        message: `BTW nummer is geldig voor: ${data.name}. BTW-vrijstelling wordt toegepast.`,
        details: {
          ...data,
          isValid: true
        }
      };
    } else {
      return {
        isValid: false,
        message: 'Ongeldig BTW nummer.',
        details: {
          ...
