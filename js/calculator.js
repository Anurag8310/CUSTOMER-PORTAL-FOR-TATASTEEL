/**
 * Tata Steel Customer Portal - RFQ & Steel Price Tonnage Calculator Module
 */

class SteelCalculator {
  constructor() {
    this.containerId = "calculator-view-container";
    this.state = {
      selectedProductId: "prod_01",
      selectedGrade: "Fe 550D",
      selectedSize: "16mm",
      tonnage: 100,
      destinationCity: "Mumbai",
      includeFreight: true,
      includeGreenOffset: true
    };

    this.freightRates = {
      "Mumbai": 1850,
      "Pune": 1950,
      "Delhi / NCR": 1600,
      "Bengaluru": 2100,
      "Hyderabad": 1750,
      "Kolkata": 1100,
      "Chennai": 2050,
      "Vizag": 1400,
      "Ahmedabad": 1900,
      "Guwahati": 2400
    };
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const products = window.tataDB.getProducts();
    const currentProd = window.tataDB.getProductById(this.state.selectedProductId) || products[0];

    if (currentProd && currentProd.id !== this.state.selectedProductId) {
      this.state.selectedProductId = currentProd.id;
    }

    const availableGrades = (currentProd && currentProd.grades) ? currentProd.grades : ["Fe 550D", "Fe 500D", "IS 2062 E250"];
    const availableSizes = (currentProd && currentProd.availableSizes) ? currentProd.availableSizes : ["16mm", "20mm", "25mm"];

    if (!availableGrades.includes(this.state.selectedGrade)) {
      this.state.selectedGrade = availableGrades[0];
    }

    if (!availableSizes.includes(this.state.selectedSize)) {
      this.state.selectedSize = availableSizes[0];
    }

    const calc = this.calculateQuote(currentProd);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">RFQ & Steel Price Tonnage Calculator</h2>
          <p class="view-subtitle">Generate official commercial rate quotations with regional freight and statutory GST estimates</p>
        </div>
      </div>

      <div class="grid grid-3 gap-6">
        <!-- Form Inputs -->
        <div class="card col-span-2">
          <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Quotation Parameters</h3>
          
          <div class="grid grid-2 gap-4 mb-4">
            <div>
              <label class="form-label">Select Product Line</label>
              <select class="form-select" onchange="window.steelCalculator.updateProduct(this.value)">
                ${products.map(p => `
                  <option value="${p.id}" ${p.id === this.state.selectedProductId ? 'selected' : ''}>${p.name} (${p.category})</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="form-label">Steel Grade Standard</label>
              <select class="form-select" onchange="window.steelCalculator.updateGrade(this.value)">
                ${availableGrades.map(g => `
                  <option value="${g}" ${g === this.state.selectedGrade ? 'selected' : ''}>${g}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-2 gap-4 mb-4">
            <div>
              <label class="form-label">Dimension / Size</label>
              <select class="form-select" onchange="window.steelCalculator.updateSize(this.value)">
                ${availableSizes.map(s => `
                  <option value="${s}" ${s === this.state.selectedSize ? 'selected' : ''}>${s}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="form-label">Destination Regional Hub</label>
              <select class="form-select" onchange="window.steelCalculator.updateCity(this.value)">
                ${Object.keys(this.freightRates).map(city => `
                  <option value="${city}" ${city === this.state.destinationCity ? 'selected' : ''}>${city} Hub</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="form-label mb-0">Total Required Tonnage (Metric Tonnes)</label>
              <span class="font-mono text-navy font-bold text-lg">${this.state.tonnage} MT</span>
            </div>
            <input type="range" class="form-range" min="10" max="1000" step="5" value="${this.state.tonnage}" oninput="window.steelCalculator.updateTonnage(this.value)">
            <div class="flex justify-between text-xs text-muted mt-1 font-mono">
              <span>10 MT</span>
              <span>250 MT (Wagon)</span>
              <span>500 MT (Rake)</span>
              <span>1,000 MT</span>
            </div>
          </div>

          <!-- Quick Converter Helper -->
          <div class="quick-converter-box mb-4">
            <h4 class="text-sm font-bold text-dark mb-2">Tonnage Conversion Helper</h4>
            <div class="grid grid-3 gap-2">
              <div>
                <span class="text-xs text-muted">Linear Meters (Rebar)</span>
                <input type="number" id="conv-meters" class="form-input text-sm" placeholder="e.g. 12000" oninput="window.steelCalculator.convertMetersToTons(this.value)">
              </div>
              <div>
                <span class="text-xs text-muted">Number of Coils (25T)</span>
                <input type="number" id="conv-coils" class="form-input text-sm" placeholder="e.g. 4" oninput="window.steelCalculator.convertCoilsToTons(this.value)">
              </div>
              <div>
                <span class="text-xs text-muted">Estimated Tonnage</span>
                <div class="text-navy font-bold text-sm mt-2 font-mono" id="conv-result-display">${this.state.tonnage} MT</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Breakdown & Summary -->
        <div class="card">
          <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Commercial Price Breakdown</h3>

          <div class="summary-line">
            <span>Base Price (${this.state.tonnage} MT)</span>
            <span class="font-mono">₹${calc.baseTotal.toLocaleString('en-IN')}</span>
          </div>

          <div class="summary-line text-green">
            <span>Volume Bulk Rebate (${calc.discountPercent}%)</span>
            <span class="font-mono">-₹${calc.discountAmount.toLocaleString('en-IN')}</span>
          </div>

          <div class="summary-line">
            <span>Regional Freight (${this.state.destinationCity})</span>
            <span class="font-mono">₹${calc.freightTotal.toLocaleString('en-IN')}</span>
          </div>

          <div class="summary-line text-muted">
            <span>Taxable Subtotal</span>
            <span class="font-mono">₹${calc.subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div class="summary-line">
            <span>GST Amount (18% Statutory Rate)</span>
            <span class="font-mono">₹${calc.gstTotal.toLocaleString('en-IN')}</span>
          </div>

          <div class="price-grand-total">
            <div class="text-xs text-muted uppercase">Grand Total (Inclusive GST)</div>
            <div class="text-2xl font-bold font-mono text-navy">₹${calc.grandTotal.toLocaleString('en-IN')}</div>
            <div class="text-xs text-muted mt-1">Effective Rate: <strong class="text-dark">₹${calc.effectivePricePerTon.toLocaleString('en-IN')} / Ton</strong></div>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button class="btn btn-primary btn-block" onclick="window.steelCalculator.submitRFQ()">
              Save Commercial RFQ
            </button>
            <button class="btn btn-secondary btn-block" onclick="window.steelCalculator.createDirectOrder()">
              Convert to Direct Purchase Order
            </button>
          </div>
        </div>
      </div>
    `;
  }

  calculateQuote(product) {
    const tonnage = parseFloat(this.state.tonnage) || 100;
    const basePrice = product ? product.basePricePerTon : 58500;
    const baseTotal = tonnage * basePrice;

    let discountPercent = 0;
    if (tonnage >= 500) discountPercent = 4.5;
    else if (tonnage >= 200) discountPercent = 3.0;
    else if (tonnage >= 100) discountPercent = 1.5;

    const discountAmount = Math.round(baseTotal * (discountPercent / 100));
    const freightRate = this.freightRates[this.state.destinationCity] || 1800;
    const freightTotal = tonnage * freightRate;

    const subtotal = baseTotal - discountAmount + freightTotal;
    const gstTotal = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstTotal;
    const effectivePricePerTon = Math.round(grandTotal / tonnage);

    return {
      baseTotal,
      discountPercent,
      discountAmount,
      freightTotal,
      subtotal,
      gstTotal,
      grandTotal,
      effectivePricePerTon
    };
  }

  updateProduct(prodId) {
    this.state.selectedProductId = prodId;
    const p = window.tataDB.getProductById(prodId);
    if (p) {
      this.state.selectedGrade = p.grades ? p.grades[0] : "Fe 550D";
      this.state.selectedSize = p.availableSizes ? p.availableSizes[0] : "16mm";
    }
    this.render();
  }

  updateGrade(grade) {
    this.state.selectedGrade = grade;
    this.render();
  }

  updateSize(size) {
    this.state.selectedSize = size;
    this.render();
  }

  updateCity(city) {
    this.state.destinationCity = city;
    this.render();
  }

  updateTonnage(val) {
    this.state.tonnage = parseInt(val, 10);
    this.render();
  }

  convertMetersToTons(meters) {
    const m = parseFloat(meters) || 0;
    const tons = Math.round((m * 1.58) / 1000);
    if (tons > 0) {
      this.state.tonnage = Math.min(1000, Math.max(10, tons));
      const resEl = document.getElementById("conv-result-display");
      if (resEl) resEl.textContent = `${this.state.tonnage} MT`;
      this.render();
    }
  }

  convertCoilsToTons(coils) {
    const c = parseFloat(coils) || 0;
    const tons = c * 25;
    if (tons > 0) {
      this.state.tonnage = Math.min(1000, Math.max(10, tons));
      const resEl = document.getElementById("conv-result-display");
      if (resEl) resEl.textContent = `${this.state.tonnage} MT`;
      this.render();
    }
  }

  submitRFQ() {
    const prod = window.tataDB.getProductById(this.state.selectedProductId);
    const quote = this.calculateQuote(prod);
    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : "usr_01";

    const newRfq = {
      id: `RFQ-${user ? user.customerCode.split('-')[1] : 'CUST'}-${Math.floor(100 + Math.random() * 900)}`,
      userId: userId,
      productName: prod ? prod.name : "Tata Tiscon 550D Rebars",
      grade: this.state.selectedGrade,
      size: this.state.selectedSize,
      quantityTons: this.state.tonnage,
      destinationCity: this.state.destinationCity,
      estimatedBasePrice: quote.effectivePricePerTon,
      totalEstimatedCost: quote.grandTotal,
      validUntil: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]
    };

    window.tataDB.addRFQ(newRfq);

    const phone = user ? (user.phone || "+91 98765 43210") : "+91 98765 43210";
    const email = user ? user.email : "customer@company.com";

    alert(`[Official Tata Steel Commercial Dispatch Notifications]\n\n1. SMS SENT TO: ${phone}\n"Tata Steel Quotation ${newRfq.id} generated for ${this.state.tonnage} MT ${prod ? prod.name : 'Steel'}. Total Est: Rs. ${quote.grandTotal.toLocaleString('en-IN')}. Track on Customer Portal."\n\n2. EMAIL SENT TO: ${email}\nSubject: Commercial Quotation ${newRfq.id} Issued - Tata Steel Limited\n\nDear ${user ? user.name : 'Customer'},\nYour quotation ${newRfq.id} for ${this.state.tonnage} MT has been generated and saved to your account portal.`);

    window.showToast(`Quotation ${newRfq.id} saved & SMS/Email sent!`, "success");
    window.app.switchView('orders');
  }

  createDirectOrder() {
    const prod = window.tataDB.getProductById(this.state.selectedProductId);
    const quote = this.calculateQuote(prod);
    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : "usr_01";

    const newOrder = {
      id: `ORD-${user ? user.customerCode.split('-')[1] : 'CUST'}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId,
      orderDate: new Date().toISOString().split('T')[0],
      productName: prod ? prod.name : "Tata Tiscon 550D Rebars",
      productId: this.state.selectedProductId,
      grade: this.state.selectedGrade,
      size: this.state.selectedSize,
      tonnage: this.state.tonnage,
      baseRatePerTon: prod ? prod.basePricePerTon : 58500,
      freightPerTon: this.freightRates[this.state.destinationCity] || 1800,
      gstPercent: 18,
      totalAmount: quote.grandTotal,
      plant: "Jamshedpur Steel Works",
      dispatchStatus: "In-Transit",
      expectedDelivery: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
      heatNumber: `HT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dispatchMethod: "Rake Freight (Indian Railways)"
    };

    window.tataDB.addOrder(newOrder);

    const phone = user ? (user.phone || "+91 98765 43210") : "+91 98765 43210";
    const email = user ? user.email : "customer@company.com";

    alert(`[Official Tata Steel Order Notifications Dispatched]\n\n1. SMS SENT TO: ${phone}\n"Tata Steel PO CONFIRMED: Order #${newOrder.id} for ${this.state.tonnage} MT ${prod ? prod.name : 'Steel'} (Total Rs. ${quote.grandTotal.toLocaleString('en-IN')}). Heat #${newOrder.heatNumber} assigned. Track live on portal."\n\n2. EMAIL SENT TO: ${email}\nSubject: Purchase Order Confirmation - PO #${newOrder.id}\n\nDear ${user ? user.name : 'Customer'} (${user ? user.company : ''}),\nYour Purchase Order ${newOrder.id} for ${this.state.tonnage} MT ${prod ? prod.name : 'Steel'} has been placed. Assigned Heat #${newOrder.heatNumber}.`);

    window.showToast(`Purchase Order ${newOrder.id} placed! SMS & Email dispatched.`, "success");
    window.app.switchView('orders');
  }
}

window.steelCalculator = new SteelCalculator();
