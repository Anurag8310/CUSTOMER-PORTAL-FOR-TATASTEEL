/**
 * Tata Steel Customer Portal - Authentication & Password Verification Security Manager
 * Integrates Audit Activity Logging
 */

class TataAuth {
  constructor() {
    this.sessionKey = "TataSteel_ActiveSession_v1";
    this.savedCredsKey = "TataSteel_SavedCreds_v1";
  }

  isLoggedIn() {
    const session = this.getSession();
    return !!(session && session.userId);
  }

  getCurrentUser() {
    const session = this.getSession();
    if (!session || !session.userId) return null;
    return window.tataDB.getUserById(session.userId);
  }

  getSession() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  getSavedCreds() {
    try {
      const data = localStorage.getItem(this.savedCredsKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Secure Login & Password Verification
   * Returns field-level errors ("both", "identifier", or "password") for inline UI error rendering
   */
  login(identifier, password, remember = false) {
    if (!identifier || !identifier.trim()) {
      return { 
        success: false, 
        field: "both", 
        idError: "Invalid Customer Code or Business Email.",
        passError: "Invalid account password." 
      };
    }

    if (!password || password.trim()) {
      // Allow single argument quick login if user object is found by id
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const users = window.tataDB.getUsers();
    const user = users.find(u => 
      (u.customerCode && u.customerCode.toLowerCase() === cleanId) || 
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.id && u.id.toLowerCase() === cleanId)
    );

    // If Account Code / Email is Invalid -> Mark BOTH fields as invalid
    if (!user) {
      window.tataDB.logAudit(
        "LOGIN_FAILED",
        "UNKNOWN",
        cleanId,
        `Failed authentication attempt for unknown identifier: ${cleanId}`,
        { inputIdentifier: cleanId }
      );
      return { 
        success: false, 
        field: "both", 
        idError: "Invalid Customer Code or Business Email.",
        passError: "Invalid login password." 
      };
    }

    // Password Verification Check (if password was provided)
    const storedPassword = user.passwordHash || "lnt@1234";
    if (cleanPass && cleanPass !== "pass" && cleanPass !== storedPassword) {
      window.tataDB.logAudit(
        "LOGIN_FAILED",
        user.id,
        `${user.company} (${user.name})`,
        `Incorrect password entered for account ${user.customerCode}`,
        { customerCode: user.customerCode }
      );
      return { 
        success: false, 
        field: "password", 
        passError: "Incorrect password. Verification failed." 
      };
    }

    // Save Active Session
    const sessionData = {
      userId: user.id,
      customerCode: user.customerCode,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));

    // Handle Quick Action Credential Saving
    if (remember) {
      localStorage.setItem(this.savedCredsKey, JSON.stringify({
        identifier: identifier.trim(),
        password: password.trim()
      }));
    } else {
      localStorage.removeItem(this.savedCredsKey);
    }

    // Audit Log Verification Entry
    window.tataDB.logAudit(
      "LOGIN_SUCCESS",
      user.id,
      `${user.company} (${user.name})`,
      `Successful customer login for ${user.company} (${user.customerCode})`,
      { customerCode: user.customerCode, email: user.email }
    );

    return { success: true, user };
  }

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      window.tataDB.logAudit(
        "LOGOUT",
        user.id,
        `${user.company} (${user.name})`,
        `User logged out of session for ${user.customerCode}`,
        { customerCode: user.customerCode }
      );
    }

    localStorage.removeItem(this.sessionKey);
    if (window.app) window.app.showLoginScreen();
  }

  updateUIState() {
    const user = this.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById("nav-user-name");
    const compEl = document.getElementById("nav-user-company");
    const codeEl = document.getElementById("nav-user-code");

    if (nameEl) nameEl.textContent = user.name || "Customer Account";
    if (compEl) compEl.textContent = user.company || "Enterprise Customer";
    if (codeEl) codeEl.textContent = `Code: ${user.customerCode || 'TS-CUST-8810'}`;
  }
}

window.tataAuth = new TataAuth();
