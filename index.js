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

// Bestaande VAT validatie route
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

// Nieuwe route om BTW-status op te slaan
app.post('/api/save-vat-status', async (req, res) => {
  try {
    const { cartId, isExempt, vatNumber } = req.body;
    
    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: 'Cart ID is verplicht'
      });
    }

    // Voor nu slaan we het op in een tijdelijke array
    // Later vervangen we dit door een database
    global.vatStatuses = global.vatStatuses || {};
    global.vatStatuses[cartId] = {
      isExempt,
      vatNumber,
      timestamp: new Date().toISOString()
    };

    console.log('BTW status opgeslagen:', {
      cartId,
      status: global.vatStatuses[cartId]
    });

    res.json({
      success: true,
      message: 'BTW status opgeslagen'
    });
  } catch (error) {
    console.error('Fout bij opslaan BTW status:', error);
    res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het opslaan van de BTW status'
    });
  }
});

// Route om BTW-status op te halen
app.get('/api/vat-status/:cartId', (req, res) => {
  const { cartId } = req.params;
  const status = global.vatStatuses?.[cartId];
  
  if (!status) {
    return res.status(404).json({
      success: false,
      message: 'Geen BTW status gevonden voor deze cart'
    });
  }

  res.json({
    success: true,
    data: status
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
  console.log(`Health check beschikbaar op: /health`);
});
