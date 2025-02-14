// vatValidator.js
const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Basis opschoning: verwijder alle niet-alfanumerieke karakters
    const cleanVAT = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    let number = cleanVAT.substring(2);

    // Specifieke formattering per land
    if (countryCode === 'BE') {
      // Voor België: nummer moet precies 10 cijfers zijn, zonder BE prefix
      // Verwijder eventuele leading zeros eerst
      number = number.replace(/^0+/, '');
      // Voeg dan zeros toe tot we 9 cijfers hebben (+ 1 controle cijfer)
      number = number.padStart(9, '0');
    }

    console.log('Attempting validation:', {
      original: vatNumber,
      cleaned: cleanVAT,
      countryCode,
      number,
      url: `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`
    });

    // Probeer eerst de standaard VIES API
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Als de eerste poging faalt, probeer alternatieve formatting
    if (!response.ok && countryCode === 'BE') {
      // Probeer zonder leading zeros
      const altNumber = number.replace(/^0+/, '');
      console.log('Trying alternative format:', altNumber);
      
      const altResponse = await fetch(
        `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${altNumber}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (altResponse.ok) {
        const data = await altResponse.json();
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
      }
    }

    if (!response.ok) {
      throw new Error(`API response: ${response.status}`);
    }

    const data = await response.json();
    console.log('VIES response:', data);

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
    console.error('Validation error:', error);
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer.',
      error: error.message
    };
  }
}

module.exports = { validateVAT };
