// ============================================
//  LAVENDER GLOW BEAUTY SALOON — script.js
// ============================================

// ============================
// CONSTANTS
// ============================
const ADMIN_EMAIL = 'situmawonderful@gmail.com';
const ADMIN_PASS  = 'wanda.2006';
const ADMIN_NAME  = 'wanda';

const SERVICES = [
  { name: 'Manicure',         icon: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/manicure_b_hrhetr.jpg',        desc: 'Classic, Gel & acrylic nail treatments',                        price: 1500 },
  { name: 'Pedicure',         icon: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/pedicure_tmimzg.jpg',          desc: 'Relaxing foot care and nail grooming',                           price: 1500 },
  { name: 'Wig Installation', icon: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664970/wig_installation_gkokcs.jpg',  desc: 'Professional wig fitting and styling',                           price: 2500 },
  { name: 'Hair Dressing',    icon: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/hair_dressing_xb68xg.jpg',     desc: 'Styling, braiding, and coloring to keep you looking your best',  price: 3000 },
  { name: 'Barber Shop',      icon: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/cornrows_hwnvtr.jpg',          desc: 'Fresh cuts, Cornrows, Locs installation and braids',             price: 600  },
];

// ============================
// STATE
// ============================
const state = {
  users:    JSON.parse(localStorage.getItem('lg_users')    || '[]'),
  bookings: JSON.parse(localStorage.getItem('lg_bookings') || '[]'),
  current:  JSON.parse(localStorage.getItem('lg_current')  || 'null'),
  selSvc:   null,
};

// ============================
// HELPERS
// ============================
function save() {
  localStorage.setItem('lg_users',    JSON.stringify(state.users));
  localStorage.setItem('lg_bookings', JSON.stringify(state.bookings));
  localStorage.setItem('lg_current',  JSON.stringify(state.current));
}

function isMember() {
  return state.current && state.current.email !== ADMIN_EMAIL;
}

function isAdmin() {
  return state.current && state.current.email === ADMIN_EMAIL;
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`Element #${id} not found`);
  return el;
}

// ============================
// TOAST
// ============================
let toastTimer;
function toast(msg, type = '') {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type ? 't-' + type : '');
  clearTimeout(toastTimer);
  setTimeout(() => el.classList.add('show'), 10);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

// ============================
// MODALS
// ============================
function openModal(id)  { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

function openAuthModal(tab) {
  openModal('authOverlay');
  switchAuthTab(tab || 'login');
}

function switchAuthTab(tab) {
  $('loginPane').style.display    = tab === 'login'    ? 'block' : 'none';
  $('registerPane').style.display = tab === 'register' ? 'block' : 'none';
  $('tabSignIn').className   = 'tab-btn' + (tab === 'login'    ? ' active' : '');
  $('tabRegister').className = 'tab-btn' + (tab === 'register' ? ' active' : '');
  $('authTitle').textContent = tab === 'login' ? 'Welcome Back' : 'Create Account';
  $('authSub').textContent   = tab === 'login'
    ? 'Sign in to access your member discount'
    : 'Join free and save 5% on every service';
}

// ============================
// AUTH — LOGIN
// ============================
function doLogin() {
  const email = $('liEmail').value.trim();
  const pass  = $('liPass').value;

  if (!email || !pass) { toast('Please fill in all fields', 'error'); return; }

  // Admin login
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    state.current = { name: ADMIN_NAME, email: ADMIN_EMAIL, isAdmin: true };
    save();
    closeModal('authOverlay');
    refreshUI();
    toast('Welcome, Administrator! ⚙', 'success');
    return;
  }

  // Member login
  const user = state.users.find(u => u.email === email && u.password === pass);
  if (!user) { toast('Incorrect email or password', 'error'); return; }

  state.current = user;
  save();
  closeModal('authOverlay');
  refreshUI();
  toast('Welcome back, ' + user.name.split(' ')[0] + '! ', 'success Nigga');
}

// ============================
// AUTH — REGISTER
// ============================
function doRegister() {
  const name  = $('rgName').value.trim();
  const email = $('rgEmail').value.trim();
  const pass  = $('rgPass').value;

  if (!name || !email || !pass)            { toast('Please fill all fields', 'error'); return; }
  if (pass.length < 6)                     { toast('Password must be at least 6 characters', 'error'); return; }
  if (email === ADMIN_EMAIL)               { toast('This email is reserved', 'error'); return; }
  if (state.users.find(u => u.email === email)) { toast('Email already registered', 'error'); return; }

  const user = { name, email, password: pass, joined: new Date().toLocaleDateString('en-KE') };
  state.users.push(user);
  state.current = user;
  save();
  closeModal('authOverlay');
  refreshUI();
  toast('Account created! 5% discount is now active on your first service', 'success');
}

// ============================
// AUTH — LOGOUT
// ============================
function doLogout() {
  state.current = null;
  save();
  closeModal('accOverlay');
  refreshUI();
  toast('Signed out. See you soon bitch! ');
}

// ============================
// REFRESH ALL UI
// ============================
function refreshUI() {
  updateNav();
  renderServices();
  updateBookingNotices();
  updatePriceSummary();

  const adminSec = $('adminSection');
  if (isAdmin()) {
    adminSec.style.display = 'block';
    renderAdmin();
  } else {
    adminSec.style.display = 'none';
  }

  $('memberWelcome').style.display = isMember() ? 'flex' : 'none';
}

// ============================
// NAV
// ============================
function updateNav() {
  const btn = $('navAuthBtn');

  if (isAdmin()) {
    btn.textContent = '⚙ Admin';
    btn.onclick = () => {
      $('adminSection').scrollIntoView({ behavior: 'smooth' });
    };
  } else if (isMember()) {
    btn.textContent = '👤 ' + state.current.name.split(' ')[0];
    btn.onclick = openAccountModal;
  } else {
    btn.textContent = 'Sign In';
    btn.onclick = () => openAuthModal('login');
  }
}

// ============================
// NOTICES
// ============================
function updateBookingNotices() {
  const memberNotice = $('bookMemberNotice');
  const guestNotice  = $('bookGuestNotice');
  if (memberNotice) memberNotice.style.display = isMember() ? 'flex' : 'none';
  if (guestNotice)  guestNotice.style.display  = !state.current ? 'flex' : 'none';
}

// ============================
// SERVICES
// ============================
function renderServices() {
  const grid = $('servicesGrid');

  $('svcSubtitle').textContent = isMember()
    ? 'Member pricing active — 5% off all services!'
    : 'Register free to unlock member pricing';

  grid.innerHTML = SERVICES.map((s, i) => {
    const discPrice = Math.round(s.price * 0.95);
    const saving    = s.price - discPrice;
    const selected  = state.selSvc === i;

    return `
      <div class="service-card${selected ? ' selected' : ''}" onclick="selectService(${i})">
        ${selected ? '<div class="selected-check">✓</div>' : ''}
        <div class="svc-img-wrap">
          <img src="${s.icon}" alt="${s.name}" onerror="this.style.display='none'">
        </div>
        <div class="svc-body">
          <div class="svc-name">${s.name}</div>
          <div class="svc-desc-text">${s.desc}</div>
          <div class="svc-price">KSh ${s.price.toLocaleString()}</div>
          ${isMember()
            ? `<div class="svc-disc">⭐ Member price: KSh ${discPrice.toLocaleString()}</div>`
            : `<div class="svc-save">Join to save KSh ${saving.toLocaleString()}</div>`
          }
          <button class="svc-book-btn" onclick="event.stopPropagation(); selectService(${i})">Book Now</button>
        </div>
      </div>`;
  }).join('');

  // Sync booking dropdown
  const sel = $('bkService');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Select a service --</option>';
  SERVICES.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name;
    o.textContent = `${s.name}  —  KSh ${s.price.toLocaleString()}`;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
  if (state.selSvc !== null) sel.value = SERVICES[state.selSvc].name;
}

function selectService(i) {
  state.selSvc = i;
  $('bkService').value = SERVICES[i].name;
  renderServices();
  updatePriceSummary();
  $('book').scrollIntoView({ behavior: 'smooth' });
}

// ============================
// PRICE SUMMARY
// ============================
function updatePriceSummary() {
  const svcName = $('bkService').value;
  const svc     = SERVICES.find(s => s.name === svcName);
  const ps      = $('priceSummary');

  if (!svc) { ps.style.display = 'none'; return; }

  const disc  = isMember() ? Math.round(svc.price * 0.05) : 0;
  const total = svc.price - disc;

  ps.style.display = 'block';
  $('psSvc').textContent     = svc.name;
  $('psRegular').textContent = 'KSh ' + svc.price.toLocaleString();
  $('psDisc').textContent    = '- KSh ' + disc.toLocaleString();
  $('psTotal').textContent   = 'KSh ' + total.toLocaleString();
  $('psDiscRow').style.display = isMember() ? 'flex' : 'none';

  // Keep selected card in sync
  const idx = SERVICES.findIndex(s => s.name === svcName);
  if (idx !== state.selSvc) { state.selSvc = idx; renderServices(); }
}

// ============================
// BOOKING
// ============================
function submitBooking() {
  const name    = $('bkName').value.trim();
  const phone   = $('bkPhone').value.trim();
  const svcName = $('bkService').value;
  const date    = $('bkDate').value;
  const time    = $('bkTime').value;
  const notes   = $('bkNotes').value.trim();

  if (!name)    { toast('Please enter your name', 'error'); return; }
  if (!phone)   { toast('Please enter your phone number', 'error'); return; }
  if (!svcName) { toast('Please select a service', 'error'); return; }
  if (!date)    { toast('Please choose a date', 'error'); return; }
  if (!time)    { toast('Please choose a time', 'error'); return; }

  const svc    = SERVICES.find(s => s.name === svcName);
  const member = isMember();
  const price  = member ? Math.round(svc.price * 0.95) : svc.price;

  const booking = {
    id:      Date.now(),
    name, phone, service: svcName,
    date, time, notes, price, member,
    email:   state.current ? state.current.email : null,
    created: new Date().toISOString(),
  };

  state.bookings.push(booking);
  save();
  clearBookingForm();
  toast('Appointment booked! See you at Lavender Glow ', 'success');
  if (isAdmin()) renderAdmin();
}

function clearBookingForm() {
  ['bkName', 'bkPhone', 'bkDate', 'bkNotes'].forEach(id => $(id).value = '');
  $('bkService').value = '';
  $('bkTime').value    = '';
  $('priceSummary').style.display = 'none';
  state.selSvc = null;
  renderServices();
}

// ============================
// ACCOUNT MODAL
// ============================
function openAccountModal() {
  if (!state.current) return;
  const u = state.current;
  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  $('accAvatar').textContent = initials;
  $('accName').textContent   = u.name;
  $('accEmail').textContent  = u.email;

  const myB  = state.bookings.filter(b => b.email === u.email);
  const list = $('myBookingsList');

  if (myB.length) {
    list.className = '';
    list.innerHTML = myB.slice().reverse().map(b => `
      <div style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <span>
          <strong>${b.service}</strong><br>
          <span style="font-size:0.78rem;color:var(--muted)">${b.date} at ${b.time}</span>
        </span>
        <span style="color:var(--lav-dark);font-weight:500">KSh ${b.price.toLocaleString()}</span>
      </div>`
    ).join('');
  } else {
    list.className = 'my-bookings-empty';
    list.innerHTML = 'No bookings yet. Book your first appointment!';
  }

  openModal('accOverlay');
}

// ============================
// ADMIN DASHBOARD
// ============================
function renderAdmin() {
  const today    = new Date().toISOString().split('T')[0];
  const todayBks = state.bookings.filter(b => b.date === today);
  const revenue  = state.bookings.reduce((a, b) => a + b.price, 0);
  const memberBks = state.bookings.filter(b => b.member);
  const guestBks  = state.bookings.filter(b => !b.member);
  const memberRev = memberBks.reduce((a, b) => a + b.price, 0);

  // Set today's date in header
  const dateEl = $('adminDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  $('stTotal').textContent    = state.bookings.length;
  $('stMembers').textContent  = state.users.length;
  $('stToday').textContent    = todayBks.length;
  $('stRevenue').textContent  = 'KSh ' + revenue.toLocaleString();
  $('stGuests').textContent   = guestBks.length;
  $('stMemberRev').textContent = 'KSh ' + memberRev.toLocaleString();

  // Most popular service
  const svcCount = {};
  state.bookings.forEach(b => { svcCount[b.service] = (svcCount[b.service] || 0) + 1; });
  const popular = Object.entries(svcCount).sort((a,b) => b[1]-a[1])[0];
  $('stPopular').textContent = popular ? `${popular[0]} (${popular[1]}x)` : '—';

  // Next upcoming appointment
  const upcoming = state.bookings
    .filter(b => b.date >= today)
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
  $('stNext').textContent = upcoming
    ? `${upcoming.name} · ${upcoming.service} · ${upcoming.date} ${upcoming.time}`
    : 'No upcoming bookings';

  // Populate service filter dropdown
  const filterSvc = $('adminFilterSvc');
  if (filterSvc) {
    filterSvc.innerHTML = '<option value="">All Services</option>';
    SERVICES.forEach(s => {
      const o = document.createElement('option');
      o.value = s.name; o.textContent = s.name;
      filterSvc.appendChild(o);
    });
  }

  renderBookingsTable();
  renderMembersTable();
}

function getFilteredBookings() {
  const search = ($('adminSearch') ? $('adminSearch').value.toLowerCase() : '');
  const svc    = $('adminFilterSvc') ? $('adminFilterSvc').value : '';
  const type   = $('adminFilterType') ? $('adminFilterType').value : '';

  return state.bookings.slice().reverse().filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search) ||
      b.phone.includes(search) ||
      b.service.toLowerCase().includes(search);
    const matchSvc  = !svc  || b.service === svc;
    const matchType = !type || (type === 'member' ? b.member : !b.member);
    return matchSearch && matchSvc && matchType;
  });
}

function renderBookingsTable() {
  const bTbody  = $('adminBookings');
  const filtered = getFilteredBookings();

  bTbody.innerHTML = filtered.length
    ? filtered.map((b, idx) => `
        <tr>
          <td style="color:var(--muted);font-size:0.78rem">${filtered.length - idx}</td>
          <td><strong>${b.name}</strong></td>
          <td>${b.phone}</td>
          <td>
            <span class="svc-badge">${b.service}</span>
          </td>
          <td>${formatDate(b.date)}</td>
          <td>${b.time}</td>
          <td style="font-weight:600;color:var(--lav-dark)">KSh ${b.price.toLocaleString()}</td>
          <td><span class="badge ${b.member ? 'badge-member' : 'badge-guest'}">${b.member ? ' Member' : ' Guest'}</span></td>
          <td style="color:var(--muted);font-size:0.82rem;max-width:140px">${b.notes || '<em>—</em>'}</td>
        </tr>`).join('')
    : '<tr><td colspan="9" class="empty-row">No bookings match your filter</td></tr>';
}

function renderMembersTable() {
  const mTbody = $('adminMembers');
  mTbody.innerHTML = state.users.length
    ? state.users.map((u, idx) => {
        const userBookings = state.bookings.filter(b => b.email === u.email).length;
        return `
          <tr>
            <td style="color:var(--muted);font-size:0.78rem">${idx + 1}</td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td>${u.joined}</td>
            <td><span class="badge badge-member">${userBookings} booking${userBookings !== 1 ? 's' : ''}</span></td>
            <td style="color:var(--success);font-weight:600">5% off</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="6" class="empty-row">No members registered yet</td></tr>';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}


// EXPORT CSV

function exportBookings() {
  if (!state.bookings.length) { toast('No bookings to export', 'error'); return; }

  const headers = ['Name', 'Phone', 'Service', 'Date', 'Time', 'Price (KSh)', 'Member', 'Notes'];
  const rows    = state.bookings.map(b =>
    [b.name, b.phone, b.service, b.date, b.time, b.price, b.member ? 'Yes' : 'No', b.notes || ''].join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'lavender_glow_bookings.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Bookings exported!', 'success');
}

// ============================
// CLEAR ALL DATA
// ============================
function clearAllData() {
  if (!confirm('Clear ALL bookings and members? This cannot be undone.')) return;
  state.bookings = [];
  state.users    = [];
  save();
  renderAdmin();
  toast('All data cleared', 'error');
}

// ============================
// INIT — runs on page load
// ============================
(function init() {

  // Set minimum booking date to today
  $('bkDate').min = new Date().toISOString().split('T')[0];

  // Nav auth button
  $('navAuthBtn').addEventListener('click', () => openAuthModal('login'));

  // Hero join button (may not exist on all pages)
  const heroJoinBtn = $('heroJoinBtn');
  if (heroJoinBtn) heroJoinBtn.addEventListener('click', () => openAuthModal('register'));

  // Guest notice join link
  const guestJoinLink = $('guestJoinLink');
  if (guestJoinLink) guestJoinLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('register'); });

  // Auth modal tabs
  $('tabSignIn').addEventListener('click',   () => switchAuthTab('login'));
  $('tabRegister').addEventListener('click', () => switchAuthTab('register'));

  // Auth buttons
  $('loginBtn').addEventListener('click',    doLogin);
  $('registerBtn').addEventListener('click', doRegister);
  $('logoutBtn').addEventListener('click',   doLogout);

  // Modal close buttons
  $('authClose').addEventListener('click', () => closeModal('authOverlay'));
  $('accClose').addEventListener('click',  () => closeModal('accOverlay'));

  // Close modals by clicking overlay background
  ['authOverlay', 'accOverlay'].forEach(id => {
    $(id).addEventListener('click', function(e) {
      if (e.target === this) closeModal(id);
    });
  });

  // Booking actions
  $('confirmBookingBtn').addEventListener('click', submitBooking);
  $('clearBookingBtn').addEventListener('click',   clearBookingForm);

  // Price summary on service change
  $('bkService').addEventListener('change', updatePriceSummary);

  // Admin buttons — use delegation so they work even when dashboard is hidden/shown dynamically
  document.addEventListener('click', e => {
    if (e.target.id === 'exportBtn')    exportBookings();
    if (e.target.id === 'clearDataBtn') clearAllData();
  });

  // Admin live filters
  document.addEventListener('input',  e => { if (e.target.id === 'adminSearch')     renderBookingsTable(); });
  document.addEventListener('change', e => { if (e.target.id === 'adminFilterSvc')  renderBookingsTable(); });
  document.addEventListener('change', e => { if (e.target.id === 'adminFilterType') renderBookingsTable(); });

  // Initial render
  refreshUI();

})();