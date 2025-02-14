app.post('/api/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ 
        isValid: false,
        message: 'BTW nummer is verplicht' 
      });
    }

    // Add input validation
    const vatRegex = /^[A-Z]{2}[0-9A-Z]+$/;
    if (!vatRegex.test(vatNumber.toUpperCase())) {
      return res.status(400).json({
        isValid: false,
        message: 'Ongeldig BTW nummer formaat. Gebruik bijvoorbeeld: NL123456789B01'
      });
    }

    if (vatNumber.toUpperCase().startsWith('BE')) {
      return res.json({
        isValid: false,
        message: 'Belgische BTW nummers komen niet in aanmerking voor vrijstelling'
      });
    }

    console.log('Validating VAT number:', vatNumber); // Add logging
    const validationResult = await validateVAT(vatNumber);
    console.log('Validation result:', validationResult); // Add logging
    
    res.json(validationResult);
  } catch (error) {
    console.error('VAT validation error:', error);
    res.status(500).json({ 
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer',
      error: error.message 
    });
  }
});
