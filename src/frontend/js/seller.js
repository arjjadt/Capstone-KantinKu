let currentSellerTab = 'dashboard';
let currentQueueTab = 'active';
let sellerSocket = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth(['seller'])) return;
  switchTab('dashboard');
  setupSellerSocket();
  setupMenuForm();
});

// ── Tab Navigation ─────────────────────────────
function switchTab(tab) {
  currentSellerTab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tab}`)?.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Load data for tab
  if (tab === 'dashboard') loadDashboard();
  else if (tab === 'catalog') loadCatalog();
  else if (tab === 'queue') loadQueue();
  else if (tab === 'reports') loadReport('daily');
  else if (tab === 'settings') loadSettings();
}

// ── Dashboard ──────────────────────────────────
async function loadDashboard() {
  try {
    const [reportRes, queueRes, stallRes] = await Promise.all([
      fetchApi('/seller/report?period=daily'),
      fetchApi('/seller/queue'),
      fetchApi('/seller/stall/my/profile')
    ]);
    const report = reportRes.data || {};
    const queue = queueRes.data || [];
    const stall = stallRes.data || {};

    const toggle = document.getElementById('store-status-toggle');
    const text = document.getElementById('store-status-text');
    if (stall.is_open) {
      toggle.classList.add('active');
      text.textContent = 'Buka';
      text.className = 'text-sm font-semibold text-tertiary';
    } else {
      toggle.classList.remove('active');
      text.textContent = 'Tutup';
      text.className = 'text-sm font-semibold text-error';
    }

    document.getElementById('dashboard-stats').innerHTML = `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-tertiary">payments</span>
          </div>
          <span class="text-xs font-medium text-on-surface-variant">Pendapatan Hari Ini</span>
        </div>
        <p class="text-2xl font-bold text-on-surface">${formatRupiah(report.total_revenue || 0)}</p>
      </div>
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-secondary">shopping_bag</span>
          </div>
          <span class="text-xs font-medium text-on-surface-variant">Item Terjual</span>
        </div>
        <p class="text-2xl font-bold text-on-surface">${report.items_sold || 0}</p>
      </div>
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary">pending_actions</span>
          </div>
          <span class="text-xs font-medium text-on-surface-variant">Antrian Aktif</span>
        </div>
        <p class="text-2xl font-bold text-on-surface">${queue.length}</p>
      </div>
    `;

    document.getElementById('dashboard-recent').innerHTML = queue.length === 0
      ? '<p class="text-sm text-on-surface-variant text-center py-8">Belum ada pesanan aktif</p>'
      : queue.slice(0, 5).map(s => renderQueueCard(s)).join('');
  } catch (e) {
    console.error('Dashboard load error:', e);
  }
}

// ── Catalog ────────────────────────────────────
async function loadCatalog() {
  const grid = document.getElementById('catalog-grid');
  showLoading(grid);
  try {
    const res = await fetchApi('/seller/menu');
    const menus = res.data || [];
    if (menus.length === 0) {
      grid.innerHTML = '<p class="col-span-full text-center text-sm text-on-surface-variant py-8">Belum ada menu. Klik "Tambah Menu" untuk memulai.</p>';
      return;
    }
    grid.innerHTML = menus.map(menu => {
      const imgUrl = menu.photo_url ? `${API_BASE_URL.replace('/api','')}${menu.photo_url}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';
      const isAvailable = menu.availability === 'available';
      return `
        <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">
          <div class="h-48 bg-surface-container overflow-hidden relative">
            <img src="${imgUrl}" alt="${menu.name}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'"/>
          </div>
          <div class="p-4">
            <h4 class="font-bold text-on-surface text-sm mb-1">${menu.name}</h4>
            <p class="text-primary font-bold text-sm mb-3">${formatRupiah(menu.price)}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="toggle-switch ${isAvailable ? 'active' : ''}" onclick="handleToggleAvailability('${menu.id}', '${menu.availability}')"></div>
                <span class="text-xs font-medium ${isAvailable ? 'text-tertiary' : 'text-error'}">${isAvailable ? 'Tersedia' : 'Habis'}</span>
              </div>
              <div class="flex gap-1">
                <button onclick="openEditMenuModal('${menu.id}', '${menu.name.replace(/'/g,"\\'")}', ${menu.price})" class="p-1.5 hover:bg-surface-container rounded-lg transition">
                  <span class="material-symbols-outlined text-[18px] text-secondary">edit</span>
                </button>
                <button onclick="handleDeleteMenu('${menu.id}', '${menu.name.replace(/'/g,"\\'")}')" class="p-1.5 hover:bg-error-container/30 rounded-lg transition">
                  <span class="material-symbols-outlined text-[18px] text-error">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p class="text-sm text-error text-center py-8">Gagal memuat menu</p>';
  }
}

function setupMenuForm() {
  document.getElementById('menu-form').addEventListener('submit', handleSaveMenu);
  document.getElementById('menu-photo').addEventListener('change', function() {
    if (this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('menu-photo-img').src = e.target.result;
        document.getElementById('menu-photo-preview').classList.remove('hidden');
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function openMenuModal() {
  document.getElementById('menu-modal-title').textContent = 'Tambah Menu';
  document.getElementById('menu-edit-id').value = '';
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-price').value = '';
  document.getElementById('menu-photo').value = '';
  document.getElementById('menu-photo-preview').classList.add('hidden');
  document.getElementById('menu-modal').classList.remove('hidden');
}

function openEditMenuModal(id, name, price) {
  document.getElementById('menu-modal-title').textContent = 'Edit Menu';
  document.getElementById('menu-edit-id').value = id;
  document.getElementById('menu-name').value = name;
  document.getElementById('menu-price').value = price;
  document.getElementById('menu-photo').value = '';
  document.getElementById('menu-photo-preview').classList.add('hidden');
  document.getElementById('menu-modal').classList.remove('hidden');
}

function closeMenuModal() {
  document.getElementById('menu-modal').classList.add('hidden');
}

async function handleSaveMenu(e) {
  e.preventDefault();
  const id = document.getElementById('menu-edit-id').value;
  const btn = document.getElementById('menu-save-btn');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  try {
    const formData = new FormData();
    formData.append('name', document.getElementById('menu-name').value);
    formData.append('price', document.getElementById('menu-price').value);
    const photo = document.getElementById('menu-photo').files[0];
    if (photo) formData.append('photo', photo);

    if (id) {
      await fetchApi(`/seller/menu/${id}`, { method: 'PATCH', body: formData });
      showToast('Menu berhasil diperbarui!', 'success');
    } else {
      await fetchApi('/seller/menu', { method: 'POST', body: formData });
      showToast('Menu berhasil ditambahkan!', 'success');
    }
    closeMenuModal();
    loadCatalog();
  } catch (error) {
    showToast(error.message || 'Gagal menyimpan menu', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Simpan Menu';
  }
}

async function handleDeleteMenu(id, name) {
  if (!confirm(`Hapus menu "${name}"?`)) return;
  try {
    await fetchApi(`/seller/menu/${id}`, { method: 'DELETE' });
    showToast('Menu berhasil dihapus', 'success');
    loadCatalog();
  } catch (e) {
    showToast('Gagal menghapus menu', 'error');
  }
}

async function handleToggleAvailability(id, current) {
  const newStatus = current === 'available' ? 'unavailable' : 'available';
  try {
    await fetchApi(`/seller/menu/${id}/availability`, {
      method: 'PATCH', body: JSON.stringify({ availability: newStatus })
    });
    showToast(`Status menu: ${newStatus}`, 'success');
    loadCatalog();
  } catch (e) {
    showToast('Gagal mengubah status', 'error');
  }
}

// ── Queue ──────────────────────────────────────
function switchQueueTab(tab) {
  currentQueueTab = tab;
  document.getElementById('queue-tab-active').className = `px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`;
  document.getElementById('queue-tab-history').className = `px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'history' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`;
  loadQueue();
}

async function loadQueue() {
  const container = document.getElementById('queue-container');
  showLoading(container);
  try {
    const endpoint = currentQueueTab === 'active' ? '/seller/queue' : '/seller/queue/history';
    const res = await fetchApi(endpoint);
    const splits = res.data || [];
    if (splits.length === 0) {
      container.innerHTML = '<p class="text-sm text-on-surface-variant text-center py-8">Tidak ada pesanan</p>';
      return;
    }
    container.innerHTML = splits.map(s => renderQueueCard(s)).join('');
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-error text-center py-8">Gagal memuat antrian</p>';
  }
}

function renderQueueCard(split) {
  const isActive = ['pending', 'preparing', 'ready'].includes(split.status);
  return `
    <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">
      <div class="px-5 py-4 flex items-center justify-between border-b border-surface-container">
        <div>
          <p class="text-2xl font-bold text-primary">${split.queue_number}</p>
          <p class="text-xs text-on-surface-variant">${split.buyer_name || 'Pembeli'} · ${timeAgo(split.created_at)}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${split.dining_option === 'Bungkus' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
            ${split.dining_option || 'Makan di Tempat'}
          </span>
          ${getStatusBadge(split.status)}
        </div>
      </div>
      <div class="px-5 py-3 space-y-1.5">
        ${(split.items || []).map(item => `
          <div class="flex justify-between text-sm">
            <span class="text-on-surface">${item.menu_name_snapshot} ×${item.quantity}</span>
            <span class="font-medium">${formatRupiah(item.price_snapshot * item.quantity)}</span>
          </div>
          ${item.notes ? `<div class="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800"><span class="material-symbols-outlined text-[14px] mt-0.5">sticky_note_2</span><span class="font-medium">${item.notes}</span></div>` : ''}
        `).join('')}
      </div>
      <div class="px-5 py-3 border-t border-surface-container flex justify-between items-center">
        <span class="font-bold text-primary text-sm">${formatRupiah(split.subtotal)}</span>
        ${isActive ? renderQueueActions(split) : ''}
        ${!isActive && split.status === 'completed' ? `<button onclick="printInvoice('${split.id}')" class="px-3 py-1.5 border border-surface-variant text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-surface-container transition flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">receipt_long</span> Cetak Struk</button>` : ''}
      </div>
    </div>
  `;
}

function renderQueueActions(split) {
  if (split.status === 'pending') {
    return `<div class="flex gap-2">
      <button onclick="handleUpdateStatus('${split.id}','preparing')" class="px-3 py-1.5 bg-secondary text-on-secondary text-xs font-semibold rounded-lg hover:bg-on-secondary-container transition">Proses</button>
      <button onclick="handleUpdateStatus('${split.id}','cancelled')" class="px-3 py-1.5 bg-error/10 text-error text-xs font-semibold rounded-lg hover:bg-error/20 transition">Batal</button>
    </div>`;
  }
  if (split.status === 'preparing') {
    return `<div class="flex gap-2">
      <button onclick="handleUpdateStatus('${split.id}','ready')" class="px-3 py-1.5 bg-tertiary text-on-tertiary text-xs font-semibold rounded-lg hover:bg-on-tertiary-container transition">Siap</button>
      <button onclick="handleUpdateStatus('${split.id}','cancelled')" class="px-3 py-1.5 bg-error/10 text-error text-xs font-semibold rounded-lg hover:bg-error/20 transition">Batal</button>
    </div>`;
  }
  if (split.status === 'ready') {
    return `<div class="flex gap-2 items-center">
      <input type="text" maxlength="6" placeholder="Kode 6 digit" id="verify-${split.id}"
        class="w-24 px-2 py-1.5 border border-surface-container-highest rounded-lg text-xs text-center font-mono tracking-widest bg-surface focus:ring-2 focus:ring-tertiary"/>
      <button onclick="handleVerifyCode('${split.id}')" class="px-3 py-1.5 bg-tertiary text-on-tertiary text-xs font-semibold rounded-lg hover:bg-on-tertiary-container transition">Verifikasi</button>
    </div>`;
  }
  return '';
}

async function handleUpdateStatus(splitId, status) {
  try {
    await fetchApi(`/seller/queue/${splitId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status })
    });
    showToast(`Status diperbarui: ${status}`, 'success');
    loadQueue();
    if (currentSellerTab === 'dashboard') loadDashboard();
  } catch (e) {
    showToast(e.message || 'Gagal mengubah status', 'error');
  }
}

async function handleVerifyCode(splitId) {
  const input = document.getElementById(`verify-${splitId}`);
  const code = input?.value?.trim();
  if (!code || code.length !== 6) {
    showToast('Masukkan kode 6 digit', 'error');
    return;
  }
  try {
    await fetchApi(`/seller/queue/${splitId}/verify`, {
      method: 'POST', body: JSON.stringify({ code })
    });
    showToast('Berhasil verifikasi kode!', 'success');
    loadQueue();
    if (currentSellerTab === 'dashboard') loadDashboard();
  } catch (e) {
    showToast(e.message || 'Kode tidak valid', 'error');
  }
}

// ── Print Invoice ───────────────────────────────
async function printInvoice(splitId) {
  try {
    const res = await fetchApi(`/seller/queue/${splitId}`);
    const data = res.data;
    if (!data) return;
    
    const printWindow = window.open('', '_blank');
    const itemsHtml = data.items.map(i => `
      <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
        <div>${i.quantity}x ${i.menu_name_snapshot}</div>
        <div>${(parseFloat(i.price_snapshot) * i.quantity).toLocaleString('id-ID')}</div>
      </div>
    `).join('');
    
    const total = data.items.reduce((sum, i) => sum + (parseFloat(i.price_snapshot) * i.quantity), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pesanan - ${data.queue_number}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="text-center bold" style="font-size:18px;">${data.stall_name}</div>
          <div class="text-center">Antrean: <span class="bold" style="font-size:24px;">${data.queue_number}</span></div>
          <div class="divider"></div>
          <div>Tanggal: ${new Date(data.created_at).toLocaleString('id-ID')}</div>
          <div>Tipe: ${data.dining_option}</div>
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div style="display:flex; justify-content:space-between;" class="bold">
            <div>TOTAL</div>
            <div>Rp ${total.toLocaleString('id-ID')}</div>
          </div>
          <div class="divider"></div>
          <div class="text-center">Terima kasih atas pesanan Anda!</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (e) {
    showToast('Gagal memuat data struk', 'error');
  }
}

// ── Reports ────────────────────────────────────
async function loadReport(period) {
  ['daily','weekly','monthly'].forEach(p => {
    document.getElementById(`report-${p}`).className = `px-4 py-1.5 rounded-full text-sm font-semibold transition ${p === period ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`;
  });
  const container = document.getElementById('report-stats');
  try {
    const res = await fetchApi(`/seller/report?period=${period}`);
    const data = res.data || {};
    const periodLabel = period === 'daily' ? 'Hari Ini' : period === 'weekly' ? 'Minggu Ini' : 'Bulan Ini';
    container.innerHTML = `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <p class="text-xs text-on-surface-variant mb-1">Total Pendapatan (${periodLabel})</p>
        <p class="text-2xl font-bold text-tertiary">${formatRupiah(data.total_revenue || 0)}</p>
      </div>
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <p class="text-xs text-on-surface-variant mb-1">Total Pesanan</p>
        <p class="text-2xl font-bold text-on-surface">${data.total_orders || 0}</p>
      </div>
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <p class="text-xs text-on-surface-variant mb-1">Item Terjual</p>
        <p class="text-2xl font-bold text-on-surface">${data.items_sold || 0}</p>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-error">Gagal memuat laporan</p>';
  }
}

async function toggleStoreStatus() {
  const toggle = document.getElementById('store-status-toggle');
  const text = document.getElementById('store-status-text');
  const isOpen = !toggle.classList.contains('active');
  
  try {
    await fetchApi('/seller/stall/my/status', {
      method: 'PATCH',
      body: JSON.stringify({ is_open: isOpen })
    });
    
    if (isOpen) {
      toggle.classList.add('active');
      text.textContent = 'Buka';
      text.className = 'text-sm font-semibold text-tertiary';
    } else {
      toggle.classList.remove('active');
      text.textContent = 'Tutup';
      text.className = 'text-sm font-semibold text-error';
    }
    showToast(`Toko berhasil di${isOpen ? 'buka' : 'tutup'}`, 'success');
  } catch (e) {
    showToast('Gagal mengubah status toko', 'error');
  }
}

// ── Settings ───────────────────────────────────
async function loadSettings() {
  const container = document.getElementById('settings-form');
  try {
    const res = await fetchApi('/seller/stall/my/profile');
    const stall = res.data;
    container.innerHTML = `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-on-surface mb-1">Nama Warung</label>
          <input id="s-name" type="text" value="${stall.name || ''}" class="w-full px-3 py-2 border border-surface-container-highest rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary transition"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-on-surface mb-1">Deskripsi</label>
          <textarea id="s-desc" rows="3" class="w-full px-3 py-2 border border-surface-container-highest rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary transition resize-none">${stall.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-xs font-medium text-on-surface mb-1">Nomor WhatsApp</label>
          <input id="s-wa" type="tel" value="${stall.whatsapp_number || ''}" class="w-full px-3 py-2 border border-surface-container-highest rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary transition"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-on-surface mb-1">Foto Warung</label>
          <input id="s-photo" type="file" accept="image/*" class="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:cursor-pointer"/>
        </div>
        <button onclick="handleSaveSettings()" id="save-settings-btn" class="w-full bg-primary text-on-primary font-semibold py-2.5 rounded-xl hover:bg-on-primary-container transition">Simpan Pengaturan</button>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-error">Gagal memuat pengaturan</p>';
  }
}

async function handleSaveSettings() {
  const btn = document.getElementById('save-settings-btn');
  btn.disabled = true; btn.textContent = 'Menyimpan...';
  try {
    const formData = new FormData();
    formData.append('name', document.getElementById('s-name').value);
    formData.append('description', document.getElementById('s-desc').value);
    formData.append('whatsapp_number', document.getElementById('s-wa').value);
    const photo = document.getElementById('s-photo').files[0];
    if (photo) formData.append('photo', photo);

    await fetchApi('/seller/stall/my/profile', { method: 'PATCH', body: formData });
    showToast('Pengaturan berhasil disimpan!', 'success');
  } catch (e) {
    showToast(e.message || 'Gagal menyimpan', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Simpan Pengaturan';
  }
}

// ── Socket.IO ──────────────────────────────────
function setupSellerSocket() {
  try {
    sellerSocket = io('http://localhost:5000', { auth: { token: getToken() } });
    sellerSocket.on('connect', () => console.log('Seller socket connected'));
    sellerSocket.on('seller:new_order', (data) => {
      showToast(`Pesanan baru masuk! #${data.queueNumber}`, 'success');
      // Play notification sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 800; gain.gain.value = 0.3;
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        setTimeout(() => { osc.frequency.value = 1000; const o2 = ctx.createOscillator(); o2.connect(gain); o2.frequency.value = 1000; o2.start(); o2.stop(ctx.currentTime + 0.2); }, 250);
      } catch (e) {}
      if (currentSellerTab === 'queue') loadQueue();
      else if (currentSellerTab === 'dashboard') loadDashboard();
    });
  } catch (e) {
    console.error('Socket setup failed:', e);
  }
}
