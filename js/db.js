/**
 * Tata Steel Customer Portal - Data & LocalStorage Engine
 * Includes Automated Audit & Transaction Logging Engine for Change Verification
 */

class TataDatabase {
  constructor() {
    this.storageKey = "TataSteel_CustomerPortal_DB_v2";
    this.init();
  }

  init() {
    // Re-seed data to ensure user-provided product image paths are applied
    this.seedInitialData();
  }

  seedInitialData() {
    const initialData = {
      users: window.TATA_SEED_DATA.users,
      products: window.TATA_SEED_DATA.products,
      orders: window.TATA_SEED_DATA.orders,
      rfqs: window.TATA_SEED_DATA.rfqs,
      dispatches: window.TATA_SEED_DATA.dispatches,
      certificates: window.TATA_SEED_DATA.certificates,
      offices: window.TATA_SEED_DATA.offices,
      tickets: [],
      sustainabilityMetrics: window.TATA_SEED_DATA.sustainabilityMetrics,
      auditLogs: [
        {
          id: "LOG-INIT-001",
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          formattedTime: new Date(Date.now() - 86400000 * 2).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }),
          actionType: "SYSTEM_INIT",
          actorId: "usr_01",
          actorName: "L&T Construction (Rajesh Sharma)",
          details: "Initialized Enterprise Account TS-LNT-2026 with default commercial order history.",
          payload: { systemVersion: "v2.4.0", plantWorks: ["Jamshedpur", "Kalinganagar"] }
        },
        {
          id: "LOG-INIT-002",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          formattedTime: new Date(Date.now() - 86400000).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }),
          actionType: "SYSTEM_INIT",
          actorId: "usr_02",
          actorName: "Tata Motors Ltd (Anish Kulkarni)",
          details: "Initialized Enterprise Account TS-TML-2026 with automotive coil allocation.",
          payload: { systemVersion: "v2.4.0", plantWorks: ["Kalinganagar"] }
        }
      ]
    };
    localStorage.setItem(this.storageKey, JSON.stringify(initialData));
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.seedInitialData();
    } catch (e) {
      console.error("Error reading LocalStorage DB, re-seeding data", e);
      this.seedInitialData();
      return JSON.parse(localStorage.getItem(this.storageKey));
    }
  }

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving data to LocalStorage", e);
    }
  }

  // --- Automated Audit & Transaction Activity Logger ---

  logAudit(actionType, actorId, actorName, details, payload = {}) {
    const db = this.load();
    if (!db.auditLogs) db.auditLogs = [];

    const logEntry = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }),
      actionType: actionType,
      actorId: actorId || "GUEST",
      actorName: actorName || "System / Public User",
      details: details,
      payload: payload
    };

    db.auditLogs.unshift(logEntry);
    this.save(db);
    return logEntry;
  }

  getAuditLogs(filterUserId = null) {
    const db = this.load();
    const logs = db.auditLogs || [];
    if (!filterUserId) return logs;
    return logs.filter(l => l.actorId === filterUserId);
  }

  clearAuditLogs() {
    const db = this.load();
    db.auditLogs = [];
    this.save(db);
    return { success: true };
  }

  // --- Users Methods ---

  getUsers() {
    return this.load().users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(user) {
    const db = this.load();
    db.users.push(user);
    this.save(db);

    this.logAudit(
      "USER_REGISTERED",
      user.id,
      `${user.company} (${user.name})`,
      `Registered new customer account with code ${user.customerCode}`,
      { customerCode: user.customerCode, email: user.email, phone: user.phone, company: user.company }
    );

    return user;
  }

  deleteUser(userId) {
    const db = this.load();
    const userToDelete = db.users.find(u => u.id === userId);
    const companyName = userToDelete ? userToDelete.company : userId;
    const code = userToDelete ? userToDelete.customerCode : "N/A";

    db.users = db.users.filter(u => u.id !== userId);
    db.orders = db.orders.filter(o => o.userId !== userId);
    db.rfqs = db.rfqs.filter(r => r.userId !== userId);
    this.save(db);

    this.logAudit(
      "ACCOUNT_DELETED",
      userId,
      companyName,
      `Removed enterprise account ${companyName} (${code}) from database`,
      { deletedUserId: userId, customerCode: code }
    );

    const activeSession = JSON.parse(localStorage.getItem("TataSteel_ActiveSession_v1") || "{}");
    if (activeSession && activeSession.userId === userId) {
      localStorage.removeItem("TataSteel_ActiveSession_v1");
    }
    return { success: true };
  }

  resetPassword(identifier, newPassword) {
    const db = this.load();
    const cleanId = identifier.trim().toLowerCase();
    const userIndex = db.users.findIndex(u => 
      (u.customerCode && u.customerCode.toLowerCase() === cleanId) || 
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.id && u.id.toLowerCase() === cleanId)
    );

    if (userIndex === -1) {
      return { success: false, error: "Customer Code or Email not found." };
    }

    const user = db.users[userIndex];
    db.users[userIndex].passwordHash = newPassword;
    this.save(db);

    this.logAudit(
      "PASSWORD_RESET",
      user.id,
      `${user.company} (${user.name})`,
      `Password successfully reset for Customer Code ${user.customerCode}`,
      { customerCode: user.customerCode, email: user.email }
    );

    return { success: true, user: db.users[userIndex] };
  }

  // --- Products Methods ---

  getProducts() {
    return this.load().products || [];
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  // --- Orders & RFQs Methods ---

  getOrders(userId = null) {
    const orders = this.load().orders || [];
    if (!userId) return orders;
    return orders.filter(o => o.userId === userId);
  }

  getOrderById(orderId) {
    const orders = this.load().orders || [];
    return orders.find(o => o.id === orderId);
  }

  addOrder(order) {
    const db = this.load();
    db.orders.unshift(order);
    this.save(db);

    const user = this.getUserById(order.userId);
    const actorName = user ? `${user.company} (${user.name})` : "Customer";

    this.logAudit(
      "PO_CREATED",
      order.userId,
      actorName,
      `Issued Purchase Order ${order.id} for ${order.tonnage} MT of ${order.productName}`,
      { orderId: order.id, tonnage: order.tonnage, totalAmount: order.totalAmount, heatNumber: order.heatNumber }
    );

    return order;
  }

  getRFQs(userId = null) {
    const rfqs = this.load().rfqs || [];
    if (!userId) return rfqs;
    return rfqs.filter(r => r.userId === userId);
  }

  addRFQ(rfq) {
    const db = this.load();
    db.rfqs.unshift(rfq);
    this.save(db);

    const user = this.getUserById(rfq.userId);
    const actorName = user ? `${user.company} (${user.name})` : "Customer";

    this.logAudit(
      "RFQ_CREATED",
      rfq.userId,
      actorName,
      `Created commercial quotation ${rfq.id} for ${rfq.quantityTons} MT to ${rfq.destinationCity}`,
      { rfqId: rfq.id, quantityTons: rfq.quantityTons, totalEstimatedCost: rfq.totalEstimatedCost }
    );

    return rfq;
  }

  // --- Dispatch & Logistics Tracking ---

  getDispatches(userId = null) {
    const dispatches = this.load().dispatches || [];
    if (!userId) return dispatches;
    const userOrders = this.getOrders(userId).map(o => o.id);
    return dispatches.filter(d => userOrders.includes(d.orderId));
  }

  getDispatchByOrderId(orderId) {
    if (!orderId) return null;
    return (this.load().dispatches || []).find(d => d.orderId === orderId);
  }

  // --- Mill Test Certificates (MTC) Methods ---

  getCertificates() {
    return this.load().certificates || [];
  }

  getCertificateByHeatNo(heatNo) {
    if (!heatNo) return this.getCertificates()[0];
    const cert = this.getCertificates().find(c => c.heatNumber.toLowerCase() === heatNo.toLowerCase());
    return cert || this.getCertificates()[0];
  }

  getAllMTCs(userId = null) {
    const certificates = this.getCertificates();
    const map = {};

    if (!userId) {
      certificates.forEach(c => { map[c.heatNumber] = c; });
      return map;
    }

    const userOrders = this.getOrders(userId);
    const userHeatNos = userOrders.map(o => o.heatNumber);

    certificates.forEach(c => {
      if (userHeatNos.length === 0 || userHeatNos.includes(c.heatNumber)) {
        map[c.heatNumber] = c;
      }
    });

    if (Object.keys(map).length === 0) {
      certificates.forEach(c => { map[c.heatNumber] = c; });
    }

    return map;
  }

  getMTCByHeat(heatNo) {
    return this.getCertificateByHeatNo(heatNo);
  }

  // --- Commercial Support Tickets ---

  createSupportTicket(ticket) {
    const db = this.load();
    const newTicket = {
      id: `TCK-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      status: "Open",
      ...ticket
    };
    db.tickets.unshift(newTicket);
    this.save(db);

    const activeUser = JSON.parse(localStorage.getItem("TataSteel_ActiveSession_v1") || "{}");
    const user = activeUser.userId ? this.getUserById(activeUser.userId) : null;

    this.logAudit(
      "TICKET_CREATED",
      activeUser.userId || "GUEST",
      user ? `${user.company} (${user.name})` : "Guest User",
      `Logged support inquiry ${newTicket.id}: ${newTicket.subject}`,
      { ticketId: newTicket.id, category: newTicket.category }
    );

    return newTicket;
  }
}

window.tataDB = new TataDatabase();
