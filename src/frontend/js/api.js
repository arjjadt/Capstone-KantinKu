// ============================================================
// KantinKu - Core API Layer & Utilities
// ============================================================

// ── Fetch Wrapper ──────────────────────────────────────────
async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('kantinku_token');

  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  // If FormData, remove Content-Type so browser sets it automatically with boundary
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ── Auth Helpers ───────────────────────────────────────────
function getUser() {
  const user = localStorage.getItem('kantinku_user');
  return user ? JSON.parse(user) : null;
}

function getToken() {
  return localStorage.getItem('kantinku_token');
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function saveAuth(token, user) {
  localStorage.setItem('kantinku_token', token);
  localStorage.setItem('kantinku_user', JSON.stringify(user));
}

function getBasePath() {
  if (window.location.protocol === 'file:') {
    const p = window.location.pathname;
    if (p.includes('/seller/') || p.includes('/admin/')) return '../';
    return './';
  }
  return '/';
}

function logout() {
  localStorage.removeItem('kantinku_token');
  localStorage.removeItem('kantinku_user');
  localStorage.removeItem('kantinku_cart');
  window.location.href = getBasePath() + 'login.html';
}

function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    showToast('Anda tidak memiliki akses ke halaman ini.', 'error');
    window.location.href = getBasePath() + 'index.html';
    return false;
  }

  return true;
}

// ── Cart Helpers (localStorage persistence) ────────────────
function getCart() {
  const cart = localStorage.getItem('kantinku_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('kantinku_cart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('kantinku_cart');
}

function addToCart(item) {
  // item: { menuItemId, stallId, stallName, name, price, quantity, notes, photoUrl }
  const cart = getCart();
  const existing = cart.find(c => c.menuItemId === item.menuItemId);

  if (existing) {
    existing.quantity += item.quantity || 1;
    if (item.notes) existing.notes = item.notes;
  } else {
    cart.push({
      menuItemId: item.menuItemId,
      stallId: item.stallId,
      stallName: item.stallName || '',
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity || 1,
      notes: item.notes || '',
      photoUrl: item.photoUrl || ''
    });
  }

  saveCart(cart);
  return cart;
}

function removeFromCart(menuItemId) {
  let cart = getCart();
  cart = cart.filter(c => c.menuItemId !== menuItemId);
  saveCart(cart);
  return cart;
}

function updateCartQuantity(menuItemId, qty) {
  const cart = getCart();
  const item = cart.find(c => c.menuItemId === menuItemId);
  if (item) {
    if (qty <= 0) {
      return removeFromCart(menuItemId);
    }
    item.quantity = qty;
    saveCart(cart);
  }
  return cart;
}

function updateCartNotes(menuItemId, notes) {
  const cart = getCart();
  const item = cart.find(c => c.menuItemId === menuItemId);
  if (item) {
    item.notes = notes;
    saveCart(cart);
  }
  return cart;
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartByStall() {
  const cart = getCart();
  const grouped = {};
  cart.forEach(item => {
    if (!grouped[item.stallId]) {
      grouped[item.stallId] = { stallName: item.stallName, items: [] };
    }
    grouped[item.stallId].items.push(item);
  });
  return grouped;
}

// ── Currency Formatter ─────────────────────────────────────
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// ── Toast Notification System ──────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  // Remove existing toasts
  const existing = document.querySelectorAll('.kantinku-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'kantinku-toast';

  const colors = {
    success: { bg: '#006d3e', icon: 'check_circle' },
    error: { bg: '#ba1a1a', icon: 'error' },
    info: { bg: '#24619d', icon: 'info' },
    warning: { bg: '#ab3500', icon: 'warning' }
  };

  const c = colors[type] || colors.info;

  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
    background: ${c.bg}; color: #fff; padding: 14px 24px; border-radius: 12px;
    font-family: Inter, sans-serif; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; gap: 10px; z-index: 99999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 90vw;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    opacity: 0;
  `;

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px;">${c.icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Loading Spinner ────────────────────────────────────────
function showLoading(container) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 gap-4">
      <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p class="text-sm text-on-surface-variant">Memuat data...</p>
    </div>
  `;
}

// ── Date Formatter ─────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return formatDate(dateStr);
}

// ── Status Badge Helper ────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    'pending': { label: 'Menunggu', color: 'bg-amber-100 text-amber-800', icon: 'schedule' },
    'preparing': { label: 'Dimasak', color: 'bg-blue-100 text-blue-800', icon: 'skillet' },
    'ready': { label: 'Siap Diambil', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    'completed': { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800', icon: 'verified' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: 'cancel' },
    'pending': { label: 'Menunggu', color: 'bg-amber-100 text-amber-800', icon: 'pending' },
    'approved': { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    'rejected': { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: 'cancel' }
  };
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: 'help' };
  return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}">
    <span class="material-symbols-outlined text-[14px]">${s.icon}</span>${s.label}
  </span>`;
}

// ── Status Progress Helper ─────────────────────────────────
function getStatusProgress(status) {
  const steps = ['pending', 'preparing', 'ready', 'completed'];
  const idx = steps.indexOf(status);
  if (status === 'cancelled') return -1;
  return idx;
}
