// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Verwijder alle niet-alfanumerieke karakters
    const cleanVAT = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    let number = cleanVAT.substring(2);

    // Specifieke formatting voor Belgische BTW nummers
    if (countryCode === 'BE') {
      // Verwijder eventuele leading zeros
      number = number.replace(/^0+/, '');
      
      // Voeg een '0' toe aan het begin als het nummer met een 5 begint
      if (number.startsWith('5')) {
        number = '0' + number;
      }
    }

    console.log('Processing VAT:', {
      original: vatNumber,
      cleaned: cleanVAT,
      countryCode,
      number,
      fullNumber: countryCode + number
    });

    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`, {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('VIES API error status:', response.status);
      throw new Error(`VIES API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('VIES API response:', data);

    return {
      isValid: data.valid === true,
      message: data.valid === true
        ? `Geldig BTW nummer. BTW-vrijstelling wordt toegepast.`
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
      message: `Er is een fout opgetreden bij het valideren van het BTW nummer: ${error.messag
