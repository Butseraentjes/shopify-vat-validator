app.post('/api/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ 
        isValid: false,
        message: 'BTW nummer is verplicht' 
      });
    }

    // BTW nummer opschonen (spaties en speciale tekens verwijderen)
    const cleanVatNumber = vatNumber.replace(/[^A-Z0-9]/gi, '');
    
    console.log('Validating VAT number:', cleanVatNumber); // Debug logging
    const validationResult = await validateVAT(cleanVatNumber);
    console.log('Validation result:', validationResult); // Debug logging
    
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
