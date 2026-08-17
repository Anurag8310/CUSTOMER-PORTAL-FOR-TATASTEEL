/**
 * Tata Steel Customer Portal - Mill Test Certificate (MTC) Verifier Module
 * Matches exact specified format and values
 */

class MTCVerifier {
  constructor() {
    this.containerId = "mtc-view-container";
    this.searchHeatNo = null;
  }

  render(heatNo = null) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;
    const accountMtcMap = window.tataDB.getAllMTCs(userId);
    const availableHeats = Object.keys(accountMtcMap);

    if (heatNo) {
      this.searchHeatNo = heatNo;
    } else if (!this.searchHeatNo || !availableHeats.includes(this.searchHeatNo)) {
      this.searchHeatNo = availableHeats.length > 0 ? availableHeats[0] : "HT-2026-8987";
    }

    const mtc = this.searchHeatNo ? window.tataDB.getMTCByHeat(this.searchHeatNo) : null;

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Digital Mill Test Certificate (MTC) Verifier</h2>
          <p class="view-subtitle">Official NABL-accredited heat-wise chemical spectrograph composition and mechanical lab test records for <strong class="text-navy">${user ? user.company : 'Customer'}</strong></p>
        </div>
      </div>

      <div class="card mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex-1 min-w-300">
            <label class="form-label">Verify Heat Number / Inspection Lot</label>
            <div class="flex gap-2">
              <input type="text" id="mtc-search-input" class="form-input font-mono uppercase" value="${this.searchHeatNo}" placeholder="e.g. HT-2026-8987">
              <button class="btn btn-primary" onclick="window.mtcVerifier.searchMTC()">
                Verify Heat Number
              </button>
            </div>
          </div>

          <div>
            <label class="form-label">Account Heat Certificates</label>
            <div class="flex gap-2">
              ${availableHeats.map(h => `
                <button class="btn btn-sm ${h === this.searchHeatNo ? 'btn-navy' : 'btn-secondary'} font-mono" onclick="window.mtcVerifier.render('${h}')">
                  ${h}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      ${mtc ? this.renderCertificateCard(mtc) : `
        <div class="card text-center py-8">
          <h3 class="text-lg font-bold text-dark mb-1">No MTC Record Selected</h3>
          <p class="text-sm text-muted">Enter your Heat Number above or select one of your account heat certificates.</p>
        </div>
      `}
    `;
  }

  renderCertificateCard(mtc) {
    const chem = mtc.chemicalAnalysis;
    const mech = mtc.mechanicalProperties;

    return `
      <div class="card card-certificate p-6 position-relative bg-white border border-gray-300">
        <!-- Certificate Official Header -->
        <div class="flex justify-between items-start mb-6 pb-4 border-b border-gray-300">
          <div class="flex items-center gap-4">
            <div class="bg-white p-2 rounded border border-gray-200 shadow-sm">
              <img src="images/tata-steel-seeklogo.png" alt="Tata Steel Logo" class="tata-wordmark-md">
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy">TATA STEEL LIMITED</h3>
              <p class="text-xs text-muted">METALLURGICAL QUALITY CONTROL LABORATORY | ${mtc.plant}</p>
              <div class="text-xs text-navy font-mono mt-1">ISO/IEC 17025 Accredited NABL Testing Laboratory</div>
            </div>
          </div>

          <div class="text-right">
            <span class="badge badge-success text-sm py-1 px-3 mb-1">${mtc.certificateStatus}</span>
            <div class="text-xs font-mono text-muted">Testing Date: ${mtc.testDate}</div>
            <div class="text-xs font-mono text-navy font-bold mt-1">Heat Number: ${mtc.heatNumber}</div>
            <div class="text-xs font-mono text-muted">Order Number: ${mtc.orderId}</div>
          </div>
        </div>

        <!-- Product & Heat Info Grid -->
        <div class="grid grid-3 gap-4 mb-6 p-4 rounded bg-gray-50 border border-gray-200">
          <div>
            <span class="text-xs text-muted uppercase font-bold">Product Name</span>
            <div class="font-bold text-dark text-sm mt-1">${mtc.productName}</div>
          </div>
          <div>
            <span class="text-xs text-muted uppercase font-bold">Steel Grade</span>
            <div class="font-bold text-navy text-sm mt-1 font-mono">${mtc.grade}</div>
          </div>
          <div>
            <span class="text-xs text-muted uppercase font-bold">Size / Dimension</span>
            <div class="font-bold text-dark text-sm mt-1 font-mono">${mtc.size}</div>
          </div>
        </div>

        <!-- Chemical Composition Table -->
        <div class="mb-6">
          <h4 class="text-md font-bold text-dark mb-3">1. SPECTROGRAPHIC CHEMICAL COMPOSITION (% Weight)</h4>
          <div class="table-responsive">
            <table class="data-table text-center font-mono text-sm">
              <thead>
                <tr>
                  <th>Carbon (C)</th>
                  <th>Manganese (Mn)</th>
                  <th>Sulphur (S)</th>
                  <th>Phosphorus (P)</th>
                  <th>S + P Sum</th>
                  <th>Carbon Equiv (CE)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-bold text-dark">${chem.carbon}%</td>
                  <td class="font-bold text-dark">${chem.manganese}%</td>
                  <td class="font-bold text-dark">${chem.sulphur}%</td>
                  <td class="font-bold text-dark">${chem.phosphorus}%</td>
                  <td class="font-bold text-navy">${chem.sulphurPhos}%</td>
                  <td class="font-bold text-navy">${chem.carbonEquiv}%</td>
                </tr>
                <tr class="text-xs text-muted bg-gray-50">
                  <td>Max 0.25%</td>
                  <td>1.0 - 1.30%</td>
                  <td>Max 0.040%</td>
                  <td>Max 0.040%</td>
                  <td>Max 0.075%</td>
                  <td>Max 0.42%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mechanical Properties Table -->
        <div class="mb-6">
          <h4 class="text-md font-bold text-dark mb-3">2. MECHANICAL & TENSILE PROPERTIES</h4>
          <div class="table-responsive">
            <table class="data-table text-center text-sm">
              <thead>
                <tr>
                  <th>Yield Strength (N/mm²)</th>
                  <th>Ultimate Tensile (N/mm²)</th>
                  <th>TS / YS Ratio</th>
                  <th>Elongation (%)</th>
                  <th>Bend Test Result</th>
                  <th>Rebend Test Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-bold font-mono text-navy">${mech.yieldStrength} N/mm² <span class="text-xs text-muted font-normal block">(Min 550 N/mm²)</span></td>
                  <td class="font-bold font-mono text-dark">${mech.tensileStrength} N/mm² <span class="text-xs text-muted font-normal block">(Min 600 N/mm²)</span></td>
                  <td class="font-bold font-mono text-navy">${mech.tsYsRatio} <span class="text-xs text-muted font-normal block">(Min 1.08)</span></td>
                  <td class="font-bold font-mono text-green">${mech.elongation}% <span class="text-xs text-muted font-normal block">(Min 14.5%)</span></td>
                  <td class="font-bold text-green text-xs">${mech.bendTest}</td>
                  <td class="font-bold text-green text-xs">${mech.rebendTest}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Verification Signature & Actions -->
        <div class="flex flex-wrap justify-between items-center pt-4 border-t border-gray-300 mt-6">
          <div>
            <div class="text-xs text-muted font-mono">Digital Signature:</div>
            <div class="text-xs font-mono text-dark font-bold">${mtc.qrCodeHash}</div>
            <div class="text-xs text-green mt-1">Quality Inspector: ${mtc.qaInspector}</div>
          </div>

          <div class="flex gap-3 mt-3 sm:mt-0">
            <button class="btn btn-secondary" onclick="window.print()">
              Print Official Certificate
            </button>
            <button class="btn btn-primary" onclick="window.mtcVerifier.downloadCertificateLocal('${mtc.heatNumber}')">
              Download Official Certificate
            </button>
          </div>
        </div>
      </div>
    `;
  }

  searchMTC() {
    const input = document.getElementById("mtc-search-input");
    if (input && input.value) {
      this.render(input.value.trim().toUpperCase());
    }
  }

  downloadCertificateLocal(heatNo) {
    const mtc = window.tataDB.getMTCByHeat(heatNo);
    if (!mtc) return;

    const chem = mtc.chemicalAnalysis;
    const mech = mtc.mechanicalProperties;

    const textContent = `========================================================================
                      TATA STEEL LIMITED
        METALLURGICAL QUALITY CONTROL LABORATORY
========================================================================
OFFICIAL MILL TEST CERTIFICATE (MTC)
ISO/IEC 17025 Accredited NABL Testing Laboratory

Certificate Status : ${mtc.certificateStatus}
Heat Number        : ${mtc.heatNumber}
Order Number       : ${mtc.orderId}
Testing Date       : ${mtc.testDate}
Plant Location     : ${mtc.plant}

PRODUCT & GRADE SPECIFICATIONS
------------------------------------------------------------------------
Product Name       : ${mtc.productName}
Steel Grade        : ${mtc.grade}
Size / Dimension   : ${mtc.size}

1. SPECTROGRAPHIC CHEMICAL COMPOSITION (% Weight)
------------------------------------------------------------------------
Carbon (C)         : ${chem.carbon}% (Max 0.25%)
Manganese (Mn)     : ${chem.manganese}% (1.0 - 1.30%)
Sulphur (S)        : ${chem.sulphur}% (Max 0.040%)
Phosphorus (P)     : ${chem.phosphorus}% (Max 0.040%)
S + P Sum          : ${chem.sulphurPhos}% (Max 0.075%)
Carbon Equiv (CE)  : ${chem.carbonEquiv}% (Max 0.42%)

2. MECHANICAL & TENSILE PROPERTIES
------------------------------------------------------------------------
Yield Strength     : ${mech.yieldStrength} N/mm² (Min 550 N/mm²)
Tensile Strength   : ${mech.tensileStrength} N/mm² (Min 600 N/mm²)
TS / YS Ratio      : ${mech.tsYsRatio} (Min 1.08)
Elongation %       : ${mech.elongation}% (Min 14.5%)
Bend Test Result   : ${mech.bendTest}
Rebend Test Result : ${mech.rebendTest}

VERIFICATION & DIGITAL SIGNATURE
------------------------------------------------------------------------
Quality Inspector  : ${mtc.qaInspector}
Digital Signature  : ${mtc.qrCodeHash}

Generated via Tata Steel Customer Self-Service Portal
========================================================================`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MTC_Certificate_${heatNo}_TataSteel.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.showToast(`Mill Test Certificate MTC_${heatNo}_TataSteel.txt downloaded locally!`, "success");
  }
}

window.mtcVerifier = new MTCVerifier();
