// index.js
const express = require('express');
const cors = require('cors');
const { validateVAT } = require('./vatValidator');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ 
        isValid: false,
        message: 'BTW nummer is verplicht' 
      });
    }

    // Clean the VAT number
    const cleanVatNumber = vatNumber.replace(/[.\s-]/g, '').toUpperCase();
    
    const validationResult = await validateVAT(cleanVatNumber);
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

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
