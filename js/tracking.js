/**
 * Tata Steel Customer Portal - Live Supply Chain & Dispatch Tracking Module
 */

class DispatchTracker {
  constructor() {
    this.containerId = "dispatch-view-container";
  }

  render(orderId = null) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;
    const dispatches = window.tataDB.getDispatches(userId);

    let selectedDispatch = orderId ? window.tataDB.getDispatchByOrderId(orderId) : dispatches[0];

    if (!selectedDispatch && dispatches.length > 0) {
      selectedDispatch = dispatches[0];
    }

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Live Supply Chain & Dispatch Tracker</h2>
          <p class="view-subtitle">Track railway rake and heavy trailer cargo movements for <strong class="text-navy">${user ? user.company : 'Customer'}</strong></p>
        </div>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="window.dispatchTracker.refreshSimulatedFleet()">
            Sync Dispatch Status
          </button>
        </div>
      </div>

      <div class="grid grid-3 gap-6">
        <!-- Active Shipments List for Current Account -->
        <div class="card col-span-1">
          <h3 class="card-title mb-4 pb-2 border-b border-gray-200">Account Active Consignments</h3>
          <div class="shipment-list flex flex-col gap-3">
            ${dispatches.length > 0 ? dispatches.map(d => {
              const order = window.tataDB.getOrderById(d.orderId);
              const isSelected = selectedDispatch && selectedDispatch.orderId === d.orderId;
              return `
                <div class="shipment-card ${isSelected ? 'active' : ''}" onclick="window.dispatchTracker.render('${d.orderId}')">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-mono text-navy font-bold text-sm">${d.orderId}</span>
                    <span class="badge ${d.status === 'In-Transit' ? 'badge-warning' : 'badge-success'}">${d.status}</span>
                  </div>
                  <div class="font-bold text-dark text-sm mb-1">${order ? order.productName : 'Steel Consignment'}</div>
                  <div class="text-xs text-muted mb-2">${d.origin} ➔ ${d.destination ? d.destination.split(',')[0] : 'Siding'}</div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${d.progressPercent}%"></div>
                  </div>
                  <div class="flex justify-between text-xs text-muted mt-2 font-mono">
                    <span>${d.transitMode ? d.transitMode.split(' ')[0] : 'Freight'}</span>
                    <span class="font-bold text-navy">${d.progressPercent}% Dispatched</span>
                  </div>
                </div>
              `;
            }).join('') : `
              <p class="text-muted text-sm py-4 text-center">No active dispatches for this customer account.</p>
            `}
          </div>
        </div>

        <!-- Telemetry Details & Milestone Progress -->
        <div class="card col-span-2">
          ${selectedDispatch ? this.renderDispatchDetails(selectedDispatch) : `
            <div class="empty-state py-8 text-center">
              <p class="text-muted">No active consignment selected for tracking.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderDispatchDetails(d) {
    const order = window.tataDB.getOrderById(d.orderId);

    return `
      <div class="dispatch-detail-header flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-lg text-navy font-bold">${d.orderId}</span>
            <span class="text-xs text-muted font-mono">• Waybill: ${d.trackingNumber}</span>
          </div>
          <h3 class="text-xl font-bold text-dark mb-1">${order ? order.productName : 'Steel Cargo'} (${order ? order.tonnage : ''} Tonnes)</h3>
          <p class="text-sm text-muted">Current Location: <strong class="text-navy font-bold">${d.currentLocation}</strong></p>
        </div>
        <div class="text-right">
          <span class="badge badge-success text-sm py-1 px-3 mb-1">${d.status}</span>
          <div class="text-xs text-muted">Last updated: ${d.lastUpdate}</div>
        </div>
      </div>

      <!-- Telemetry Info Cards -->
      <div class="grid grid-4 gap-4 mb-6">
        <div class="metric-mini-card">
          <div class="metric-label">Freight Mode</div>
          <div class="metric-val text-navy">${d.transitMode ? d.transitMode.split(' ')[0] : 'Rake'}</div>
          <div class="metric-sub">${d.carrier || 'Indian Railways'}</div>
        </div>

        <div class="metric-mini-card">
          <div class="metric-label">Loco Pilot / Driver</div>
          <div class="metric-val text-dark">${d.driverOrMaster ? d.driverOrMaster.split(' ')[0] : 'Operator'}</div>
          <div class="metric-sub">${d.driverOrMaster || 'Assigned'}</div>
        </div>

        <div class="metric-mini-card">
          <div class="metric-label">Freight Speed</div>
          <div class="metric-val text-navy">${d.speedKmh || 45} km/h</div>
          <div class="metric-sub">Average Speed</div>
        </div>

        <div class="metric-mini-card">
          <div class="metric-label">Expected Siding ETA</div>
          <div class="metric-val text-green">${order ? order.expectedDelivery : 'On Schedule'}</div>
          <div class="metric-sub">Logistics SLA</div>
        </div>
      </div>

      <!-- Step Milestone Timeline -->
      <div class="mb-6">
        <h4 class="text-md font-bold text-dark mb-4 pb-2 border-b border-gray-200">Consignment Dispatch Milestones</h4>
        <div class="timeline">
          ${(d.milestones || []).map((m, idx) => `
            <div class="timeline-item ${m.completed ? 'completed' : ''} ${m.active ? 'active' : ''}">
              <div class="timeline-marker">
                ${m.completed ? '✓' : (idx + 1)}
              </div>
              <div class="timeline-content">
                <div class="flex justify-between items-center">
                  <div class="font-bold text-dark text-sm">${m.status}</div>
                  <div class="text-xs font-mono text-muted">${m.time}</div>
                </div>
                <div class="text-xs text-navy mt-1">Location: ${m.location}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Route Status Graphic -->
      <div class="route-map-graphic bg-gray-50 p-4 rounded border border-gray-200">
        <div class="flex justify-between text-xs text-dark font-mono font-bold mb-2">
          <span>ORIGIN MILL: ${d.origin}</span>
          <span>DESTINATION: ${d.destination}</span>
        </div>
        <div class="map-line-container">
          <div class="map-line-fill" style="width: ${d.progressPercent}%"></div>
        </div>
        <div class="flex justify-between text-xs text-muted mt-2 font-mono">
          <span>Dispatch Gate</span>
          <span class="text-navy font-bold">${d.progressPercent}% Completed</span>
          <span>Unloading Siding</span>
        </div>
      </div>
    `;
  }

  refreshSimulatedFleet() {
    const user = window.tataAuth.getCurrentUser();
    const userId = user ? user.id : null;
    const db = window.tataDB.load();
    
    if (db.dispatches) {
      db.dispatches.forEach(d => {
        const order = db.orders.find(o => o.id === d.orderId);
        if (!userId || (order && order.userId === userId)) {
          if (d.progressPercent < 95) {
            d.progressPercent = Math.min(100, d.progressPercent + Math.floor(Math.random() * 5 + 1));
            d.lastUpdate = "Just Now";
          }
        }
      });
      window.tataDB.save(db);
    }
    this.render();
    window.showToast("Dispatch status synced with Tata Logistics Control Center.", "success");
  }
}

window.dispatchTracker = new DispatchTracker();
