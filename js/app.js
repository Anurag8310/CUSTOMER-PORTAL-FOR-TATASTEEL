/**
 * Tata Steel Customer Portal - Main SPA Application Orchestrator & Router
 */

class TataPortalApp {
  constructor() {
    this.currentView = "dashboard";
    this.activeLoginTab = "signin";
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.bindNavigation();
      
      if (window.tataAuth.isLoggedIn()) {
        this.showMainApp();
      } else {
        this.showLoginScreen();
      }
    });
  }

  showLoader(duration = 350) {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    loader.classList.add("active");
    setTimeout(() => {
      loader.classList.remove("active");
    }, duration);
  }

  showLoginScreen() {
    const loginEl = document.getElementById("login-screen");
    const appEl = document.getElementById("app-shell");

    if (loginEl) loginEl.style.display = "flex";
    if (appEl) appEl.style.display = "none";
    this.renderLoginForm();
  }

  showMainApp() {
    const loginEl = document.getElementById("login-screen");
    const appEl = document.getElementById("app-shell");

    if (loginEl) loginEl.style.display = "none";
    if (appEl) appEl.style.display = "flex";
    
    window.tataAuth.updateUIState();
    this.switchView(this.currentView);
  }

  switchLoginTab(tabName) {
    this.activeLoginTab = tabName;
    this.renderLoginForm();
  }

  renderLoginForm() {
    const container = document.getElementById("login-box-container");
    if (!container) return;

    const users = window.tataDB.getUsers();
    const saved = window.tataAuth.getSavedCreds();

    container.innerHTML = `
      <div class="login-card">
        <!-- Main TATA STEEL Header -->
        <div class="text-center mb-4">
          <div class="bg-white p-3 rounded border border-gray-200 inline-block mb-2 shadow-sm">
            <img src="images/tata-steel-seeklogo.png" alt="Tata Steel Main Logo" class="tata-wordmark-lg">
          </div>
          <h2 class="text-xl font-bold text-navy uppercase tracking-wider">CUSTOMER PORTAL</h2>
          <p class="text-xs text-muted mt-1">Commercial B2B Procurement & Order Self-Service</p>
        </div>

        <!-- Perfectly Centered Segmented Auth Navigation Tabs -->
        <div class="auth-tabs-nav">
          <button type="button" class="auth-tab-btn ${this.activeLoginTab === 'signin' ? 'active' : ''}" onclick="window.app.switchLoginTab('signin')">
            Sign In
          </button>
          <button type="button" class="auth-tab-btn ${this.activeLoginTab === 'register' ? 'active' : ''}" onclick="window.app.switchLoginTab('register')">
            New Registration
          </button>
          <button type="button" class="auth-tab-btn ${this.activeLoginTab === 'reset' ? 'active' : ''}" onclick="window.app.switchLoginTab('reset')">
            Reset Password
          </button>
        </div>

        ${this.activeLoginTab === 'signin' ? `
          <!-- Sign In Form -->
          <form id="signin-form" onsubmit="window.app.handleLoginSubmit(event)">
            <div class="form-group mb-4">
              <label class="form-label">Customer Code or Business Email</label>
              <input type="text" id="login-id" class="form-input" placeholder="e.g. TS-LNT-2026 or r.sharma@lntinfra.com" required value="${saved ? saved.identifier : 'TS-LNT-2026'}" oninput="window.app.clearLoginErrors()">
              <div id="login-id-error" class="field-error-msg" style="display: none;"></div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Account Password</label>
              <input type="password" id="login-pass" class="form-input" placeholder="••••••••" required value="${saved ? saved.password : 'lnt@1234'}" oninput="window.app.clearLoginErrors()">
              <div id="login-pass-error" class="field-error-msg" style="display: none;"></div>
            </div>

            <div class="flex items-center justify-between mb-5 text-xs">
              <label class="flex items-center gap-2 cursor-pointer text-dark">
                <input type="checkbox" id="remember-me" ${saved ? 'checked' : ''}>
                <span>Remember login details on this device</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-block py-3 font-bold text-md mt-6 mb-4">
              Sign In to Portal
            </button>
          </form>

          <!-- Enterprise Quick Switch Accounts with Clean Unfilled Cross (✕) Remove Option -->
          ${users.length > 0 ? `
            <div class="border-t border-gray-200 pt-4 mt-2">
              <p class="text-xs text-muted mb-2 text-center font-bold">Select Enterprise Account:</p>
              <div class="flex flex-col gap-2">
                ${users.map(u => `
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-xs btn-outline-navy text-left flex-1 flex justify-between items-center py-2 px-3" onclick="window.app.quickLogin('${u.id}')">
                      <span><strong>${u.company}</strong> (${u.name})</span>
                      <span class="font-mono text-3xs text-navy font-bold">${u.customerCode}</span>
                    </button>
                    <button type="button" class="account-remove-btn" title="Remove ${u.company} saved account" onclick="window.app.removeEnterpriseAccount('${u.id}', event)">
                      ✕
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        ` : (this.activeLoginTab === 'register' ? `
          <!-- New Customer Registration Form -->
          <form id="register-form" onsubmit="window.app.handleRegisterSubmit(event)">
            <div class="form-group mb-4">
              <label class="form-label">Contact Person Full Name</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Vikramaditya Sen" required>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Company / Enterprise Name</label>
              <input type="text" id="reg-company" class="form-input" placeholder="e.g. Shapoorji Pallonji Infra" required>
            </div>

            <div class="grid grid-2 gap-4 mb-4">
              <div>
                <label class="form-label">Business Email</label>
                <input type="email" id="reg-email" class="form-input" placeholder="v.sen@spinfra.com" required>
              </div>
              <div>
                <label class="form-label">Phone Number</label>
                <input type="text" id="reg-phone" class="form-input font-mono" placeholder="+91 98765 43210" required>
              </div>
            </div>

            <div class="grid grid-2 gap-4 mb-6">
              <div>
                <label class="form-label">Industry Segment</label>
                <select id="reg-segment" class="form-select">
                  <option value="Infrastructure & Civil">Infrastructure Construction</option>
                  <option value="Automotive OEM">Automotive OEM</option>
                  <option value="Heavy Engineering">Heavy Engineering</option>
                </select>
              </div>
              <div>
                <label class="form-label">Set Password (Min 6 chars)</label>
                <input type="password" id="reg-pass" class="form-input" placeholder="Enter password (min 6 chars)" required value="">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block py-3 font-bold text-md mt-6 mb-4">
              Register Customer Account
            </button>
          </form>
        ` : `
          <!-- Password Reset Form -->
          <form id="reset-form" onsubmit="window.app.handleResetSubmit(event)">
            <div class="form-group mb-4">
              <label class="form-label">Registered Customer Code or Email</label>
              <input type="text" id="reset-id" class="form-input" placeholder="e.g. TS-LNT-2026 or r.sharma@lntinfra.com" required>
            </div>

            <div class="form-group mb-5">
              <label class="form-label">New Password (Min 6 chars)</label>
              <input type="password" id="reset-pass" class="form-input" placeholder="Enter new password" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block py-3 font-bold text-md mt-6 mb-4">
              Reset Password & Sign In
            </button>
          </form>
        `)}

        <!-- Helpdesk Direct Links -->
        <div class="text-center text-xs text-muted mt-5 pt-4 border-t border-gray-200">
          Tata Steel Support Helpdesk:<br>
          <a href="mailto:customer.care@tatasteel.com?subject=Tata%20Steel%20Customer%20Portal%20Inquiry" class="font-bold text-navy hover:underline">customer.care@tatasteel.com</a> | Toll-Free: <a href="tel:18003458282" class="font-bold text-navy hover:underline">1800 345 8282</a>
        </div>
      </div>
    `;
  }

  removeEnterpriseAccount(userId, e) {
    if (e) e.stopPropagation();
    const user = window.tataDB.getUserById(userId);
    const company = user ? user.company : "this account";

    if (confirm(`Are you sure you want to remove ${company} (${user ? user.customerCode : ''}) from saved accounts?`)) {
      window.tataDB.deleteUser(userId);
      window.showToast(`Account ${company} removed.`, "info");
      this.renderLoginForm();
    }
  }

  clearLoginErrors() {
    const idEl = document.getElementById("login-id");
    const passEl = document.getElementById("login-pass");
    const idErr = document.getElementById("login-id-error");
    const passErr = document.getElementById("login-pass-error");

    if (idEl) idEl.classList.remove("input-error");
    if (passEl) passEl.classList.remove("input-error");

    if (idErr) { idErr.style.display = "none"; idErr.textContent = ""; }
    if (passErr) { passErr.style.display = "none"; passErr.textContent = ""; }
  }

  handleLoginSubmit(e) {
    if (e) e.preventDefault();
    this.clearLoginErrors();

    const idEl = document.getElementById("login-id");
    const passEl = document.getElementById("login-pass");
    const remEl = document.getElementById("remember-me");

    const id = idEl ? idEl.value : "";
    const pass = passEl ? passEl.value : "";
    const remember = remEl ? remEl.checked : false;

    const res = window.tataAuth.login(id, pass, remember);
    if (res.success) {
      this.showLoader(400);
      window.showToast(`Welcome back, ${res.user.name} (${res.user.company})!`, "success");
      this.showMainApp();
    } else {
      if (res.field === "both") {
        if (idEl) idEl.classList.add("input-error");
        if (passEl) passEl.classList.add("input-error");

        const idErr = document.getElementById("login-id-error");
        const passErr = document.getElementById("login-pass-error");

        if (idErr) {
          idErr.textContent = res.idError || "Invalid Customer Code or Business Email.";
          idErr.style.display = "flex";
        }
        if (passErr) {
          passErr.textContent = res.passError || "Invalid login password.";
          passErr.style.display = "flex";
        }
      } else if (res.field === "password") {
        if (passEl) passEl.classList.add("input-error");
        const passErr = document.getElementById("login-pass-error");
        if (passErr) {
          passErr.textContent = res.passError || "Incorrect password. Verification failed.";
          passErr.style.display = "flex";
        }
      } else {
        window.showToast(res.idError || res.passError || "Invalid credentials.", "warning");
      }
    }
  }

  handleRegisterSubmit(e) {
    if (e) e.preventDefault();

    const name = document.getElementById("reg-name").value;
    const company = document.getElementById("reg-company").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const segment = document.getElementById("reg-segment").value;
    const password = document.getElementById("reg-pass").value;

    if (!password || password.trim().length < 6) {
      window.showToast("Password must be at least 6 characters long.", "warning");
      return;
    }

    const companyPrefix = company.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const newCode = `TS-${companyPrefix || 'CUST'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: `usr_${Date.now()}`,
      customerCode: newCode,
      name: name,
      email: email,
      phone: phone || "+91 98765 43210",
      company: company,
      role: "Procurement Lead",
      segment: segment,
      location: "India Operations",
      gstin: "27AAACS1234F1Z2",
      passwordHash: password.trim()
    };

    window.tataDB.addUser(newUser);
    window.tataAuth.login(newUser.id, password, true);

    alert(`[Official Tata Steel Email Notification]\n\nTo: ${email}\nSubject: Welcome to Tata Steel Customer Portal - Account Verification\n\nDear ${name},\n\nYour commercial customer account for ${company} has been registered.\n\nAssigned Unique Customer Code: ${newCode}\nRegistered Email: ${email}\nPhone: ${phone}\n\nYou can now log in using your Customer Code or Business Email.`);

    this.showLoader(400);
    window.showToast(`Registration Successful! Code ${newCode} assigned & email dispatched.`, "success");
    this.showMainApp();
  }

  handleResetSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById("reset-id").value;
    const newPass = document.getElementById("reset-pass").value;

    if (!newPass || newPass.trim().length < 6) {
      window.showToast("New password must be at least 6 characters long.", "warning");
      return;
    }

    const res = window.tataDB.resetPassword(id, newPass.trim());
    if (res.success) {
      alert(`[Official Tata Steel Email Notification]\n\nTo: ${res.user.email}\nSubject: Tata Steel Portal Password Reset Confirmation\n\nDear ${res.user.name},\n\nYour portal account password for Customer Code ${res.user.customerCode} has been successfully updated.`);
      window.tataAuth.login(res.user.id, newPass.trim(), true);
      this.showLoader(400);
      window.showToast("Password updated successfully! Logging you in...", "success");
      this.showMainApp();
    } else {
      window.showToast(res.error, "warning");
    }
  }

  quickLogin(userId) {
    const user = window.tataDB.getUserById(userId);
    if (user) {
      this.showLoader(400);
      window.tataAuth.login(user.id, user.passwordHash || "password", true);
      window.showToast(`Switched account to ${user.company} (${user.customerCode})`, "success");
      this.showMainApp();
    }
  }

  handleLogout() {
    this.showLoader(300);
    window.tataAuth.logout();
    window.showToast("You have been logged out successfully.", "info");
  }

  bindNavigation() {
    const navItems = document.querySelectorAll(".nav-item[data-view]");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-view");
        this.switchView(view);
      });
    });
  }

  switchView(viewName, params = {}) {
    this.showLoader(300);
    this.currentView = viewName;

    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    document.querySelectorAll(".view-container").forEach(c => {
      c.style.display = "none";
    });

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.style.display = "block";
    }

    if (viewName === "dashboard") this.renderDashboard();
    if (viewName === "orders") this.renderOrdersView();
    if (viewName === "tracking") window.dispatchTracker.render(params.orderId);
    if (viewName === "calculator") window.steelCalculator.render();
    if (viewName === "catalog") this.renderCatalogView();
    if (viewName === "mtc") window.mtcVerifier.render(params.heatNo);
    if (viewName === "greensteel") this.renderGreenSteelView();
    if (viewName === "contact") this.renderContactView();
    if (viewName === "account-logs" || viewName === "logs") this.renderAccountLogsView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    this.switchView(this.currentView);
  }

  // --- Strict Account Isolated Dashboard View ---

  renderDashboard() {
    const container = document.getElementById("dashboard-view-container");
    if (!container) return;

    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;

    const orders = window.tataDB.getOrders(userId);
    const dispatches = window.tataDB.getDispatches(userId);
    const rfqs = window.tataDB.getRFQs(userId);

    const totalTonnage = orders.reduce((acc, o) => acc + (o.tonnage || 0), 0);
    const activeDispatchesCount = dispatches.filter(d => d.status === "In-Transit").length;
    const co2SavedTotal = (totalTonnage * 0.25).toFixed(1);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Welcome, ${user ? user.name : 'Customer'}</h2>
          <p class="view-subtitle">${user ? user.company : 'Tata Steel B2B Portal'} • Customer Code: <strong class="text-navy font-mono">${user ? user.customerCode : 'TS-CUST-8810'}</strong></p>
        </div>
        <div class="view-actions flex gap-2">
          <button class="btn btn-secondary text-xs" onclick="window.app.showRequestLogModal()">
            Request Activity Log via Email
          </button>
          <button class="btn btn-primary" onclick="window.app.switchView('calculator')">
            Create RFQ / Price Estimate
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards for Current Account -->
      <div class="grid grid-4 gap-4 mb-6">
        <div class="metric-card">
          <div class="metric-label">Purchased Tonnage (${user ? user.company.split(' ')[0] : 'Account'})</div>
          <div class="metric-value text-navy">${totalTonnage.toLocaleString()} MT</div>
          <div class="metric-footer">${orders.length} Consignment Orders</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Active Dispatches</div>
          <div class="metric-value text-blue">${activeDispatchesCount}</div>
          <div class="metric-footer">In-Transit Freight Movement</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Account Carbon Offset</div>
          <div class="metric-value text-green">${co2SavedTotal} tCO2e</div>
          <div class="metric-footer">Zeromet Sustainability Credit</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Saved Quotations</div>
          <div class="metric-value text-dark">${rfqs.length}</div>
          <div class="metric-footer">Commercial RFQs</div>
        </div>
      </div>

      <!-- Main Account-Isolated Dashboard Grid -->
      <div class="grid grid-3 gap-6">
        <div class="card col-span-2">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h3 class="card-title">Account Purchase Orders (${user ? user.company : ''})</h3>
            <button class="btn btn-sm btn-secondary" onclick="window.app.switchView('orders')">View All Orders</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Product & Specification</th>
                  <th>Tonnage</th>
                  <th>Dispatch Mill</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${orders.length > 0 ? orders.map(o => `
                  <tr>
                    <td class="font-mono font-bold text-navy">${o.id}</td>
                    <td>
                      <div class="font-bold text-dark">${o.productName}</div>
                      <div class="text-xs text-muted font-mono">${o.grade} (${o.size})</div>
                    </td>
                    <td class="font-mono font-bold text-dark">${o.tonnage} MT</td>
                    <td class="text-xs text-muted">${o.plant}</td>
                    <td>
                      <span class="badge ${o.dispatchStatus === 'Delivered' ? 'badge-success' : 'badge-warning'}">
                        ${o.dispatchStatus}
                      </span>
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-xs btn-navy" onclick="window.app.switchView('tracking', { orderId: '${o.id}' })">
                          Track
                        </button>
                        <button class="btn btn-xs btn-secondary" onclick="window.app.switchView('mtc', { heatNo: '${o.heatNumber}' })">
                          MTC
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" class="text-center text-muted py-4">No active orders for this account. Use the Steel Calculator to place your first PO.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card col-span-1">
          <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Tata Steel Works Status</h3>
          
          <div class="flex flex-col gap-3">
            <div class="plant-status-box">
              <div class="flex justify-between items-center">
                <span class="font-bold text-dark text-sm">Jamshedpur Works</span>
                <span class="badge badge-success">Active</span>
              </div>
              <p class="text-xs text-muted mt-1">Bar Mill & Primary Steel | 13 MTPA</p>
            </div>

            <div class="plant-status-box">
              <div class="flex justify-between items-center">
                <span class="font-bold text-dark text-sm">Kalinganagar Plant</span>
                <span class="badge badge-success">Active</span>
              </div>
              <p class="text-xs text-muted mt-1">Cold Rolling Mill & Heavy Plates | 8 MTPA</p>
            </div>

            <div class="plant-status-box">
              <div class="flex justify-between items-center">
                <span class="font-bold text-dark text-sm">Meramandali Works</span>
                <span class="badge badge-success">Active</span>
              </div>
              <p class="text-xs text-muted mt-1">Structural Sections & Strip Mill | 5.6 MTPA</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="text-sm font-bold text-dark mb-2">Customer Service Quick Links</h4>
            <div class="flex flex-col gap-2">
              <button class="btn btn-sm btn-secondary text-left" onclick="window.app.switchView('contact')">
                Contact Sales Manager & Offices
              </button>
              <button class="btn btn-sm btn-secondary text-left" onclick="window.app.switchView('mtc')">
                Verify Heat Mill Test Certificate
              </button>
              <button class="btn btn-sm btn-secondary text-left" onclick="window.app.showRequestLogModal()">
                Request Private Activity Log Report
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Strict Account Isolated Orders View ---

  renderOrdersView() {
    const container = document.getElementById("orders-view-container");
    if (!container) return;

    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;

    const orders = window.tataDB.getOrders(userId);
    const rfqs = window.tataDB.getRFQs(userId);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">My Orders & Commercial RFQs</h2>
          <p class="view-subtitle">Account Order Records for <strong class="text-navy">${user ? user.company : 'Customer'}</strong> (${user ? user.customerCode : ''})</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="window.app.switchView('calculator')">
            New RFQ Calculation
          </button>
        </div>
      </div>

      <div class="card mb-6">
        <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Confirmed Purchase Orders</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>PO Date</th>
                <th>Product & Specification</th>
                <th>Tonnage</th>
                <th>Total Value (INR)</th>
                <th>Heat Number</th>
                <th>Dispatch Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.length > 0 ? orders.map(o => `
                <tr>
                  <td class="font-mono font-bold text-navy">${o.id}</td>
                  <td class="text-xs text-muted font-mono">${o.orderDate}</td>
                  <td>
                    <div class="font-bold text-dark">${o.productName}</div>
                    <div class="text-xs text-muted font-mono">${o.grade} (${o.size})</div>
                  </td>
                  <td class="font-mono font-bold text-dark">${o.tonnage} MT</td>
                  <td class="font-mono text-navy font-bold">₹${o.totalAmount.toLocaleString('en-IN')}</td>
                  <td class="font-mono text-dark text-xs">${o.heatNumber}</td>
                  <td class="text-xs text-muted">${o.dispatchMethod ? o.dispatchMethod.split(' ')[0] : 'Rake'}</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-xs btn-navy" onclick="window.app.switchView('tracking', { orderId: '${o.id}' })">
                        Track
                      </button>
                      <button class="btn btn-xs btn-secondary" onclick="window.app.switchView('mtc', { heatNo: '${o.heatNumber}' })">
                        MTC
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="8" class="text-center text-muted py-4">No historical orders for this customer account.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Saved Commercial RFQs</h3>
        ${rfqs.length > 0 ? `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Product</th>
                  <th>Grade</th>
                  <th>Tonnage</th>
                  <th>Destination Hub</th>
                  <th>Estimated Cost (Inc GST)</th>
                  <th>Validity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${rfqs.map(r => `
                  <tr>
                    <td class="font-mono text-navy font-bold">${r.id}</td>
                    <td class="font-bold text-dark text-sm">${r.productName}</td>
                    <td class="font-mono text-xs text-muted">${r.grade}</td>
                    <td class="font-mono text-dark font-bold">${r.quantityTons} MT</td>
                    <td class="text-xs text-muted">${r.destinationCity}</td>
                    <td class="font-mono text-navy font-bold">₹${r.totalEstimatedCost.toLocaleString('en-IN')}</td>
                    <td class="text-xs text-muted font-mono">${r.validUntil}</td>
                    <td>
                      <button class="btn btn-xs btn-primary" onclick="window.steelCalculator.createDirectOrder()">
                        Issue PO
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <p class="text-muted text-sm py-4">No active RFQs. Use the Steel Calculator to estimate commercial rates and create new quotations.</p>
        `}
      </div>
    `;
  }

  // --- Catalog View ---

  renderCatalogView() {
    const container = document.getElementById("catalog-view-container");
    if (!container) return;

    const products = window.tataDB.getProducts();

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Tata Steel Product Specifications & Manual</h2>
          <p class="view-subtitle">Technical specifications for rebars, hot rolled coils, cold rolled sheets, and structural hollow sections</p>
        </div>
      </div>

      <div class="grid grid-3 gap-6">
        ${products.map(p => `
          <div class="card product-card flex flex-col justify-between">
            <div>
              <div class="product-image-box mb-3">
                <img src="${p.image}" alt="${p.name}" class="product-img">
              </div>
              <div class="text-xs font-mono text-navy uppercase font-bold mb-1">${p.category}</div>
              <h3 class="text-lg font-bold text-dark mb-1">${p.name}</h3>
              <p class="text-xs text-muted mb-3">${p.tagline}</p>

              <div class="bg-gray-100 p-3 rounded mb-3 text-xs border border-gray-200">
                <div class="font-mono text-navy mb-1 font-bold">Standard: ${p.specifications}</div>
                <div class="text-muted">Available Sizes: <strong>${p.availableSizes.join(', ')}</strong></div>
              </div>

              <p class="text-xs text-muted mb-4">${p.description}</p>
            </div>

            <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
              <div>
                <span class="text-xs text-muted">Base Rate:</span>
                <div class="font-mono text-navy font-bold text-md">₹${p.basePricePerTon.toLocaleString('en-IN')} / Ton</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="window.steelCalculator.updateProduct('${p.id}'); window.app.switchView('calculator');">
                Calculate RFQ
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- GreenSteel View ---

  renderGreenSteelView() {
    const container = document.getElementById("greensteel-view-container");
    if (!container) return;

    const metrics = window.tataDB.load().sustainabilityMetrics || {};

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Tata Steel GreenSteel Sustainability Report</h2>
          <p class="view-subtitle">Official carbon footprint verification and environmental compliance certification</p>
        </div>
      </div>

      <div class="grid grid-3 gap-6 mb-6">
        <div class="metric-card">
          <div class="metric-label">Total CO2 Avoided</div>
          <div class="metric-value text-green">${metrics.co2SavedTonnesTotal} tCO2e</div>
          <div class="metric-footer">Primary Steel Benchmark Reduction</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Recycled Scrap Ratio</div>
          <div class="metric-value text-navy">${metrics.scrapRecycledPercent}%</div>
          <div class="metric-footer">Ferrous Metal Circular Recycling</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Blast Furnace Hydrogen Pilot</div>
          <div class="metric-value text-blue">${metrics.greenHydrogenPilotCoverage}</div>
          <div class="metric-footer">Jamshedpur Low Emission Trial</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Environmental Ecolabel Verification</h3>
        <p class="text-sm text-muted mb-4">
          Tata Steel Limited operates under the ResponsibleSteel certification framework, ensuring sustainable raw material sourcing, scrap steel recycling, and energy-efficient blast furnace operations.
        </p>

        <div class="grid grid-2 gap-4">
          <div class="p-4 rounded bg-gray-50 border border-gray-200">
            <h4 class="font-bold text-dark text-sm mb-1">Scope 1 & Scope 2 Emissions Audit</h4>
            <p class="text-xs text-muted">Audited carbon index of 1.45 tCO2 per metric ton of liquid steel produced.</p>
          </div>
          <div class="p-4 rounded bg-gray-50 border border-gray-200">
            <h4 class="font-bold text-dark text-sm mb-1">Scrap Steel Processing</h4>
            <p class="text-xs text-muted">Over 27.5% end-of-life steel scrap utilized in primary steelmaking furnaces.</p>
          </div>
        </div>
      </div>
    `;
  }

  // --- Official Contact View ---

  renderContactView() {
    const container = document.getElementById("contact-view-container");
    if (!container) return;

    const offices = window.tataDB.load().offices || [];

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Official Commercial Contact & Regional Sales Offices</h2>
          <p class="view-subtitle">Get in touch with dedicated Tata Steel Account Managers, Plant Sales Divisions, and Customer Care</p>
        </div>
      </div>

      <div class="grid grid-3 gap-6 mb-6">
        <div class="card bg-navy text-white col-span-1" style="background-color: #00529B !important; color: #FFFFFF !important;">
          <h3 class="text-lg font-bold mb-2">Central Customer Support</h3>
          <p class="text-xs opacity-80 mb-4">Official Customer Care Helpdesk for Commercial Enquiries, Order Tracking & Billing</p>
          
          <div class="mb-3">
            <div class="text-xs opacity-75 uppercase font-mono">Toll-Free Helpline</div>
            <a href="tel:18003458282" class="text-xl font-bold font-mono text-white hover:underline">1800 345 8282</a>
          </div>

          <div class="mb-3">
            <div class="text-xs opacity-75 uppercase font-mono">Official Email</div>
            <a href="mailto:customer.care@tatasteel.com?subject=Tata%20Steel%20Customer%20Portal%20Inquiry" class="text-sm font-bold font-mono text-white hover:underline">customer.care@tatasteel.com</a>
          </div>

          <div>
            <div class="text-xs opacity-75 uppercase font-mono">Sales Enquiries Email</div>
            <a href="mailto:sales.enquiry@tatasteel.com?subject=Commercial%20Sales%20Enquiry" class="text-sm font-bold font-mono text-white hover:underline">sales.enquiry@tatasteel.com</a>
          </div>
        </div>

        <div class="card col-span-2">
          <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Submit Official Commercial Inquiry</h3>
          
          <div class="grid grid-2 gap-4 mb-4">
            <div>
              <label class="form-label">Inquiry Type</label>
              <select id="contact-type" class="form-select">
                <option value="Commercial Quote">Commercial Quotation & Volume Rate</option>
                <option value="Order Dispatch">Order Dispatch & Siding Status</option>
                <option value="MTC Certificate">Mill Test Certificate / Quality Assurance</option>
                <option value="Account Manager">Request Dedicated Account Manager</option>
              </select>
            </div>
            <div>
              <label class="form-label">Heat Number or Order ID (If Applicable)</label>
              <input type="text" id="contact-ref" class="form-input" placeholder="e.g. ORD-LNT-8891 or HT-2026-8891">
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Official Communication Details</label>
            <textarea id="contact-msg" class="form-input rows-4" placeholder="Enter detailed inquiry, tonnage requirements, or delivery schedule details..."></textarea>
          </div>

          <button class="btn btn-primary" onclick="window.app.submitContactForm()">
            Submit Official Enquiry
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Regional Sales Offices & Registered Plant Offices</h3>
        
        <div class="grid grid-3 gap-4">
          ${offices.map(o => `
            <div class="p-4 rounded bg-gray-50 border border-gray-200">
              <span class="badge badge-navy text-xs mb-2">${o.type}</span>
              <h4 class="font-bold text-dark text-sm mb-1">${o.city}</h4>
              <p class="text-xs text-muted mb-2">${o.address}</p>
              <div class="text-xs font-mono text-navy font-bold mb-1">
                Tel: <a href="tel:${o.phone.split('/')[0].replace(/[^0-9+]/g, '')}" class="text-navy hover:underline">${o.phone}</a>
              </div>
              <div class="text-xs font-mono text-muted">
                Email: <a href="mailto:${o.email}" class="text-navy hover:underline">${o.email}</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- Strict User-Isolated Account Security Logs View ---

  renderAccountLogsView() {
    const container = document.getElementById("account-logs-view-container");
    if (!container) return;

    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;

    // STRICT PRIVACY: Fetch ONLY the active user's specific audit logs. Global database logs are hidden.
    const userLogs = userId ? window.tataDB.getAuditLogs(userId) : [];

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Account Security & Activity Log Request</h2>
          <p class="view-subtitle">Private activity logs for <strong class="text-navy">${user ? user.company : 'Customer Account'}</strong> (${user ? user.customerCode : ''})</p>
        </div>
        <div class="view-actions flex gap-2">
          <button class="btn btn-primary" onclick="window.app.showRequestLogModal()">
            Request Activity Log via Email
          </button>
        </div>
      </div>

      <div class="card mb-6 bg-blue-50 border border-blue-200 p-5 rounded-lg">
        <div class="flex items-start gap-4">
          <div class="text-navy text-2xl font-bold">🔒</div>
          <div>
            <h3 class="text-md font-bold text-navy mb-1">Privacy & Security Protection</h3>
            <p class="text-xs text-muted leading-relaxed mb-3">
              To comply with Tata Steel B2B Data Privacy Guidelines, global system logs are hidden. You can request your official <strong>Account Activity Log Report</strong> sent directly to your registered business email (<strong class="text-dark">${user ? user.email : 'registered email'}</strong>).
            </p>
            <button class="btn btn-sm btn-primary" onclick="window.app.showRequestLogModal()">
              Request Official Activity Log via Email
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <h3 class="card-title">My Account Activity Records (${userLogs.length} Account Events)</h3>
          <div class="flex gap-2">
            <button class="btn btn-xs btn-secondary" onclick="window.app.exportUserLogsText()">
              Download My Log (.TXT)
            </button>
            <button class="btn btn-xs btn-navy" onclick="window.app.exportUserLogsJSON()">
              Download JSON (.JSON)
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Event Action</th>
                <th>Account / User</th>
                <th>Activity Description</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              ${userLogs.length > 0 ? userLogs.map(l => `
                <tr>
                  <td class="font-mono text-xs text-navy font-bold">${l.id}</td>
                  <td class="font-mono text-xs text-muted">${l.formattedTime || l.timestamp}</td>
                  <td>
                    <span class="badge ${
                      l.actionType === 'PO_CREATED' ? 'badge-success' :
                      l.actionType === 'USER_REGISTERED' ? 'badge-navy' :
                      l.actionType === 'PASSWORD_RESET' ? 'badge-warning' :
                      'badge-navy'
                    }">
                      ${l.actionType}
                    </span>
                  </td>
                  <td class="text-xs font-bold text-dark">${l.actorName}</td>
                  <td class="text-xs text-muted">${l.details}</td>
                  <td>
                    <button class="btn btn-xs btn-secondary font-mono" onclick="window.app.showPayloadModal('${l.id}')">
                      View Payload
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">No recent activity recorded for this specific account. Click "Request Activity Log via Email" above to compile a fresh report.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- Interactive Request Log Options Pop-up Modal Window ---

  showRequestLogModal() {
    const user = window.tataAuth.getCurrentUser();
    if (!user) {
      window.showToast("Please log in to request account activity logs.", "warning");
      return;
    }

    let existingModal = document.getElementById("request-log-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "request-log-modal";
    modal.className = "payload-modal-overlay";
    modal.innerHTML = `
      <div class="payload-modal-box" style="max-width: 580px;">
        <div class="payload-modal-header">
          <div>
            <div class="text-xs font-mono opacity-80">Official Email Dispatch Request</div>
            <h3 class="text-md font-bold text-white">Request Account Activity Log Report</h3>
          </div>
          <button type="button" class="payload-modal-close" onclick="document.getElementById('request-log-modal').remove()">
            ✕
          </button>
        </div>

        <form onsubmit="window.app.handleLogRequestSubmit(event)" class="payload-modal-body">
          <p class="text-xs text-muted mb-4 leading-relaxed">
            Configure your custom account activity report. The compiled log containing only <strong class="text-dark">${user.company}</strong> (${user.customerCode}) activity will be dispatched to your registered email address.
          </p>

          <div class="grid grid-2 gap-4 mb-4">
            <div>
              <label class="form-label font-bold">Duration Timeline Range</label>
              <select id="req-duration" class="form-select">
                <option value="7">Last 7 Days Activity</option>
                <option value="30" selected>Last 30 Days (Default)</option>
                <option value="90">Last 90 Days</option>
                <option value="all">All Time Account History</option>
              </select>
            </div>

            <div>
              <label class="form-label font-bold">Requested Report Format</label>
              <select id="req-format" class="form-select">
                <option value="PDF">Official PDF Document (.PDF)</option>
                <option value="XLSX">Microsoft Excel Spreadsheet (.XLSX)</option>
                <option value="TXT">Audit Text File (.TXT)</option>
                <option value="JSON">JSON Raw Metadata (.JSON)</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="form-label font-bold">Target Notification Email</label>
            <input type="email" id="req-email" class="form-input" required value="${user.email || 'customer@lntinfra.com'}">
          </div>

          <div class="form-group mb-5">
            <label class="form-label font-bold">Activity Type Filter</label>
            <select id="req-type" class="form-select">
              <option value="ALL">All Account Activity Events</option>
              <option value="PO_CREATED">Purchase Orders & Commercial RFQs Only</option>
              <option value="USER_REGISTERED">Account Auth & Passwords Only</option>
            </select>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-gray-200">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('request-log-modal').remove()">
              Cancel
            </button>
            <button type="submit" class="btn btn-sm btn-primary">
              Request Specific Data & Dispatch Email
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
  }

  handleLogRequestSubmit(e) {
    if (e) e.preventDefault();

    const user = window.tataAuth.getCurrentUser();
    if (!user) return;

    const duration = document.getElementById("req-duration").value;
    const format = document.getElementById("req-format").value;
    const email = document.getElementById("req-email").value;
    const eventType = document.getElementById("req-type").value;

    const userLogs = window.tataDB.getAuditLogs(user.id);
    let filteredLogs = userLogs;

    if (eventType !== "ALL") {
      filteredLogs = userLogs.filter(l => l.actionType === eventType);
    }

    const modal = document.getElementById("request-log-modal");
    if (modal) modal.remove();

    const logSummary = filteredLogs.map(l => `• [${l.formattedTime}] ${l.actionType}: ${l.details}`).join('\n');
    const rangeText = duration === 'all' ? 'All Time' : `Last ${duration} Days`;

    alert(`[Official Tata Steel Email Notification Dispatched]\n\nTo: ${email}\nSubject: Official Account Activity & Security Log Report (${format} Format)\n\nDear ${user.name},\n\nYour custom requested activity log report has been generated and emailed:\n\nAccount Customer Code: ${user.customerCode} (${user.company})\nTimeline Range: ${rangeText}\nRequested File Format: .${format}\nEvent Type Filter: ${eventType}\nTotal Events Included: ${filteredLogs.length}\n\nActivity Event Summary:\n${logSummary || 'No matching log entries found for selected criteria.'}\n\nIf you did not request this report, contact Tata Steel Helpdesk immediately at 1800 345 8282.`);

    if (format === "XLSX" || format === "PDF") {
      this.exportUserLogsText();
    } else if (format === "JSON") {
      this.exportUserLogsJSON();
    } else {
      this.exportUserLogsText();
    }

    window.showToast(`Requested log (${format}, ${rangeText}) dispatched to ${email}!`, "success");
  }

  // --- Pop-up Window Modal Overlay for Payload Data ---

  showPayloadModal(logId) {
    const user = window.tataAuth.getCurrentUser();
    const userLogs = user ? window.tataDB.getAuditLogs(user.id) : window.tataDB.getAuditLogs();
    const log = userLogs.find(l => l.id === logId);

    if (!log) {
      window.showToast("Activity log record not found.", "warning");
      return;
    }

    let existingModal = document.getElementById("payload-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "payload-modal";
    modal.className = "payload-modal-overlay";
    modal.innerHTML = `
      <div class="payload-modal-box">
        <div class="payload-modal-header">
          <div>
            <div class="text-xs font-mono opacity-80">Activity Log Metadata Payload</div>
            <h3 class="text-md font-bold font-mono text-white">${log.id}</h3>
          </div>
          <button type="button" class="payload-modal-close" onclick="document.getElementById('payload-modal').remove()">
            ✕
          </button>
        </div>

        <div class="payload-modal-body">
          <div class="grid grid-2 gap-3 mb-3 text-xs bg-gray-50 p-3 rounded border border-gray-200">
            <div>
              <span class="text-muted font-bold block">Event Action:</span>
              <span class="badge badge-navy mt-1">${log.actionType}</span>
            </div>
            <div>
              <span class="text-muted font-bold block">Timestamp:</span>
              <span class="font-mono text-dark font-bold mt-1 block">${log.formattedTime || log.timestamp}</span>
            </div>
            <div>
              <span class="text-muted font-bold block">Account / Actor:</span>
              <span class="text-navy font-bold mt-1 block">${log.actorName}</span>
            </div>
            <div>
              <span class="text-muted font-bold block">Actor ID:</span>
              <span class="font-mono text-dark mt-1 block">${log.actorId}</span>
            </div>
          </div>

          <div class="mb-3">
            <span class="text-xs font-bold text-dark block mb-1">Activity Description:</span>
            <div class="text-xs text-muted bg-white p-2 rounded border border-gray-200">${log.details}</div>
          </div>

          <div>
            <span class="text-xs font-bold text-dark block mb-1">Formatted Transaction Payload (JSON):</span>
            <pre class="payload-json-container">${JSON.stringify(log.payload, null, 2)}</pre>
          </div>

          <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <button type="button" class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(log.payload).replace(/'/g, "\\'")}, null, 2)); window.showToast('Payload JSON copied to clipboard!', 'success');">
              Copy Payload JSON
            </button>
            <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('payload-modal').remove()">
              Close Window
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  exportUserLogsText() {
    const user = window.tataAuth.getCurrentUser();
    if (!user) return;

    const userLogs = window.tataDB.getAuditLogs(user.id);
    const textContent = `========================================================================\n` +
      `TATA STEEL CUSTOMER PORTAL - ACCOUNT ACTIVITY & SECURITY REPORT\n` +
      `Account Customer Code : ${user.customerCode}\n` +
      `Company Name          : ${user.company}\n` +
      `Registered Email      : ${user.email}\n` +
      `Report Generated On   : ${new Date().toLocaleString('en-IN')}\n` +
      `Total Account Events  : ${userLogs.length}\n` +
      `========================================================================\n\n` +
      userLogs.map(l => 
        `[LOG ID: ${l.id}]\n` +
        `Timestamp : ${l.formattedTime}\n` +
        `Action    : ${l.actionType}\n` +
        `Actor     : ${l.actorName}\n` +
        `Details   : ${l.details}\n` +
        `Payload   : ${JSON.stringify(l.payload)}\n` +
        `------------------------------------------------------------------------`
      ).join('\n');

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TataSteel_AccountActivityLog_${user.customerCode}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    window.showToast("Account activity log exported to local file.", "success");
  }

  exportUserLogsJSON() {
    const user = window.tataAuth.getCurrentUser();
    if (!user) return;

    const userLogs = window.tataDB.getAuditLogs(user.id);
    const jsonContent = JSON.stringify(userLogs, null, 2);

    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TataSteel_AccountActivityLog_${user.customerCode}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    window.showToast("Account activity log exported to local JSON file.", "success");
  }

  submitContactForm() {
    const type = document.getElementById("contact-type").value;
    const msg = document.getElementById("contact-msg").value;

    if (!msg || !msg.trim()) {
      window.showToast("Please enter your inquiry details before submitting.", "warning");
      return;
    }

    const tck = window.tataDB.createSupportTicket({
      category: type,
      message: msg,
      subject: `Official Inquiry: ${type}`
    });

    window.showToast(`Official Inquiry #${tck.id} logged. A Tata Steel Commercial Officer will email you shortly.`, "success");
    document.getElementById("contact-msg").value = "";
  }
}

// Global App Instance
window.app = new TataPortalApp();

// Global Toast Notification Helper
window.showToast = function(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${message}</span>
    </div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
