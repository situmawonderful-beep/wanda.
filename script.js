// ============================================
//  LAVENDER GLOW BEAUTY SPACE — script.js
//  Powered by Firebase Firestore + Auth
// ============================================

// ============================
// FIREBASE CONFIG
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbbXQVgW5WQsbtnN2SmwtOqP4cd13VfRI",
  authDomain: "blessin-deaa8.firebaseapp.com",
  projectId: "blessin-deaa8",
  storageBucket: "blessin-deaa8.firebasestorage.app",
  messagingSenderId: "349721881752",
  appId: "1:349721881752:web:0f880c563e2d54088d5ded",
  measurementId: "G-RPMXJQ9L5K"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);


// CONSTANTS

const ADMIN_EMAIL = 'situmawonderful@gmail.com';
const ADMIN_NAME  = 'Wanda';

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
  currentUser: null,
  currentProfile: null,
  bookings: [],
  members: [],
  selSvc: null,
  isAdmin: false,
};

// ============================
// HELPERS
// ============================
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`Element #${id} not found`);
  return el;
}

function isMember() {
  return state.currentUser && !state.isAdmin;
}

function isAdmin() {
  return state.isAdmin;
}

// ============================
// PASSWORD TOGGLE
// ============================
function togglePw(inputId, btn) {
  const input = $(inputId);
  if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.textContent = isText ? '👁️' : '🙈';
  btn.classList.toggle('active', !isText);
}

// ============================
// FORGOT PASSWORD
// ============================
async function forgotPassword() {
  const email = $('liEmail').value.trim();
  if (!email) {
    toast('Please enter your email address first', 'error');
    $('liEmail').focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    toast('Reset email sent! Check your inbox ', 'success');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      toast('No account found with that email', 'error');
    } else {
      toast('Failed to send reset email', 'error');
    }
  }
}
let toastTimer;
function toast(msg, type = '') {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast ' + (type ? 't-' + type : '');
  clearTimeout(toastTimer);
  setTimeout(() => el.classList.add('show'), 10);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

// ============================
// MODALS
// ============================
function openModal(id)  { const el = $(id); if (el) el.classList.add('open'); }
function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

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
async function doLogin() {
  const email = $('liEmail').value.trim();
  const pass  = $('liPass').value;

  if (!email || !pass) { toast('Please fill in all fields', 'error'); return; }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal('authOverlay');
    toast('Welcome back! ', 'success');
  } catch (err) {
    toast('Incorrect email or password', 'error');
  }
}

// ============================
// AUTH — REGISTER
// ============================
async function doRegister() {
  const name  = $('rgName').value.trim();
  const email = $('rgEmail').value.trim();
  const pass  = $('rgPass').value;

  if (!name || !email || !pass) { toast('Please fill all fields', 'error'); return; }
  if (pass.length < 6)          { toast('Password must be at least 6 characters', 'error'); return; }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });

    await setDoc(doc(db, 'members', cred.user.uid), {
      name,
      email,
      joined: new Date().toLocaleDateString('en-KE'),
      uid: cred.user.uid,
    });

    closeModal('authOverlay');
    toast('Welcome to Lavender Glow Beauty Space! ', 'success');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      toast('This email is already registered — please Sign In instead!', 'error');
      switchAuthTab('login');
      $('liEmail').value = email;
    } else {
      toast('Registration failed: ' + err.message, 'error');
    }
  }
}

// ============================
// AUTH — LOGOUT
// ============================
async function doLogout() {
  await signOut(auth);
  closeModal('accOverlay');
  toast('Signed out. See you soon Nigga! ');
}

// ============================
// FIREBASE — LOAD DATA
// ============================
async function loadBookings() {
  const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));
  onSnapshot(q, (snapshot) => {
    state.bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (isAdmin()) renderAdmin();
    if (state.currentUser && !isAdmin()) renderMyBookings();
  });
}

async function loadMembers() {
  const q = query(collection(db, 'members'), orderBy('joined', 'asc'));
  onSnapshot(q, (snapshot) => {
    state.members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (isAdmin()) renderMembersTable();
  });
}

// ============================
// AUTH STATE LISTENER
// ============================
onAuthStateChanged(auth, async (user) => {
  state.currentUser = user;
  state.isAdmin = user ? user.email === ADMIN_EMAIL : false;

  if (user) {
    // Load profile from Firestore
    if (!isAdmin()) {
      const profileDoc = await getDoc(doc(db, 'members', user.uid));
      state.currentProfile = profileDoc.exists() ? profileDoc.data() : { name: user.displayName, email: user.email };
    }
    loadBookings();
    loadMembers();
  } else {
    state.currentProfile = null;
    state.bookings = [];
    state.members  = [];
  }

  refreshUI();
});

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

  const welcome = $('memberWelcome');
  if (welcome) welcome.style.display = isMember() ? 'flex' : 'none';
}

// ============================
// NAV
// ============================
function updateNav() {
  const btn = $('navAuthBtn');
  if (!btn) return;

  if (isAdmin()) {
    btn.textContent = '⚙ Admin';
    btn.onclick = () => $('adminSection').scrollIntoView({ behavior: 'smooth' });
  } else if (state.currentUser) {
    const name = state.currentProfile?.name || state.currentUser.displayName || 'Member';
    btn.textContent = ' ' + name.split(' ')[0];
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
  if (guestNotice)  guestNotice.style.display  = !state.currentUser ? 'flex' : 'none';
}

// ============================
// SERVICES
// ============================
function renderServices() {
  const grid = $('servicesGrid');
  if (!grid) return;

  const subtitle = $('svcSubtitle');
  if (subtitle) subtitle.textContent = 'Choose a service to book an appointment';

  grid.innerHTML = SERVICES.map((s, i) => {
    const selected = state.selSvc === i;

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
          <button class="svc-book-btn" onclick="event.stopPropagation(); selectService(${i})">Book Now</button>
        </div>
      </div>`;
  }).join('');

  const sel = $('bkService');
  if (!sel) return;
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
  const sel = $('bkService');
  if (sel) sel.value = SERVICES[i].name;
  renderServices();
  updatePriceSummary();
  const book = document.getElementById('book');
  if (book) book.scrollIntoView({ behavior: 'smooth' });
}

// ============================
// PRICE SUMMARY
// ============================
function updatePriceSummary() {
  const svcSel = $('bkService');
  if (!svcSel) return;
  const svcName = svcSel.value;
  const svc     = SERVICES.find(s => s.name === svcName);
  const ps      = $('priceSummary');
  if (!ps) return;

  if (!svc) { ps.style.display = 'none'; return; }

  const disc  = 0;
  const total = svc.price;

  ps.style.display = 'block';
  $('psSvc').textContent     = svc.name;
  $('psRegular').textContent = 'KSh ' + svc.price.toLocaleString();
  $('psDisc').textContent    = '- KSh ' + disc.toLocaleString();
  $('psTotal').textContent   = 'KSh ' + total.toLocaleString();
  $('psDiscRow').style.display = isMember() ? 'flex' : 'none';

  const idx = SERVICES.findIndex(s => s.name === svcName);
  if (idx !== state.selSvc) { state.selSvc = idx; renderServices(); }
}

// ============================
// BOOKING — SUBMIT TO FIREBASE
// ============================
async function submitBooking() {
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

  try {
    await addDoc(collection(db, 'bookings'), {
      name, phone,
      service: svcName,
      date, time, notes, price: svc.price, member: isMember(),
      email:   state.currentUser ? state.currentUser.email : null,
      uid:     state.currentUser ? state.currentUser.uid   : null,
      created: new Date().toISOString(),
    });

    clearBookingForm();
    toast('Appointment booked! See you at Lavender Glow Beauty Space', 'success');
  } catch (err) {
    if (err.code === 'permission-denied') {
      toast('Booking failed — please check Firestore rules in Firebase console', 'error');
    } else {
      toast('Booking failed: ' + err.message, 'error');
    }
    console.error('Booking error:', err);
  }
}

function clearBookingForm() {
  ['bkName', 'bkPhone', 'bkDate', 'bkNotes'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  const svc = $('bkService'); if (svc) svc.value = '';
  const tim = $('bkTime');    if (tim) tim.value = '';
  const ps  = $('priceSummary'); if (ps) ps.style.display = 'none';
  state.selSvc = null;
  renderServices();
}

// ============================
// ACCOUNT MODAL
// ============================
function openAccountModal() {
  if (!state.currentUser) return;
  const profile = state.currentProfile;
  const name    = profile?.name || state.currentUser.displayName || 'Member';
  const email   = state.currentUser.email;
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  $('accAvatar').textContent = initials;
  $('accName').textContent   = name;
  $('accEmail').textContent  = email;

  renderMyBookings();
  openModal('accOverlay');
}

function renderMyBookings() {
  const list = $('myBookingsList');
  if (!list || !state.currentUser) return;
  const myB = state.bookings.filter(b => b.uid === state.currentUser.uid || b.email === state.currentUser.email);

  if (myB.length) {
    list.className = '';
    list.innerHTML = myB.map(b => `
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
}

// ============================
// ADMIN DASHBOARD
// ============================
function renderAdmin() {
  const today     = new Date().toISOString().split('T')[0];
  const todayBks  = state.bookings.filter(b => b.date === today);
  const revenue   = state.bookings.reduce((a, b) => a + b.price, 0);
  const memberBks = state.bookings.filter(b => b.member);
  const guestBks  = state.bookings.filter(b => !b.member);
  const memberRev = memberBks.reduce((a, b) => a + b.price, 0);

  const dateEl = $('adminDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  $('stTotal').textContent     = state.bookings.length;
  $('stMembers').textContent   = state.members.length;
  $('stToday').textContent     = todayBks.length;
  $('stRevenue').textContent   = 'KSh ' + revenue.toLocaleString();
  $('stGuests').textContent    = guestBks.length;
  $('stMemberRev').textContent = 'KSh ' + memberRev.toLocaleString();

  const svcCount = {};
  state.bookings.forEach(b => { svcCount[b.service] = (svcCount[b.service] || 0) + 1; });
  const popular = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0];
  $('stPopular').textContent = popular ? `${popular[0]} (${popular[1]}x)` : '—';

  const upcoming = state.bookings
    .filter(b => b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
  $('stNext').textContent = upcoming
    ? `${upcoming.name} · ${upcoming.service} · ${upcoming.date} ${upcoming.time}`
    : 'No upcoming bookings';

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
  const search = $('adminSearch')  ? $('adminSearch').value.toLowerCase()  : '';
  const svc    = $('adminFilterSvc')  ? $('adminFilterSvc').value  : '';
  const type   = $('adminFilterType') ? $('adminFilterType').value : '';

  return state.bookings.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search) ||
      (b.phone || '').includes(search) ||
      b.service.toLowerCase().includes(search);
    const matchSvc  = !svc  || b.service === svc;
    const matchType = !type || (type === 'member' ? b.member : !b.member);
    return matchSearch && matchSvc && matchType;
  });
}

function renderBookingsTable() {
  const bTbody  = $('adminBookings');
  if (!bTbody) return;
  const filtered = getFilteredBookings();

  bTbody.innerHTML = filtered.length
    ? filtered.map((b, idx) => `
        <tr>
          <td style="color:var(--muted);font-size:0.78rem">${idx + 1}</td>
          <td><strong>${b.name}</strong></td>
          <td>${b.phone || '—'}</td>
          <td><span class="svc-badge">${b.service}</span></td>
          <td>${formatDate(b.date)}</td>
          <td>${b.time}</td>
          <td style="font-weight:600;color:var(--lav-dark)">KSh ${b.price.toLocaleString()}</td>
          <td><span class="badge ${b.member ? 'badge-member' : 'badge-guest'}">${b.member ? ' Member' : ' Guest'}</span></td>
          <td style="color:var(--muted);font-size:0.82rem;max-width:140px">${b.notes || '<em>—</em>'}</td>
        </tr>`).join('')
    : '<tr><td colspan="9" class="empty-row">No bookings yet</td></tr>';
}

function renderMembersTable() {
  const mTbody = $('adminMembers');
  if (!mTbody) return;
  mTbody.innerHTML = state.members.length
    ? state.members.map((u, idx) => {
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

// ============================
// EXPORT CSV
// ============================
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
  a.href = url; a.download = 'lavender_glow_bookings.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Bookings exported!', 'success');
}

// ============================
// CLEAR ALL DATA
// ============================
async function clearAllData() {
  if (!confirm('Delete ALL bookings? This cannot be undone.')) return;

  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    const deletes  = snapshot.docs.map(d => deleteDoc(doc(db, 'bookings', d.id)));
    await Promise.all(deletes);
    toast('All bookings deleted! ✅', 'success');
    renderAdmin();
  } catch (err) {
    toast('Failed to delete: ' + err.message, 'error');
    console.error(err);
  }
}

// ============================
// INIT
// ============================
(function init() {
  const bkDate = $('bkDate');
  if (bkDate) bkDate.min = new Date().toISOString().split('T')[0];

  $('navAuthBtn').addEventListener('click', () => {
    if (state.currentUser && !isAdmin()) openAccountModal();
    else if (isAdmin()) $('adminSection').scrollIntoView({ behavior: 'smooth' });
    else openAuthModal('login');
  });

  const heroJoinBtn = $('heroJoinBtn');
  if (heroJoinBtn) heroJoinBtn.addEventListener('click', () => openAuthModal('register'));

  const guestJoinLink = $('guestJoinLink');
  if (guestJoinLink) guestJoinLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('register'); });

  const forgotPassLink = $('forgotPassLink');
  if (forgotPassLink) forgotPassLink.addEventListener('click', (e) => { e.preventDefault(); forgotPassword(); });

  $('tabSignIn').addEventListener('click',   () => switchAuthTab('login'));
  $('tabRegister').addEventListener('click', () => switchAuthTab('register'));
  $('loginBtn').addEventListener('click',    doLogin);
  $('registerBtn').addEventListener('click', doRegister);
  $('logoutBtn').addEventListener('click',   doLogout);
  $('authClose').addEventListener('click',   () => closeModal('authOverlay'));
  $('accClose').addEventListener('click',    () => closeModal('accOverlay'));

  ['authOverlay', 'accOverlay'].forEach(id => {
    $(id).addEventListener('click', function(e) {
      if (e.target === this) closeModal(id);
    });
  });

  $('confirmBookingBtn').addEventListener('click', submitBooking);
  $('clearBookingBtn').addEventListener('click',   clearBookingForm);
  $('bkService').addEventListener('change',        updatePriceSummary);

  document.addEventListener('click', e => {
    if (e.target.id === 'exportBtn')    exportBookings();
    if (e.target.id === 'clearDataBtn') clearAllData();
  });

  document.addEventListener('input',  e => { if (e.target.id === 'adminSearch')     renderBookingsTable(); });
  document.addEventListener('change', e => { if (e.target.id === 'adminFilterSvc')  renderBookingsTable(); });
  document.addEventListener('change', e => { if (e.target.id === 'adminFilterType') renderBookingsTable(); });

})();
