// index.js
const express = require('express');
const cors = require('cors');
const { validateVAT } = require('./vatValidator');

const app = express();
const PORT = process.env.PORT || 3000;

// Uitgebreide CORS configuratie
app.use(cors({
  origin: '*', // Let op: pas dit aan naar je specifieke domains in productie
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware voor logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.post('/api/validate-vat', async (req, res) => {
  try {
    console.log('Ontvangen verzoek body:', req.body);
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      console.log('Geen BTW nummer ontvangen');
      return res.status(400).json({ 
        isValid: false,
        message: 'BTW nummer is verplicht' 
      });
    }

    // Schoon het BTW nummer op
    const cleanVatNumber = vatNumber.replace(/[.\s-]/g, '').toUpperCase();
    console.log('Opgeschoond BTW nummer:', cleanVatNumber);
    
    const validationResult = await validateVAT(cleanVatNumber);
    console.log('Validatie resultaat:', validationResult);
    
    res.json(validationResult);
  } catch (error) {
    console.error('VAT validatie error:', error);
    res.status(500).json({ 
      isValid: false,
      message: 'Er is een fout opgetreden bij het valideren van het BTW nummer',
      error: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
  console.log(`Health check beschikbaar op: /health`);
});
