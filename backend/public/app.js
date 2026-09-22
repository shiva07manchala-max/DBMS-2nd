
// DriveCare PRO - Vibrant, User-Friendly Full-Stack Application Logic
const API_BASE = window.location.protocol === 'file:' 
  ? 'http://localhost:5000/api' 
  : window.location.origin + '/api';

let currentUser = null;
let currentToken = localStorage.getItem('drivecare_token') || null;
let appState = {
  vehicles: [],
  appointments: [],
  records: [],
  roadside: [],
  centers: [],
  notifications: [],
  stats: null,
  advisorMetrics: null
};

// --- THEME SWITCHER ---
function setThemeAccent(themeName) {
  document.body.className = '';
  if (themeName !== 'blue') {
    document.body.classList.add('theme-' + themeName);
  }
  localStorage.setItem('drivecare_theme', themeName);
  showToast('🎨 UI Theme Accent: ' + themeName.toUpperCase(), '🎨');
}

// Restore saved theme
const savedTheme = localStorage.getItem('drivecare_theme') || 'blue';
if (savedTheme !== 'blue') document.body.classList.add('theme-' + savedTheme);

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  
  if (currentToken) {
    try {
      const res = await apiCall('/auth/me');
      if (res.success && res.user) {
        currentUser = res.user;
        initApp();
        return;
      }
    } catch (e) {
      console.warn('Session expired or invalid token');
    }
  }
  showAuthScreen();
});

// --- API HELPER ---
async function apiCall(endpoint, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (currentToken) {
    headers['Authorization'] = 'Bearer ' + currentToken;
  }
  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const response = await fetch(API_BASE + endpoint, config);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'API request failed');
  }
  return result;
}

// --- AUTHENTICATION ---
function setAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await apiCall('/auth/login', 'POST', { email, password });
    currentToken = res.token;
    currentUser = res.user;
    localStorage.setItem('drivecare_token', currentToken);
    showToast('Welcome back, ' + currentUser.name + '!', '👋');
    initApp();
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const role = document.getElementById('reg-role').value;

  try {
    const res = await apiCall('/auth/register', 'POST', { name, email, password, phone, role });
    currentToken = res.token;
    currentUser = res.user;
    localStorage.setItem('drivecare_token', currentToken);
    showToast('Account registered successfully!', '🎉');
    initApp();
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

function handleLogout() {
  localStorage.removeItem('drivecare_token');
  currentToken = null;
  currentUser = null;
  showToast('Logged out successfully', '👋');
  showAuthScreen();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
}

// --- APP CORE INITIALIZATION ---
async function initApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');

  // Update Topbar
  const isAdvisor = currentUser.role === 'advisor' || currentUser.role === 'admin';
  document.getElementById('role-pill-text').textContent = isAdvisor ? 'Workshop Advisor' : 'Vehicle Owner';
  document.getElementById('role-pill-indicator').style.color = isAdvisor ? '#fbbf24' : '#34d399';
  document.getElementById('user-avatar-initials').textContent = currentUser.avatarInitials || 'MS';
  document.getElementById('dash-user-name').textContent = currentUser.name.split(' ')[0];

  // Advisor category in sidebar
  const advCat = document.getElementById('advisor-category');
  if (advCat) advCat.style.display = isAdvisor ? 'block' : 'none';
  const advNav = document.querySelector('[data-page="advisor"]');
  if (advNav) advNav.style.display = isAdvisor ? 'flex' : 'none';

  // Load data
  await Promise.all([
    fetchDashboardStats(),
    fetchVehicles(),
    fetchAppointments(),
    fetchServiceRecords(),
    fetchRoadsideRequests(),
    fetchServiceCenters(),
    fetchNotifications()
  ]);

  if (isAdvisor) {
    await fetchAdvisorAnalytics();
  }

  populateModalDropdowns();
  navigateTo('dashboard');
  if (window.lucide) lucide.createIcons();
}

// --- NAVIGATION ---
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === pageId);
  });
  document.querySelectorAll('.mobile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === pageId);
  });

  if (pageId === 'profile') populateProfileForm();
  if (pageId === 'services') renderServicesCatalog();
  if (pageId === 'advisor') renderAdvisorPortal();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
}

// --- DATA FETCHING ---
async function fetchDashboardStats() {
  try {
    const res = await apiCall('/analytics/dashboard');
    if (res.success) {
      appState.stats = res.stats;
      document.getElementById('stat-vehicles').textContent = res.stats.totalVehicles;
      document.getElementById('stat-bookings').textContent = res.stats.upcomingBookings;
      document.getElementById('stat-health').textContent = res.stats.avgHealthScore + '%';
      document.getElementById('stat-spent').textContent = '₹' + res.stats.totalSpent.toLocaleString();
      renderDashboardOverview();
    }
  } catch (e) {
    console.error('Stats fetch error:', e);
  }
}

async function fetchVehicles() {
  try {
    const res = await apiCall('/vehicles');
    if (res.success) {
      appState.vehicles = res.vehicles;
      renderVehiclesList();
    }
  } catch (e) {
    console.error('Vehicles error:', e);
  }
}

async function fetchAppointments() {
  try {
    const res = await apiCall('/appointments');
    if (res.success) {
      appState.appointments = res.appointments;
      renderBookingsTable();
    }
  } catch (e) {
    console.error('Appointments error:', e);
  }
}

async function fetchServiceRecords() {
  try {
    const res = await apiCall('/service-records');
    if (res.success) {
      appState.records = res.records;
      renderRecordsTable();
    }
  } catch (e) {
    console.error('Records error:', e);
  }
}

async function fetchRoadsideRequests() {
  try {
    const res = await apiCall('/roadside');
    if (res.success) {
      appState.roadside = res.requests;
      renderRoadsideList();
    }
  } catch (e) {
    console.error('Roadside error:', e);
  }
}

async function fetchServiceCenters() {
  try {
    const res = await apiCall('/service-centers');
    if (res.success) {
      appState.centers = res.centers;
      renderServiceCentersList(res.centers);
    }
  } catch (e) {
    console.error('Centers error:', e);
  }
}

async function fetchNotifications() {
  try {
    const res = await apiCall('/notifications');
    if (res.success) {
      appState.notifications = res.notifications;
      const unreadBadge = document.getElementById('unread-badge');
      if (res.unreadCount > 0) {
        unreadBadge.classList.remove('hidden');
      } else {
        unreadBadge.classList.add('hidden');
      }
      renderNotificationsDrawer();
    }
  } catch (e) {
    console.error('Notifications error:', e);
  }
}

async function fetchAdvisorAnalytics() {
  try {
    const res = await apiCall('/analytics/advisor');
    if (res.success) {
      appState.advisorMetrics = res.metrics;
    }
  } catch (e) {
    console.error('Advisor analytics error:', e);
  }
}

// --- VIBRANT RENDERING METHODS ---

// Dashboard Overview
function renderDashboardOverview() {
  // Upcoming appointments
  const apptContainer = document.getElementById('dash-appointments-container');
  const upcoming = appState.appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');

  if (upcoming.length === 0) {
    apptContainer.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-muted)">
        <p style="margin-bottom:14px;font-size:14px">✨ All scheduled maintenance is complete!</p>
        <button class="btn btn-primary btn-sm" onclick="openBookingModal()">Book New Service</button>
      </div>`;
  } else {
    let html = '<div style="display:flex;flex-direction:column;gap:14px">';
    upcoming.slice(0, 3).forEach(apt => {
      const vName = apt.vehicle ? `${apt.vehicle.make} ${apt.vehicle.model}` : 'Vehicle';
      const cName = apt.serviceCenter ? apt.serviceCenter.name : 'Authorized Hub';
      const dt = new Date(apt.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let badgeClass = 'badge-primary';
      if (apt.status === 'Confirmed') badgeClass = 'badge-success';
      if (apt.status === 'In-Progress') badgeClass = 'badge-warning';

      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:linear-gradient(135deg,rgba(15,25,48,0.7),rgba(10,16,30,0.85));border-radius:var(--radius-sm);border:1px solid var(--border-glass);box-shadow:0 4px 15px rgba(0,0,0,0.25)">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:grid;place-items:center;color:#60a5fa;font-size:20px">🛠️</div>
            <div>
              <b style="color:#fff;font-size:14.5px">${vName}</b>
              <div style="color:var(--text-dim);font-size:12px">${apt.serviceType} • ${cName}</div>
            </div>
          </div>
          <div style="text-align:right">
            <span class="badge ${badgeClass}">● ${apt.status}</span>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;font-weight:600">${dt} at ${apt.timeSlot}</div>
          </div>
        </div>`;
    });
    html += '</div>';
    apptContainer.innerHTML = html;
  }

  // Health Snapshot
  const healthBox = document.getElementById('dash-vehicle-health-box');
  if (appState.vehicles.length === 0) {
    healthBox.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Register a vehicle to view health telemetry.</p>';
  } else {
    const v = appState.vehicles[0];
    const score = v.healthScore || 92;
    const h = v.healthDetails || { engine: 94, battery: 90, brakes: 86, tyres: 92, fluids: 96 };
    
    healthBox.innerHTML = `
      <div style="background:linear-gradient(145deg,rgba(15,25,48,0.6),rgba(8,14,28,0.8));padding:18px;border-radius:var(--radius-sm);border:1px solid var(--border-glass)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div>
            <span class="badge badge-success" style="margin-bottom:6px">● PRIMARY VEHICLE</span>
            <h4 style="color:#fff;font-size:16px">${v.make} ${v.model}</h4>
            <div style="color:#60a5fa;font-size:12px;font-family:'Space Grotesk'">${v.plateNumber} • ${(v.mileage || 0).toLocaleString()} KM</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:28px;font-weight:800;color:${score > 85 ? '#34d399' : '#fbbf24'};font-family:'Space Grotesk'">${score}%</div>
            <small style="color:var(--text-dim);font-size:10px;text-transform:uppercase">Health Score</small>
          </div>
        </div>

        <div style="height:8px;background:#0d1629;border-radius:999px;overflow:hidden;margin-bottom:16px">
          <div style="height:100%;width:${score}%;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:999px"></div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
          <div style="background:rgba(8,13,26,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)">
            <span style="color:var(--text-dim)">Engine & Trans:</span> <b style="color:#34d399;float:right">${h.engine}%</b>
          </div>
          <div style="background:rgba(8,13,26,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)">
            <span style="color:var(--text-dim)">Battery Pack:</span> <b style="color:#60a5fa;float:right">${h.battery}%</b>
          </div>
          <div style="background:rgba(8,13,26,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)">
            <span style="color:var(--text-dim)">Brake System:</span> <b style="color:#fbbf24;float:right">${h.brakes}%</b>
          </div>
          <div style="background:rgba(8,13,26,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)">
            <span style="color:var(--text-dim)">Tyre Tread:</span> <b style="color:#34d399;float:right">${h.tyres}%</b>
          </div>
        </div>
      </div>`;
  }
}

// Vehicles Grid
function renderVehiclesList() {
  const container = document.getElementById('vehicles-grid');
  if (!container) return;

  if (appState.vehicles.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column:1/-1;text-align:center;padding:50px">
        <i data-lucide="car" style="width:50px;height:50px;color:var(--text-dim);margin-bottom:14px"></i>
        <h3 style="color:#fff;margin-bottom:8px">No registered vehicles</h3>
        <p style="color:var(--text-muted);font-size:13.5px;margin-bottom:20px">Register your car to begin proactive health monitoring.</p>
        <button class="btn btn-primary" onclick="openAddVehicleModal()">+ Register Vehicle</button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = appState.vehicles.map(v => {
    const score = v.healthScore || 90;
    const h = v.healthDetails || { engine: 92, battery: 88, brakes: 84, tyres: 90, fluids: 95 };
    const w = v.warranty || { status: 'Active', coverageType: 'Comprehensive' };
    const ins = v.insurance || { provider: 'General Insurance' };
    
    // Colorful vehicle icons based on make
    let carIcon = '🚙';
    let cardGradient = 'linear-gradient(145deg, rgba(23, 37, 84, 0.5), rgba(10, 16, 30, 0.95))';
    if (v.make.toLowerCase().includes('maruti')) {
      carIcon = '🚗';
      cardGradient = 'linear-gradient(145deg, rgba(136, 19, 55, 0.4), rgba(10, 16, 30, 0.95))';
    } else if (v.fuelType === 'Electric') {
      carIcon = '⚡';
      cardGradient = 'linear-gradient(145deg, rgba(6, 78, 59, 0.4), rgba(10, 16, 30, 0.95))';
    }

    return `
      <div class="vehicle-showcase-card" style="background:${cardGradient}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
          <div>
            <span class="badge badge-success" style="margin-bottom:8px">● WARRANTY ${w.status.toUpperCase()}</span>
            <h3 style="font-size:20px;color:#fff;font-weight:800">${v.make} ${v.model}</h3>
            <div style="color:var(--text-muted);font-size:12.5px;margin-top:2px">${v.year} • ${v.fuelType} • ${v.transmission} • ${v.color}</div>
          </div>
          <div style="font-size:42px;line-height:1">${carIcon}</div>
        </div>

        <!-- License Plate Bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(8,13,26,0.8);padding:12px 16px;border-radius:var(--radius-sm);border:1px solid var(--border-glass);margin-bottom:16px">
          <div>
            <span style="font-size:10.5px;color:var(--text-dim);text-transform:uppercase;font-weight:700">Registration</span>
            <div style="color:#60a5fa;font-family:'Space Grotesk';font-size:15px;font-weight:800">${v.plateNumber}</div>
          </div>
          <div style="text-align:right">
            <span style="font-size:10.5px;color:var(--text-dim);text-transform:uppercase;font-weight:700">Odometer</span>
            <div style="color:#fff;font-size:14px;font-weight:700">${(v.mileage || 0).toLocaleString()} KM</div>
          </div>
        </div>

        <!-- Health Meter -->
        <div style="margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:12px;color:var(--text-muted);font-weight:600">Diagnostics Telemetry</span>
            <span style="font-size:15px;font-weight:800;color:${score > 85 ? '#34d399' : '#fbbf24'};font-family:'Space Grotesk'">${score}% Health</span>
          </div>
          <div style="height:8px;background:#090e1c;border-radius:999px;overflow:hidden">
            <div style="height:100%;width:${score}%;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:999px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-top:6px">
            <span>Engine: ${h.engine}%</span>
            <span>Battery: ${h.battery}%</span>
            <span>Brakes: ${h.brakes}%</span>
            <span>Tyres: ${h.tyres}%</span>
          </div>
        </div>

        <!-- Policy Cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11.5px;background:rgba(8,13,26,0.6);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-glass);margin-bottom:18px">
          <div>
            <div style="color:var(--text-dim)">Insurance Policy</div>
            <b style="color:#e2e8f0">${ins.provider}</b>
          </div>
          <div>
            <div style="color:var(--text-dim)">Warranty Type</div>
            <b style="color:#e2e8f0">${w.coverageType}</b>
          </div>
        </div>

        <div style="display:flex;gap:10px">
          <button class="btn btn-primary btn-sm" style="flex:1" onclick="openBookingForVehicle('${v._id}')">
            🛠️ Book Service
          </button>
          <button class="btn btn-danger btn-sm" onclick="openRoadsideForVehicle('${v._id}')">
            🆘 SOS
          </button>
        </div>
      </div>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

// Services Catalog
function renderServicesCatalog() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const catalog = [
    {
      title: 'Periodic Maintenance Package',
      price: '₹1,999',
      icon: 'wrench',
      color: '#3b82f6',
      badge: 'RECOMMENDED',
      desc: 'Complete synthetic engine oil change, OEM oil & air filters, 40-point diagnostics scan, fluid level top-ups.',
      duration: '3.5 Hours'
    },
    {
      title: 'Laser Wheel & Tyre Care',
      price: '₹499',
      icon: 'disc',
      color: '#06b6d4',
      desc: '3D computerized alignment, 4-wheel dynamic balancing, tyre rotation, and laser tread-depth analysis.',
      duration: '45 Mins'
    },
    {
      title: 'AC Service & Cabin Sterilization',
      price: '₹799',
      icon: 'wind',
      color: '#10b981',
      desc: 'Evaporator cooling check, refrigerant pressure test, condenser decontamination, and ultrasonic ozone anti-bacterial fogging.',
      duration: '1.5 Hours'
    },
    {
      title: 'High-Amp Battery Care',
      price: '₹299',
      icon: 'battery-charging',
      color: '#f59e0b',
      desc: 'Digital load impedance testing, terminal corrosion anti-sulfation coating, and alternator output verification.',
      duration: '30 Mins'
    },
    {
      title: 'Brake Overhaul & Rotor Polishing',
      price: '₹850',
      icon: 'shield-alert',
      color: '#ec4899',
      desc: 'Front and rear disc pad servicing, caliper slider pin greasing, rotor glaze resurfacing, and DOT-4 fluid bleed.',
      duration: '2 Hours'
    },
    {
      title: '40-Point Pre-Trip Inspection',
      price: '₹999',
      icon: 'clipboard-check',
      color: '#8b5cf6',
      badge: 'CERTIFIED',
      desc: 'Rigorous bumper-to-bumper structural, steering, suspension, exhaust, and ECU diagnostic health report.',
      duration: '2.5 Hours'
    }
  ];

  container.innerHTML = catalog.map(item => `
    <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${item.color}"></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:${item.color}">
            <i data-lucide="${item.icon}" style="width:24px;height:24px"></i>
          </div>
          ${item.badge ? `<span class="badge badge-primary">${item.badge}</span>` : ''}
        </div>
        <h3 style="font-size:18px;color:#fff;margin-bottom:8px;font-weight:700">${item.title}</h3>
        <p style="color:var(--text-muted);font-size:13px;line-height:1.6;margin-bottom:18px">${item.desc}</p>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-top:1px solid var(--border-glass);padding-top:14px">
          <div>
            <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase">Package Price</div>
            <div style="font-size:24px;font-weight:800;color:#fff;font-family:'Space Grotesk'">${item.price}</div>
          </div>
          <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px">
            <i data-lucide="clock" style="width:14px"></i> ${item.duration}
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="openBookingModal('${item.title}')">
          Book Package Now →
        </button>
      </div>
    </div>`).join('');
  if (window.lucide) lucide.createIcons();
}

// Bookings Table
function renderBookingsTable() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  if (appState.appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:36px">No service bookings found.</td></tr>';
    return;
  }

  tbody.innerHTML = appState.appointments.map(apt => {
    const vText = apt.vehicle ? `${apt.vehicle.make} ${apt.vehicle.model} (${apt.vehicle.plateNumber})` : 'N/A';
    const cText = apt.serviceCenter ? apt.serviceCenter.name : 'Authorized Hub';
    const dt = new Date(apt.scheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    let pill = 'badge-primary';
    if (apt.status === 'Confirmed') pill = 'badge-success';
    if (apt.status === 'In-Progress') pill = 'badge-warning';
    if (apt.status === 'Cancelled') pill = 'badge-danger';

    return `
      <tr>
        <td><b style="color:#60a5fa;font-family:monospace">#${apt.bookingId}</b></td>
        <td><b style="color:#fff">${vText}</b></td>
        <td>${apt.serviceType}</td>
        <td style="color:var(--text-muted)">${cText}</td>
        <td>${dt}<br><small style="color:var(--text-dim)">${apt.timeSlot}</small></td>
        <td><span class="badge ${pill}">● ${apt.status}</span></td>
        <td>
          ${apt.status !== 'Cancelled' && apt.status !== 'Completed' 
            ? `<button class="btn btn-secondary btn-sm" onclick="cancelBooking('${apt._id}')">Cancel</button>` 
            : `<span style="color:var(--text-dim);font-size:12px">Archived</span>`}
        </td>
      </tr>`;
  }).join('');
}

// Records & Invoices Table
function renderRecordsTable() {
  const tbody = document.getElementById('records-tbody');
  if (!tbody) return;

  if (appState.records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:36px">No service records found.</td></tr>';
    return;
  }

  tbody.innerHTML = appState.records.map(r => {
    const vText = r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}` : 'Vehicle';
    const dt = new Date(r.serviceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isPaid = r.paymentStatus === 'Paid';

    return `
      <tr>
        <td>
          <b style="color:#60a5fa;font-family:monospace">${r.invoiceNumber}</b><br>
          <small style="color:var(--text-dim)">${r.recordId}</small>
        </td>
        <td><b style="color:#fff">${vText}</b></td>
        <td>${r.serviceType}</td>
        <td>${dt}</td>
        <td>${(r.mileageAtService || 0).toLocaleString()} KM</td>
        <td><b style="color:#fff;font-family:'Space Grotesk';font-size:15px">₹${r.grandTotal.toLocaleString()}</b></td>
        <td>
          <span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">✓ ${r.paymentStatus}</span>
        </td>
        <td>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="viewInvoiceModal('${r._id}')">
              📄 Receipt
            </button>
            ${!isPaid ? `<button class="btn btn-primary btn-sm" onclick="payInvoiceOnline('${r._id}')">Pay Now</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');
}

// Emergency Roadside Assistance
function renderRoadsideList() {
  const container = document.getElementById('roadside-requests-list');
  if (!container) return;

  if (appState.roadside.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <i data-lucide="shield-check" style="width:44px;height:44px;color:#34d399;margin-bottom:10px"></i>
        <p style="font-size:14px">No active roadside incidents. Safe travels!</p>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = appState.roadside.map(req => {
    const vText = req.vehicle ? `${req.vehicle.make} ${req.vehicle.model} (${req.vehicle.plateNumber})` : 'Vehicle';
    const mech = req.mechanicAssigned || { name: 'Rapid Response Patrol', phone: '+91 94401 22334', etaMinutes: 14 };
    
    const steps = ['Requested', 'Assigned', 'Dispatched', 'Arrived', 'Resolved'];
    const currentStepIdx = steps.indexOf(req.status);

    return `
      <div style="background:linear-gradient(135deg,rgba(15,25,48,0.7),rgba(10,16,30,0.85));border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-sm);padding:20px;margin-bottom:16px;box-shadow:0 8px 25px rgba(239,68,68,0.15)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div>
            <span class="badge badge-danger">SOS #${req.requestId}</span>
            <h4 style="color:#fff;font-size:17px;margin-top:8px">${req.emergencyType} • ${vText}</h4>
            <div style="color:var(--text-muted);font-size:12.5px;margin-top:2px">📍 ${req.location ? req.location.address : 'Highway Location'}</div>
          </div>
          <div style="text-align:right">
            <span class="badge badge-warning">● ${req.status}</span>
            <div style="color:#f87171;font-weight:800;font-size:15px;margin-top:6px" id="live-eta-${req._id}">ETA: ${mech.etaMinutes} mins</div>
          </div>
        </div>

        <!-- Progress Steps -->
        <div style="display:flex;gap:6px;margin:16px 0 8px">
          ${steps.map((s, idx) => `
            <div style="flex:1;height:6px;border-radius:6px;background:${idx <= currentStepIdx ? '#ef4444' : 'rgba(255,255,255,0.08)'}"></div>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-dim);margin-bottom:16px">
          <span>Requested</span>
          <span>Assigned</span>
          <span>Dispatched</span>
          <span>Arrived</span>
          <span>Resolved</span>
        </div>

        <div style="background:rgba(8,13,26,0.7);padding:14px;border-radius:8px;border:1px solid var(--border-glass);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="color:var(--text-dim);font-size:11px">Assigned Mechanic & Vehicle:</div>
            <b style="color:#fff;font-size:13.5px">${mech.name} (${mech.vanPlate || 'Rescue Unit'})</b>
          </div>
          <a href="tel:${mech.phone}" class="btn btn-secondary btn-sm" style="text-decoration:none;color:#60a5fa">
            📞 Call Mechanic (${mech.phone})
          </a>
        </div>
      </div>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

// Service Centers Locator
function renderServiceCentersList(centers) {
  const container = document.getElementById('centers-grid');
  if (!container) return;

  if (centers.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted)">No service centers match your criteria.</p>';
    return;
  }

  container.innerHTML = centers.map(c => `
    <div class="card" style="display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div>
            <span class="badge badge-primary" style="margin-bottom:6px">${c.code}</span>
            <h3 style="font-size:18px;color:#fff;font-weight:700">${c.name}</h3>
          </div>
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;padding:6px 10px;border-radius:8px;font-weight:800;font-size:13px;box-shadow:0 4px 12px rgba(59,130,246,0.3)">
            ★ ${c.rating}
          </div>
        </div>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:14px">📍 ${c.address}, ${c.city}</p>
        
        <div style="background:rgba(8,13,26,0.7);padding:12px;border-radius:var(--radius-sm);font-size:12px;color:var(--text-muted);margin-bottom:14px">
          <div>🕒 <b>Hours:</b> ${c.operatingHours}</div>
          <div style="margin-top:6px">🚗 <b>Bay Capacity:</b> <span style="color:#34d399;font-weight:700">${c.availableBays} bays open</span> / ${c.totalBays} total</div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px">
          ${(c.servicesOffered || []).map(s => `<span class="badge" style="background:rgba(255,255,255,0.06);color:#cbd5e1;font-size:10.5px">${s}</span>`).join('')}
        </div>
      </div>

      <div style="display:flex;gap:12px;border-top:1px solid var(--border-glass);padding-top:16px">
        <a href="tel:${c.phone}" class="btn btn-secondary btn-sm" style="flex:1;text-decoration:none">
          📞 ${c.phone}
        </a>
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="openBookingWithCenter('${c._id}')">
          Book Here
        </button>
      </div>
    </div>`).join('');
}

function filterServiceCenters(term) {
  const t = term.toLowerCase().trim();
  const filtered = appState.centers.filter(c => 
    c.name.toLowerCase().includes(t) || 
    c.city.toLowerCase().includes(t) || 
    c.address.toLowerCase().includes(t)
  );
  renderServiceCentersList(filtered);
}

// Advisor Workshop Portal
function renderAdvisorPortal() {
  if (!appState.advisorMetrics) return;
  const m = appState.advisorMetrics;

  const metricsGrid = document.getElementById('advisor-metrics-grid');
  if (metricsGrid) {
    metricsGrid.innerHTML = `
      <div class="stat-card stat-green">
        <div class="stat-header"><span class="stat-title">Gross Revenue</span><i data-lucide="trending-up" style="color:#10b981;width:22px"></i></div>
        <div class="stat-value">₹${(m.grossRevenue || 0).toLocaleString()}</div>
        <small style="color:#34d399;font-size:11.5px">● Aggregated from all paid invoices</small>
      </div>
      <div class="stat-card">
        <div class="stat-header"><span class="stat-title">Customer Appointments</span><i data-lucide="calendar" style="color:#60a5fa;width:22px"></i></div>
        <div class="stat-value">${m.totalAppointments}</div>
        <small style="color:var(--text-dim);font-size:11.5px">Scheduled bookings</small>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-header"><span class="stat-title">Fleet Vehicles</span><i data-lucide="car" style="color:#a78bfa;width:22px"></i></div>
        <div class="stat-value">${m.totalVehicles}</div>
        <small style="color:var(--text-dim);font-size:11.5px">Registered automobiles</small>
      </div>
      <div class="stat-card stat-gold">
        <div class="stat-header"><span class="stat-title">Digital Records</span><i data-lucide="receipt" style="color:#fbbf24;width:22px"></i></div>
        <div class="stat-value">${m.totalInvoices}</div>
        <small style="color:var(--text-dim);font-size:11.5px">Historical service records</small>
      </div>`;
  }

  const bTbody = document.getElementById('advisor-bookings-tbody');
  const bCount = document.getElementById('advisor-booking-count');
  if (bCount) bCount.textContent = appState.appointments.length + ' Bookings';

  if (bTbody) {
    bTbody.innerHTML = appState.appointments.map(apt => {
      const cust = apt.user ? apt.user.name : 'Customer';
      const veh = apt.vehicle ? `${apt.vehicle.make} ${apt.vehicle.model}` : 'Car';
      const dt = new Date(apt.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return `
        <tr>
          <td><b style="color:#60a5fa;font-family:monospace">#${apt.bookingId}</b></td>
          <td><b style="color:#fff">${cust}</b></td>
          <td>${veh}</td>
          <td>${apt.serviceType}</td>
          <td>${dt}, ${apt.timeSlot}</td>
          <td><span class="badge badge-primary">● ${apt.status}</span></td>
          <td>
            <select onchange="updateAppointmentStatusAdvisor('${apt._id}', this.value)" style="padding:6px 10px;font-size:12px;background:#0d1629">
              <option value="">Update Status...</option>
              <option value="Confirmed" ${apt.status==='Confirmed'?'selected':''}>Confirmed</option>
              <option value="In-Progress" ${apt.status==='In-Progress'?'selected':''}>In-Progress</option>
              <option value="Completed" ${apt.status==='Completed'?'selected':''}>Completed</option>
              <option value="Cancelled" ${apt.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select>
          </td>
        </tr>`;
    }).join('');
  }

  const rTbody = document.getElementById('advisor-roadside-tbody');
  if (rTbody) {
    rTbody.innerHTML = appState.roadside.map(r => {
      const cust = r.user ? r.user.name : 'Customer';
      const veh = r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}` : 'Vehicle';
      const loc = r.location ? r.location.address : 'Roadside';

      return `
        <tr>
          <td><b style="color:#f87171;font-family:monospace">#${r.requestId}</b></td>
          <td><b style="color:#fff">${cust}</b></td>
          <td>${veh}</td>
          <td>${r.emergencyType}</td>
          <td style="color:var(--text-muted);font-size:12px">${loc}</td>
          <td><span class="badge badge-warning">● ${r.status}</span></td>
          <td>
            <select onchange="updateRoadsideStatusAdvisor('${r._id}', this.value)" style="padding:6px 10px;font-size:12px;background:#0d1629">
              <option value="">Change SOS...</option>
              <option value="Assigned" ${r.status==='Assigned'?'selected':''}>Assigned</option>
              <option value="Dispatched" ${r.status==='Dispatched'?'selected':''}>Dispatched</option>
              <option value="Arrived" ${r.status==='Arrived'?'selected':''}>Arrived</option>
              <option value="Resolved" ${r.status==='Resolved'?'selected':''}>Resolved</option>
            </select>
          </td>
        </tr>`;
    }).join('');
  }

  if (window.lucide) lucide.createIcons();
}

// Profile Page
function populateProfileForm() {
  if (!currentUser) return;
  document.getElementById('profile-card-name').textContent = currentUser.name;
  document.getElementById('profile-card-role').textContent = currentUser.role === 'advisor' ? 'Workshop Service Advisor' : 'Vehicle Owner';
  document.getElementById('profile-avatar-big').textContent = currentUser.avatarInitials || 'MS';
  document.getElementById('profile-loyalty-pts').textContent = (currentUser.loyaltyPoints || 500).toLocaleString() + ' Pts';

  document.getElementById('prof-name').value = currentUser.name || '';
  document.getElementById('prof-email').value = currentUser.email || '';
  document.getElementById('prof-phone').value = currentUser.phone || '';
  document.getElementById('prof-city').value = currentUser.city || '';
  document.getElementById('prof-address').value = currentUser.address || '';
  document.getElementById('prof-lang').value = currentUser.preferredLanguage || 'English';
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const name = document.getElementById('prof-name').value.trim();
  const phone = document.getElementById('prof-phone').value.trim();
  const city = document.getElementById('prof-city').value.trim();
  const address = document.getElementById('prof-address').value.trim();
  const preferredLanguage = document.getElementById('prof-lang').value;

  try {
    const res = await apiCall('/auth/profile', 'PUT', { name, phone, city, address, preferredLanguage });
    if (res.success) {
      currentUser = res.user;
      showToast('Profile updated successfully!', '✅');
      populateProfileForm();
    }
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

// Notifications Drawer
function toggleNotifications() {
  const drawer = document.getElementById('notif-drawer');
  const isOpen = drawer.style.transform === 'translateX(0px)';
  drawer.style.transform = isOpen ? 'translateX(100%)' : 'translateX(0px)';
}

function renderNotificationsDrawer() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (appState.notifications.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:24px">No alerts at this moment.</p>';
    return;
  }

  list.innerHTML = appState.notifications.map(n => `
    <div style="background:${n.isRead ? 'rgba(10,16,30,0.7)' : 'rgba(30,58,138,0.2)'};border:1px solid ${n.isRead ? 'var(--border-glass)' : 'var(--primary)'};padding:14px;border-radius:var(--radius-sm)">
      <b style="color:#fff;font-size:13.5px;display:block">${n.title}</b>
      <p style="color:var(--text-muted);font-size:12.5px;margin:6px 0 8px">${n.message}</p>
      <small style="color:var(--text-dim);font-size:11px">${new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
    </div>
  `).join('');
}

async function markAllNotificationsRead() {
  try {
    await apiCall('/notifications/mark-all-read', 'POST');
    document.getElementById('unread-badge').classList.add('hidden');
    appState.notifications.forEach(n => n.isRead = true);
    renderNotificationsDrawer();
    showToast('All notifications marked as read', '✓');
  } catch (e) {
    showToast('❌ ' + e.message, '⚠️');
  }
}

// --- MODAL CONTROLS & HANDLERS ---
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function populateModalDropdowns() {
  const vOpts = appState.vehicles.map(v => `<option value="${v._id}">${v.make} ${v.model} (${v.plateNumber})</option>`).join('');
  const bVeh = document.getElementById('book-vehicle-select');
  if (bVeh) bVeh.innerHTML = vOpts;
  const sVeh = document.getElementById('sos-vehicle-select');
  if (sVeh) sVeh.innerHTML = vOpts;
  const aVeh = document.getElementById('adv-veh-select');
  if (aVeh) aVeh.innerHTML = vOpts;

  const cOpts = appState.centers.map(c => `<option value="${c._id}">${c.name} (${c.city})</option>`).join('');
  const bCenter = document.getElementById('book-center-select');
  if (bCenter) bCenter.innerHTML = cOpts;

  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  const bDate = document.getElementById('book-date');
  if (bDate) bDate.value = tom.toISOString().split('T')[0];
}

function openBookingModal(serviceName = null) {
  populateModalDropdowns();
  if (serviceName) {
    const bServ = document.getElementById('book-service-select');
    if (bServ) {
      for (let i = 0; i < bServ.options.length; i++) {
        if (bServ.options[i].value.includes(serviceName) || serviceName.includes(bServ.options[i].value)) {
          bServ.selectedIndex = i;
          break;
        }
      }
    }
  }
  document.getElementById('modal-booking').classList.remove('hidden');
}

function openBookingForVehicle(vehicleId) {
  openBookingModal();
  const bVeh = document.getElementById('book-vehicle-select');
  if (bVeh) bVeh.value = vehicleId;
}

function openBookingWithCenter(centerId) {
  openBookingModal();
  const bCenter = document.getElementById('book-center-select');
  if (bCenter) bCenter.value = centerId;
}

function togglePickupAddress(checked) {
  const addr = document.getElementById('book-pickup-address');
  addr.classList.toggle('hidden', !checked);
  if (checked && currentUser && currentUser.address) {
    addr.value = currentUser.address;
  }
}

async function handleConfirmBooking(e) {
  e.preventDefault();
  const vehicleId = document.getElementById('book-vehicle-select').value;
  const serviceType = document.getElementById('book-service-select').value;
  const serviceCenterId = document.getElementById('book-center-select').value;
  const scheduledDate = document.getElementById('book-date').value;
  const timeSlot = document.getElementById('book-slot').value;
  const pickupDropRequired = document.getElementById('book-pickup').checked;
  const pickupAddress = document.getElementById('book-pickup-address').value;
  const customerNotes = document.getElementById('book-notes').value;

  try {
    const res = await apiCall('/appointments', 'POST', {
      vehicleId,
      serviceType,
      serviceCenterId,
      scheduledDate,
      timeSlot,
      pickupDropRequired,
      pickupAddress,
      customerNotes
    });

    closeModal('modal-booking');
    showToast('Appointment Confirmed! #' + res.appointment.bookingId, '🎉');
    await fetchAppointments();
    await fetchDashboardStats();
    await fetchNotifications();
    navigateTo('bookings');
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    await apiCall(`/appointments/${id}/status`, 'PATCH', { status: 'Cancelled' });
    showToast('Appointment cancelled', 'ℹ️');
    await fetchAppointments();
    await fetchDashboardStats();
  } catch (e) {
    showToast('❌ ' + e.message, '⚠️');
  }
}

function openAddVehicleModal() {
  document.getElementById('modal-vehicle').classList.remove('hidden');
}

async function handleCreateVehicle(e) {
  e.preventDefault();
  const make = document.getElementById('veh-make').value.trim();
  const model = document.getElementById('veh-model').value.trim();
  const year = Number(document.getElementById('veh-year').value);
  const plateNumber = document.getElementById('veh-plate').value.trim();
  const fuelType = document.getElementById('veh-fuel').value;
  const transmission = document.getElementById('veh-transmission').value;
  const mileage = Number(document.getElementById('veh-mileage').value);
  const color = document.getElementById('veh-color').value.trim();

  try {
    const res = await apiCall('/vehicles', 'POST', {
      make, model, year, plateNumber, fuelType, transmission, mileage, color
    });
    closeModal('modal-vehicle');
    showToast('Vehicle ' + res.vehicle.make + ' added to garage!', '🚘');
    await fetchVehicles();
    await fetchDashboardStats();
    populateModalDropdowns();
    navigateTo('vehicles');
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

function openRoadsideModal() {
  populateModalDropdowns();
  if (currentUser && currentUser.phone) {
    document.getElementById('sos-phone').value = currentUser.phone;
  }
  document.getElementById('modal-roadside').classList.remove('hidden');
}

function openRoadsideForVehicle(vehicleId) {
  openRoadsideModal();
  const sVeh = document.getElementById('sos-vehicle-select');
  if (sVeh) sVeh.value = vehicleId;
}

async function handleConfirmRoadside(e) {
  e.preventDefault();
  const vehicleId = document.getElementById('sos-vehicle-select').value;
  const emergencyType = document.getElementById('sos-type-select').value;
  const contactPhone = document.getElementById('sos-phone').value.trim();
  const address = document.getElementById('sos-address').value.trim();
  const urgency = document.getElementById('sos-urgency').value;

  try {
    const res = await apiCall('/roadside', 'POST', {
      vehicleId, emergencyType, contactPhone, address, urgency
    });
    closeModal('modal-roadside');
    showToast('🚨 SOS Dispatched! Rapid response unit en route.', '🚨');
    await fetchRoadsideRequests();
    await fetchNotifications();
    navigateTo('roadside');
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

async function viewInvoiceModal(recordId) {
  try {
    const res = await apiCall(`/service-records/${recordId}`);
    const r = res.record;
    const v = r.vehicle || {};
    const c = r.serviceCenter || {};
    const u = r.user || {};
    const dt = new Date(r.serviceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const content = `
      <div style="padding:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:1px solid var(--border-glass);padding-bottom:18px">
          <div>
            <div style="font-size:24px;font-weight:800;color:#fff">🚗 DriveCare <span style="color:#60a5fa">PRO</span></div>
            <div style="color:var(--text-muted);font-size:13px">${c.name || 'Flagship Workshop Hub'}</div>
            <div style="color:var(--text-dim);font-size:11.5px">${c.address || 'Hyderabad'}, Phone: ${c.phone || '+91 40 4567 8900'}</div>
          </div>
          <div style="text-align:right">
            <h2 style="font-size:20px;color:#fff;margin-bottom:4px;letter-spacing:1px">TAX INVOICE</h2>
            <div style="color:#60a5fa;font-family:monospace;font-weight:700">#${r.invoiceNumber}</div>
            <div style="font-size:12px;color:var(--text-muted)">Date: ${dt}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:rgba(8,13,26,0.8);padding:18px;border-radius:var(--radius-sm);border:1px solid var(--border-glass);margin-bottom:22px;font-size:13px">
          <div>
            <span style="color:var(--text-dim);display:block;font-size:11px;text-transform:uppercase;font-weight:700">Customer Details</span>
            <b style="color:#fff;font-size:14px">${u.name || 'Customer'}</b>
            <div style="color:var(--text-muted)">${u.phone || '+91 98765 43210'}</div>
            <div style="color:var(--text-muted)">${u.address || 'Hyderabad, Telangana'}</div>
          </div>
          <div>
            <span style="color:var(--text-dim);display:block;font-size:11px;text-transform:uppercase;font-weight:700">Vehicle Serviced</span>
            <b style="color:#fff;font-size:14px">${v.make || ''} ${v.model || ''} (${v.year || ''})</b>
            <div style="color:#60a5fa;font-family:'Space Grotesk'">${v.plateNumber || ''}</div>
            <div style="color:var(--text-muted)">Odometer: ${(r.mileageAtService || 0).toLocaleString()} KM</div>
          </div>
        </div>

        <h4 style="font-size:14px;color:#fff;margin-bottom:12px">Parts, Consumables & Labor Itemization:</h4>
        <table class="data-table" style="margin-bottom:20px">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(r.items || []).map(it => `
              <tr>
                <td>${it.description}</td>
                <td><span class="badge badge-primary">${it.category}</span></td>
                <td style="text-align:right;font-family:'Space Grotesk';font-weight:700">₹${Number(it.cost).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex;justify-content:flex-end">
          <div style="width:280px;font-size:13px;background:rgba(8,13,26,0.8);padding:16px;border-radius:var(--radius-sm);border:1px solid var(--border-glass)">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:var(--text-muted)">Subtotal:</span>
              <span>₹${(r.grandTotal - r.taxAmount).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:var(--text-muted)">GST (18%):</span>
              <span>₹${r.taxAmount.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border-glass);padding-top:10px;font-size:16px;font-weight:800;color:#34d399">
              <span>Total Paid:</span>
              <span>₹${r.grandTotal.toLocaleString()}</span>
            </div>
            <div style="margin-top:10px;text-align:center">
              <span class="badge badge-success" style="font-size:12px">✓ PAID via ${r.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div style="margin-top:24px;font-size:11.5px;color:var(--text-dim);border-top:1px dashed var(--border-glass);padding-top:14px;display:flex;justify-content:space-between">
          <span>Master Technician: ${r.technicianName}</span>
          <span>Verified GST Electronic Bill • KLH DBMS 25CS1302E</span>
        </div>
      </div>`;

    document.getElementById('invoice-printable-content').innerHTML = content;
    document.getElementById('modal-invoice').classList.remove('hidden');
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

async function payInvoiceOnline(recordId) {
  try {
    await apiCall(`/service-records/${recordId}/pay`, 'POST', { paymentMethod: 'Online / UPI' });
    showToast('Payment successful! Digital receipt updated.', '💳');
    await fetchServiceRecords();
    await fetchDashboardStats();
  } catch (e) {
    showToast('❌ ' + e.message, '⚠️');
  }
}

function openCreateInvoiceModal() {
  populateModalDropdowns();
  document.getElementById('modal-advisor-invoice').classList.remove('hidden');
}

async function handleAdvisorCreateRecord(e) {
  e.preventDefault();
  const vehicleId = document.getElementById('adv-veh-select').value;
  const serviceType = document.getElementById('adv-service-type').value.trim();
  const workSummary = document.getElementById('adv-work-summary').value.trim();
  const labor = Number(document.getElementById('adv-labor-cost').value);
  const parts = Number(document.getElementById('adv-parts-cost').value);

  const defaultCenter = appState.centers[0] ? appState.centers[0]._id : null;

  try {
    await apiCall('/service-records', 'POST', {
      vehicleId,
      serviceCenterId: defaultCenter,
      serviceType,
      workSummary,
      items: [
        { description: 'Labor & Electronic Diagnostics', category: 'Labor', cost: labor },
        { description: 'Genuine Replacement Parts & Fluids', category: 'Parts', cost: parts }
      ],
      paymentMethod: 'Online / UPI'
    });

    closeModal('modal-advisor-invoice');
    showToast('Invoice generated and customer job card closed!', '🧾');
    await fetchServiceRecords();
    await fetchAdvisorAnalytics();
    renderAdvisorPortal();
  } catch (err) {
    showToast('❌ ' + err.message, '⚠️');
  }
}

async function updateAppointmentStatusAdvisor(id, status) {
  if (!status) return;
  try {
    await apiCall(`/appointments/${id}/status`, 'PATCH', { status });
    showToast('Booking status updated to ' + status, '✅');
    await fetchAppointments();
    await fetchAdvisorAnalytics();
    renderAdvisorPortal();
  } catch (e) {
    showToast('❌ ' + e.message, '⚠️');
  }
}

async function updateRoadsideStatusAdvisor(id, status) {
  if (!status) return;
  try {
    await apiCall(`/roadside/${id}/status`, 'PATCH', { status });
    showToast('Roadside SOS updated to ' + status, '🚨');
    await fetchRoadsideRequests();
    await fetchAdvisorAnalytics();
    renderAdvisorPortal();
  } catch (e) {
    showToast('❌ ' + e.message, '⚠️');
  }
}

function showToast(msg, icon = '🔔') {
  const toast = document.getElementById('toast');
  const txt = document.getElementById('toast-msg');
  const ic = document.getElementById('toast-icon');
  txt.textContent = msg;
  if (ic) ic.textContent = icon;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
