document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  setupUserMenu(user);
  updateCartBadge();
  setupSearch();
  loadUmkms();
});

let allUmkms = [];
let currentCity = '';
let searchTimeout = null;

// ── User Menu ──────────────────────────────────
function setupUserMenu(user) {
  if (!user) return;
  const initial = document.getElementById('user-initial');
  const avatar = document.getElementById('user-avatar');
  const fullname = document.getElementById('user-fullname');
  const role = document.getElementById('user-role');

  if (initial) initial.textContent = (user.full_name || user.username || '?')[0].toUpperCase();
  if (fullname) fullname.textContent = user.full_name || user.username;
  if (role) role.textContent = user.role === 'seller' ? 'Penjual' : user.role === 'admin' ? 'Admin' : 'Pembeli';

  if (user.avatar_url && avatar) {
    avatar.src = user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL.replace('/api', '')}${user.avatar_url}`;
    avatar.classList.remove('hidden');
    if (initial) initial.classList.add('hidden');
  }

  // Toggle dropdown
  const btn = document.getElementById('user-menu-btn');
  const dropdown = document.getElementById('user-dropdown');
  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }
}

// ── Cart Badge ─────────────────────────────────
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getCartCount();
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// ── Search ─────────────────────────────────────
function setupSearch() {
  const searchDesktop = document.getElementById('search-input');
  const searchMobile = document.getElementById('search-input-mobile');

  const handler = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim();
      // Sync both inputs
      if (searchDesktop && e.target !== searchDesktop) searchDesktop.value = query;
      if (searchMobile && e.target !== searchMobile) searchMobile.value = query;
      loadUmkms(query, currentCity);
    }, 300);
  };

  if (searchDesktop) searchDesktop.addEventListener('input', handler);
  if (searchMobile) searchMobile.addEventListener('input', handler);
}

// ── Load UMKMs ─────────────────────────────────
async function loadUmkms(search = '', city = '') {
  const grid = document.getElementById('umkm-grid');
  const empty = document.getElementById('empty-state');

  try {
    let endpoint = '/umkm';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    if (params.length) endpoint += '?' + params.join('&');

    const response = await fetchApi(endpoint);
    const umkms = response.data || [];
    allUmkms = umkms;

    // Build city filters (only on initial load without city filter)
    if (!city && !search) buildCityFilters(umkms);

    if (umkms.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    renderUmkmCards(umkms);
  } catch (error) {
    console.error('Failed to load UMKM:', error);
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <span class="material-symbols-outlined text-5xl text-error mb-3">error</span>
        <p class="text-sm text-on-surface-variant">Gagal memuat data. Pastikan server berjalan.</p>
        <button onclick="loadUmkms()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-on-primary-container transition">Coba Lagi</button>
      </div>
    `;
  }
}

// ── Render Cards ───────────────────────────────
function renderUmkmCards(umkms) {
  const grid = document.getElementById('umkm-grid');
  grid.innerHTML = umkms.map((umkm, i) => `
    <a href="menu.html?umkmId=${umkm.id}" onclick="localStorage.setItem('selectedUmkmId', '${umkm.id}')" class="card-hover bg-surface rounded-2xl shadow-sm border border-surface-container-high overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col animate-fadeUp block"
         style="animation-delay:${i * 80}ms">
      <div class="relative h-44 bg-surface-container overflow-hidden">
        <img src="${umkm.photo_url ? (umkm.photo_url.startsWith('http') ? umkm.photo_url : API_BASE_URL.replace('/api','') + umkm.photo_url) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'}"
             alt="${umkm.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'"/>
        <div class="absolute top-3 left-3">
          <span class="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-tertiary shadow-sm flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Aktif
          </span>
        </div>
        <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="font-bold text-on-surface text-base mb-1 line-clamp-1">${umkm.name}</h3>
        <p class="text-xs text-on-surface-variant mb-3 line-clamp-2">${umkm.description || 'Pusat kuliner terlengkap'}</p>
        <div class="mt-auto space-y-1.5">
          <div class="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            <span class="truncate">${umkm.city_region || ''}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[16px] text-outline">pin_drop</span>
            <span class="truncate">${umkm.full_address || ''}</span>
          </div>
        </div>
      </div>
    </a>
  `).join('');
}

// ── City Filters ───────────────────────────────
function buildCityFilters(umkms) {
  const container = document.getElementById('city-filters');
  const cities = [...new Set(umkms.map(u => u.city_region).filter(Boolean))];

  container.innerHTML = `
    <button onclick="filterByCity('')" class="${!currentCity ? 'chip-active' : ''} whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-surface-container text-on-surface-variant border border-surface-container-highest hover:border-primary transition" data-city="">
      Semua
    </button>
    ${cities.map(city => `
      <button onclick="filterByCity('${city}')" class="${currentCity === city ? 'chip-active' : ''} whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-surface-container text-on-surface-variant border border-surface-container-highest hover:border-primary transition" data-city="${city}">
        ${city}
      </button>
    `).join('')}
  `;
}

function filterByCity(city) {
  currentCity = city;
  // Update chip styles
  document.querySelectorAll('#city-filters button').forEach(btn => {
    btn.classList.toggle('chip-active', btn.dataset.city === city);
  });
  const search = document.getElementById('search-input')?.value || document.getElementById('search-input-mobile')?.value || '';
  loadUmkms(search, city);
}
