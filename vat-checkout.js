class VATCheckout {
  constructor() {
    this.apiBaseUrl = 'this.apiBaseUrl = 'https://shopify-vat-validator.onrender.com';  // Update deze regel'; // Vervang dit met je Render URL
    this.init();
  }

  init() {
    // Wacht tot de pagina geladen is
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupVATField());
    } else {
      this.setupVATField();
    }
  }

  setupVATField() {
    // Voeg BTW input veld toe aan de checkout
    const checkoutForm = document.querySelector('.order-summary__sections');
    if (!checkoutForm) return;

    const vatFieldHTML = `
      <div class="vat-validation-section" style="margin: 20px 0;">
        <label for="vat-number">BTW Nummer (voor zakelijke klanten)</label>
        <input 
          type="text" 
          id="vat-number" 
          placeholder="bijv. BE0123456789"
          style="width: 100%; padding: 8px; margin: 8px 0;"
        >
        <button 
          id="validate-vat" 
          style="width: 100%; padding: 8px; margin: 8px 0; background-color: #000; color: white; border: none;"
        >
          Valideer BTW Nummer
        </button>
        <div id="vat-validation-result" style="margin-top: 10px;"></div>
      </div>
    `;

    checkoutForm.insertAdjacentHTML('afterbegin', vatFieldHTML);

    // Voeg event listener toe aan de validatie knop
    document.getElementById('validate-vat').addEventListener('click', (e) => {
      e.preventDefault();
      this.validateVATNumber();
    });
  }

  async validateVATNumber() {
    const vatNumber = document.getElementById('vat-number').value;
    const resultDiv = document.getElementById('vat-validation-result');
    
    if (!vatNumber) {
      resultDiv.innerHTML = 'Voer een BTW nummer in';
      resultDiv.style.color = 'red';
      return;
    }

    try {
      // Valideer BTW nummer
      const validateResponse = await fetch(`${this.apiBaseUrl}/api/validate-vat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vatNumber })
      });

      const validationResult = await validateResponse.json();
      console.log('Validatie resultaat:', validationResult);

      if (validationResult.isValid) {
        // Sla de BTW status op
        const cartId = this.getCartId();
        await this.saveVATStatus(cartId, validationResult.isExempt, vatNumber);
        
        resultDiv.innerHTML = validationResult.message;
        resultDiv.style.color = 'green';
      } else {
        resultDiv.innerHTML = validationResult.message;
        resultDiv.style.color = 'red';
      }
    } catch (error) {
      console.error('Fout bij BTW validatie:', error);
      resultDiv.innerHTML = 'Er is een fout opgetreden bij het valideren van het BTW nummer';
      resultDiv.style.color = 'red';
    }
  }

  async saveVATStatus(cartId, isExempt, vatNumber) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/save-vat-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId,
          isExempt,
          vatNumber
        })
      });

      const result = await response.json();
      console.log('BTW status opgeslagen:', result);
    } catch (error) {
      console.error('Fout bij opslaan BTW status:', error);
    }
  }

  getCartId() {
    // Probeer cart ID te krijgen uit de URL of gebruik een timestamp als fallback
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('cart') || Date.now().toString();
  }
}

// Start de VAT checkout functionaliteit
new VATCheckout();
