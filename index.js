require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateVAT } = require('./vatValidator');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Homepage route
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify BTW Validator API',
    endpoints: {
      validateVAT: '/api/validate-vat',
      health: '/health'
    }
  });
});

// BTW validatie endpoint
app.post('/api/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ error: 'BTW nummer is verplicht' });
    }

    // Check voor Belgisch BTW nummer
    if (vatNumber.toUpperCase().startsWith('BE')) {
      return res.json({
        isValid: false,
        message: 'Belgische BTW nummers komen niet in aanmerking voor vrijstelling'
      });
    }

    const validationResult = await validateVAT(vatNumber);
    res.json(validationResult);
  } catch (error) {
    console.error('Fout bij BTW validatie:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het valideren van het BTW nummer' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
