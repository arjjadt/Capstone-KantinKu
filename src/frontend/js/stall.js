document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  let stallId = null;
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    stallId = params.get('id');
  }

  if (!stallId) {
    const match = window.location.href.match(/[?&]id=([^&#]+)/);
    if (match) stallId = match[1];
  }

  if (!stallId) {
    stallId = localStorage.getItem('selectedStallId');
  }

  if (!stallId) {
    console.error('Stall ID is missing from URL:', window.location.href);
    const stallsEl = document.getElementById('stalls-container');
    if (stallsEl) {
      stallsEl.innerHTML = `
        <div class="text-center py-20">
          <span class="material-symbols-outlined text-6xl text-error mb-4">link_off</span>
          <h2 class="text-xl font-bold text-on-surface mb-2">Halaman Tidak Ditemukan</h2>
          <p class="text-sm text-on-surface-variant mb-6">Warung tidak dapat dimuat karena ID tidak ditemukan di URL. Pastikan Anda mengakses halaman ini melalui daftar kantin.</p>
          <a href="index.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary-container transition shadow-md">
            <span class="material-symbols-outlined text-[20px]">home</span>
            Kembali ke Beranda
          </a>
        </div>
      `;
    }
    return;
  }

  updateCartUI();
  await loadStallDetail(stallId);
});

// Removed UMKM detail function

async function loadStallDetail(stallId) {
  const headerEl = document.getElementById('umkm-header');
  const stallsEl = document.getElementById('stalls-container');

  try {
    showLoading(stallsEl);
    const res = await fetchApi(`/stalls/${stallId}`);
    const stall = res.data;

    document.getElementById('page-title').textContent = stall.name;

    // Render Stall header
    headerEl.innerHTML = `
      <div class="mb-4">
        <a href="menu.html?umkmId=${stall.umkm_location_id}" class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors -ml-3">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Kantin
        </a>
      </div>
      <div class="relative rounded-2xl overflow-hidden bg-surface shadow-sm border border-surface-container-high ring-2 ring-primary/20">
        <div class="h-56 sm:h-72 bg-surface-container overflow-hidden">
          <img src="${stall.photo_url ? (stall.photo_url.startsWith('http') ? stall.photo_url : API_BASE_URL.replace('/api','') + stall.photo_url) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}"
               alt="${stall.name}" class="w-full h-full object-cover"
               onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
          <span class="inline-block px-2.5 py-1 bg-primary text-on-primary text-[10px] font-bold rounded-md mb-2">HALAMAN WARUNG</span>
          <h2 class="text-2xl font-bold mb-1">${stall.name}</h2>
          <p class="text-sm opacity-90">${stall.description || 'Menyediakan berbagai menu lezat.'}</p>
        </div>
      </div>
    `;

    // Fetch and render single stall without slicing menus
    await loadStallMenus([stall]);
  } catch (error) {
    console.error('Failed to load Stall:', error);
    headerEl.innerHTML = '';
    stallsEl.innerHTML = `
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-5xl text-error mb-3">error</span>
        <p class="text-sm text-on-surface-variant">Gagal memuat data warung</p>
        <button onclick="location.reload()" class="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm">Coba Lagi</button>
      </div>
    `;
  }
}

async function loadStallMenus(stalls) {
  const stallsEl = document.getElementById('stalls-container');
  stallsEl.innerHTML = '';

  for (const stall of stalls) {
    try {
      const res = await fetchApi(`/stalls/${stall.id}`);
      const stallData = res.data;
      let menus = stallData.menu || [];
      const isOpen = stallData.is_open === 1 || stallData.is_open === true || stallData.is_open === 'true';

      const section = document.createElement('div');
      section.className = 'bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm mt-4';
      section.innerHTML = `
        <div class="px-5 py-4 border-b border-surface-container flex justify-between items-center">
          <h3 class="font-bold text-on-surface text-lg">Semua Menu</h3>
          ${stallData.whatsapp_number ? `
            <a href="https://wa.me/${stallData.whatsapp_number.replace(/^0/,'62')}?text=${encodeURIComponent(`Halo ${stallData.name}, saya ingin bertanya...`)}"
               target="_blank" class="p-2 hover:bg-tertiary/10 rounded-full transition ml-2" title="Hubungi via WhatsApp">
              <span class="material-symbols-outlined text-tertiary text-[20px]">chat</span>
            </a>
          ` : ''}
        </div>
        <!-- Menu Grid -->
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${menus.length === 0
            ? '<p class="col-span-full text-center text-sm text-on-surface-variant py-4">Belum ada menu</p>'
            : menus.map(menu => renderMenuCard(menu, stallData)).join('')}
        </div>
      `;
      stallsEl.appendChild(section);
    } catch (err) {
      console.error(`Failed to load stall ${stall.id}:`, err);
    }
  }
}

// ── Render Menu Card ───────────────────────────
function renderMenuCard(menu, stall) {
  const cart = getCart();
  const inCart = cart.find(c => c.menuItemId === menu.id);
  const isAvailable = menu.availability === 'available';
  const isOpen = String(stall.is_open) === '1' || String(stall.is_open) === 'true';
  const canBuy = isAvailable && isOpen;
  
  const imgUrl = menu.photo_url
    ? (menu.photo_url.startsWith('http') ? menu.photo_url : `${API_BASE_URL.replace('/api','')}${menu.photo_url}`)
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';

  return `
    <div class="menu-card bg-surface-container-low rounded-xl border border-surface-container-high overflow-hidden transition-all duration-200 ${!canBuy ? 'opacity-60' : ''}" data-menu-id="${menu.id}">
      <div class="relative h-48 bg-surface-container overflow-hidden">
        <img src="${imgUrl}" alt="${menu.name}" class="w-full h-full object-cover"
             onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'"/>
        ${!canBuy ? `<div class="absolute inset-0 bg-surface/60 flex items-center justify-center"><span class="bg-error text-on-error text-[10px] font-bold px-2 py-1 rounded-full">${!isOpen ? 'TOKO TUTUP' : 'HABIS'}</span></div>` : ''}
      </div>
      <div class="p-3">
        <h4 class="font-semibold text-on-surface text-sm mb-0.5 line-clamp-1">${menu.name}</h4>
        <div class="flex items-center justify-between mb-2">
          <p class="text-primary font-bold text-sm">${formatRupiah(menu.price)}</p>
          ${menu.average_rating ? `
            <div class="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">
              <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1">star</span>
              <span class="text-[11px] font-bold">${Number(menu.average_rating).toFixed(1)}</span>
            </div>
          ` : ''}
        </div>
        <!-- Notes -->
        <input type="text" placeholder="Catatan..." maxlength="100"
          class="w-full px-2.5 py-1.5 text-xs border border-surface-container-highest rounded-lg bg-surface focus:ring-1 focus:ring-primary mb-2"
          id="notes-${menu.id}" value="${inCart ? inCart.notes : ''}"
          onchange="handleUpdateNotes('${menu.id}', this.value)"
          ${!canBuy ? 'disabled' : ''}/>
        <!-- Add / Qty Controls -->
        <div class="cart-controls-container" 
             data-menu-id="${menu.id}" 
             data-stall-id="${stall.id}" 
             data-stall-name="${stall.name.replace(/'/g,"\\'").replace(/"/g,"&quot;")}" 
             data-menu-name="${menu.name.replace(/'/g,"\\'").replace(/"/g,"&quot;")}" 
             data-price="${menu.price}" 
             data-img-url="${imgUrl.replace(/'/g,"\\'").replace(/"/g,"&quot;")}" 
             data-can-buy="${canBuy}"
             data-is-open="${isOpen}">
        ${canBuy ? (inCart ? `
            <button onclick="openCheckoutModal()" class="w-full bg-tertiary text-on-tertiary text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[16px]">check_circle</span> Di Keranjang (${inCart.quantity})
            </button>
        ` : `
          <button onclick="handleAddToCart('${menu.id}', '${stall.id}', '${stall.name.replace(/'/g,"\\'")}', '${menu.name.replace(/'/g,"\\'")}', ${menu.price}, '${imgUrl.replace(/'/g,"\\'")}')"
            class="w-full bg-primary hover:bg-on-primary-container text-on-primary text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span> Tambah
          </button>
        `) : `<button disabled class="w-full bg-surface-container text-on-surface-variant text-xs font-medium py-2 rounded-lg cursor-not-allowed">${!isOpen ? 'Toko Tutup' : 'Tidak Tersedia'}</button>`}
        </div>
      </div>
    </div>
  `;
}

// ── Cart Handlers ──────────────────────────────
function handleAddToCart(menuItemId, stallId, stallName, name, price, photoUrl) {
  const notesEl = document.getElementById(`notes-${menuItemId}`);
  const notes = notesEl ? notesEl.value : '';

  addToCart({
    menuItemId, stallId, stallName, name, price: parseFloat(price), quantity: 1, notes, photoUrl
  });

  showToast(`${name} ditambahkan ke keranjang`, 'success');
  refreshMenuCards();
  updateCartUI();
}

function handleUpdateQty(menuItemId, delta, stallId, stallName, name, price, photoUrl) {
  const cart = getCart();
  const item = cart.find(c => c.menuItemId === menuItemId);
  if (!item) {
    if (delta > 0) handleAddToCart(menuItemId, stallId, stallName, name, price, photoUrl);
    return;
  }

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    removeFromCart(menuItemId);
    showToast(`${name} dihapus dari keranjang`, 'info');
  } else {
    updateCartQuantity(menuItemId, newQty);
  }
  refreshMenuCards();
  updateCartUI();
  const modal = document.getElementById('checkout-modal');
  if (modal && !modal.classList.contains('hidden')) openCheckoutModal();
}

function handleUpdateNotes(menuItemId, notes) {
  updateCartNotes(menuItemId, notes);
}

function refreshMenuCards() {
  const cart = getCart();
  document.querySelectorAll('.cart-controls-container').forEach(container => {
    const menuId = container.getAttribute('data-menu-id');
    const stallId = container.getAttribute('data-stall-id');
    const stallName = container.getAttribute('data-stall-name');
    const menuName = container.getAttribute('data-menu-name');
    const price = container.getAttribute('data-price');
    const imgUrl = container.getAttribute('data-img-url');
    const canBuy = container.getAttribute('data-can-buy') === 'true';
    const isOpen = container.getAttribute('data-is-open') === 'true';
    
    const inCart = cart.find(c => c.menuItemId === menuId);
    
    if (canBuy) {
      if (inCart) {
        container.innerHTML = `<button onclick="openCheckoutModal()" class="w-full bg-tertiary text-on-tertiary text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1"><span class="material-symbols-outlined text-[16px]">check_circle</span> Di Keranjang (${inCart.quantity})</button>`;
      } else {
        container.innerHTML = `<button onclick="handleAddToCart('${menuId}', '${stallId}', '${stallName}', '${menuName}', ${price}, '${imgUrl}')" class="w-full bg-primary hover:bg-on-primary-container text-on-primary text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1"><span class="material-symbols-outlined text-[16px]">add_shopping_cart</span> Tambah</button>`;
      }
    }
  });
}

// ── Cart UI ────────────────────────────────────
function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();
  const badge = document.getElementById('cart-badge');
  const bar = document.getElementById('cart-bar');
  const barCount = document.getElementById('cart-bar-count');
  const barTotal = document.getElementById('cart-bar-total');
  const bottomNav = document.getElementById('bottom-nav');

  if (badge) {
    if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); badge.classList.add('flex'); }
    else { badge.classList.add('hidden'); }
  }

  if (bar) {
    if (count > 0) {
      bar.classList.remove('hidden');
      if (bottomNav) bottomNav.classList.add('hidden');
      barCount.textContent = `${count} item`;
      barTotal.textContent = formatRupiah(total);
    } else {
      bar.classList.add('hidden');
      if (bottomNav) bottomNav.classList.remove('hidden');
    }
  }
}

// ── Checkout Modal ─────────────────────────────
function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Keranjang masih kosong', 'info');
    return;
  }

  const modal = document.getElementById('checkout-modal');
  const body = document.getElementById('checkout-body');
  const totalEl = document.getElementById('checkout-total');

  const grouped = getCartByStall();
  let total = 0;

  body.innerHTML = Object.entries(grouped).map(([stallId, group]) => {
    const subtotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0);
    total += subtotal;
    return `
      <div class="space-y-3">
        <h3 class="font-bold text-on-surface text-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[18px]">storefront</span>
          ${group.stallName}
        </h3>
        ${group.items.map(item => `
          <div class="flex gap-3 bg-surface-container-low rounded-xl p-3">
            <img src="${item.photoUrl || ''}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                 onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100'"/>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-on-surface line-clamp-1">${item.name}</p>
                <p class="text-xs text-primary font-semibold mb-1">${formatRupiah(item.price)}</p>
                <div class="flex items-center gap-2 bg-surface rounded-lg p-0.5 inline-flex border border-surface-container-high">
                  <button onclick="handleUpdateQty('${item.menuItemId}', -1, '${item.stallId}', '${item.stallName.replace(/'/g,"\\'")}', '${item.name.replace(/'/g,"\\'")}', ${item.price}, '${item.photoUrl}')" class="w-6 h-6 rounded bg-surface-container flex items-center justify-center hover:bg-error-container transition"><span class="material-symbols-outlined text-[14px]">remove</span></button>
                  <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
                  <button onclick="handleUpdateQty('${item.menuItemId}', 1, '${item.stallId}', '${item.stallName.replace(/'/g,"\\'")}', '${item.name.replace(/'/g,"\\'")}', ${item.price}, '${item.photoUrl}')" class="w-6 h-6 rounded bg-surface-container flex items-center justify-center hover:bg-tertiary-container transition"><span class="material-symbols-outlined text-[14px]">add</span></button>
                </div>
              ${item.notes ? `<p class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block"><span class="font-medium">📝</span> ${item.notes}</p>` : ''}
            </div>
            <div class="flex flex-col items-end justify-between">
              <button onclick="removeFromCart('${item.menuItemId}');openCheckoutModal();updateCartUI();"
                class="p-1 text-error hover:bg-error-container/30 rounded transition">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <p class="text-sm font-bold text-on-surface">${formatRupiah(item.price * item.quantity)}</p>
            </div>
          </div>
        `).join('')}
        <div class="flex justify-between text-sm px-1">
          <span class="text-on-surface-variant">Subtotal</span>
          <span class="font-semibold text-on-surface">${formatRupiah(subtotal)}</span>
        </div>
      </div>
    `;
  }).join('<hr class="border-surface-container-high"/>');

  totalEl.textContent = formatRupiah(total);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Checkout ───────────────────────────────────
async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const diningOption = document.querySelector('input[name="dining_option"]:checked')?.value || 'dine_in';
  const btn = document.getElementById('checkout-btn');
  const originalHtml = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses...';

  try {
    const items = cart.map(c => ({
      stall_id: c.stallId,
      menu_item_id: c.menuItemId,
      quantity: c.quantity,
      notes: c.notes || ''
    }));

    const res = await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, dining_option: diningOption })
    });

    clearCart();
    showToast('Pesanan berhasil dibuat! 🎉', 'success');
    closeCheckoutModal();

    setTimeout(() => {
      window.location.href = `orders.html?orderId=${res.data.orderId}`;
    }, 1000);
  } catch (error) {
    showToast('Checkout gagal: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// ── Reviews Modal ──────────────────────────────
async function openReviewsModal(stallId) {
  const modal = document.getElementById('reviews-modal');
  const content = document.getElementById('reviews-modal-content');
  const list = document.getElementById('reviews-list');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    content.classList.remove('translate-y-full');
  }, 10);
  
  list.innerHTML = `
    <div class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  `;
  
  try {
    const res = await fetchApi(`/stalls/${stallId}/ratings`);
    const ratings = res.data.ratings || [];
    
    if (ratings.length === 0) {
      list.innerHTML = '<p class="text-center text-sm text-on-surface-variant py-8">Belum ada ulasan.</p>';
      return;
    }
    
    list.innerHTML = ratings.map(r => `
      <div class="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center overflow-hidden">
              ${r.user_avatar ? `<img src="${API_BASE_URL.replace('/api','')}${r.user_avatar}" class="w-full h-full object-cover"/>` : '<span class="material-symbols-outlined text-[16px] text-primary">person</span>'}
            </div>
            <div>
              <p class="text-sm font-semibold text-on-surface">${r.user_name}</p>
              <p class="text-[10px] text-on-surface-variant">${timeAgo(r.created_at)}</p>
            </div>
          </div>
          <div class="flex items-center gap-0.5 text-amber-500">
            <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1">star</span>
            <span class="text-xs font-bold text-on-surface">${r.stars}</span>
          </div>
        </div>
        <p class="text-[11px] font-medium text-primary mb-1">Memesan: ${r.menu_name}</p>
        ${r.comment ? `<p class="text-xs text-on-surface mt-1 whitespace-pre-wrap">${r.comment}</p>` : ''}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-center text-sm text-error py-8">Gagal memuat ulasan.</p>';
  }
}

function closeReviewsModal() {
  const modal = document.getElementById('reviews-modal');
  const content = document.getElementById('reviews-modal-content');
  content.classList.add('translate-y-full');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}
