// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Shopify } = require('@shopify/shopify-api');
const { validateVAT } = require('./vatValidator');

const app = express();
const PORT = process.env.PORT || 3000;

// Shopify configuratie
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  apiVersion: '2024-01'
});

app.use(cors());
app.use(express.json());

// Webhook voor winkelwagen updates
app.post('/webhooks/cart/update', async (req, res) => {
  try {
    const { cart_token, attributes } = req.body;
    
    if (attributes && attributes.vat_number) {
      const validationResult = await validateVAT(attributes.vat_number);
      
      // Update cart attributes met validatie resultaat
      await shopify.api.rest.Cart.update(cart_token, {
        attributes: {
          ...attributes,
          vat_validated: validationResult.isValid,
          vat_message: validationResult.message
        }
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Cart update webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// BTW validatie endpoint
app.post('/api/validate-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;
    
    if (!vatNumber) {
      return res.status(400).json({ error: 'BTW nummer is verplicht' });
    }

    if (vatNumber.toUpperCase().startsWith('BE')) {
      return res.json({
        isValid: false,
        message: 'Belgische BTW nummers komen niet in aanmerking voor vrijstelling'
      });
    }

    const validationResult = await validateVAT(vatNumber);
    
    // Update Shopify tax settings if valid
    if (validationResult.isValid) {
      try {
        await shopify.api.rest.Shop.update({
          taxes_included: false,
          tax_shipping: false
        });
      } catch (shopifyError) {
        console.error('Shopify tax settings update error:', shopifyError);
      }
    }

    res.json(validationResult);
  } catch (error) {
    console.error('VAT validation error:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het valideren van het BTW nummer' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    shopify_connected: Boolean(shopify),
    environment: process.env.NODE_ENV
  });
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
