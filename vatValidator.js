const fetch = require('node-fetch');

async function validateVAT(vatNumber) {
  try {
    // Basis opschoning en validatie
    const cleanVAT = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const countryCode = cleanVAT.substring(0, 2);
    let number = cleanVAT.substring(2);

    // Check op landcodes
    if (!['BE', 'NL', 'DE', 'FR'].includes(countryCode)) {
      return {
        isValid: false,
        message: 'Ongeldig land formaat. Gebruik bijvoorbeeld NL of BE.'
      };
    }

    // Specifieke landformaten
    switch (countryCode) {
      case 'BE':
        // België weigert BTW vrijstelling
        return {
          isValid: false,
          message: 'Belgische BTW nummers komen niet in aanmerking voor vrijstelling'
        };

      case 'NL':
        // Nederlands formaat: 9 cijfers + B + 2 cijfers
        if (!/^\d{9}B\d{2}$/.test(number)) {
          number = number.replace(/[B]/g, '').padStart(11, '0');
          number = number.slice(0, 9) + 'B' + number.slice(9, 11);
        }
        break;

      case 'DE':
        // Duits formaat: 9 cijfers
        number = number.padStart(9, '0');
        break;

      case 'FR':
        // Frans formaat: 11 karakters
        if (number.length !== 11) {
          number = number.padStart(11, '0');
        }
        break;
    }

    console.log('Validating:', { countryCode, number });

    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconden timeout
      }
    );

    if (!response.ok) {
      throw new Error(`VIES API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('VIES Response:', data);

    return {
      isValid: data.valid,
      message: data.valid 
        ? `BTW nummer is geldig voor ${countryCode}` 
        : `BTW nummer is ongeldig voor ${countryCode}`
    };

  } catch (error) {
    console.error('VAT Validation Error:', error);
    
    // Gebruiksvriendelijke foutmelding
    return {
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren. Controleer het nummer en probeer het opnieuw.'
    };
  }
}

module.exports
