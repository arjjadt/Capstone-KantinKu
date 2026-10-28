let currentTab = 'active';
let allOrders = [];
let selectedStars = 0;
let socket = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  await loadOrders();
  setupSocket();
});

// ── Tab Switching ──────────────────────────────
function switchOrderTab(tab) {
  currentTab = tab;
  document.getElementById('tab-active').className = `flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${tab === 'active' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`;
  document.getElementById('tab-history').className = `flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`;
  renderOrders();
}

// ── Load Orders ────────────────────────────────
async function loadOrders() {
  const container = document.getElementById('orders-container');
  showLoading(container);

  try {
    const res = await fetchApi('/orders');
    const orders = res.data || [];

    // Load details for each order
    allOrders = [];
    for (const order of orders) {
      try {
        const detailRes = await fetchApi(`/orders/${order.id}`);
        allOrders.push(detailRes.data);
      } catch (e) {
        console.error('Failed to load order detail:', e);
      }
    }

    renderOrders();
  } catch (error) {
    container.innerHTML = `
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-5xl text-error mb-3">error</span>
        <p class="text-sm text-on-surface-variant">Gagal memuat pesanan</p>
        <button onclick="loadOrders()" class="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm">Coba Lagi</button>
      </div>
    `;
  }
}

// ── Render Orders ──────────────────────────────
function renderOrders() {
  const container = document.getElementById('orders-container');
  const empty = document.getElementById('orders-empty');
  const activeStatuses = ['pending', 'preparing', 'ready'];
  const historyStatuses = ['completed', 'cancelled'];

  // Flatten all splits from all orders
  let splits = [];
  allOrders.forEach(order => {
    if (order.splits) {
      order.splits.forEach(split => {
        splits.push({ ...split, orderId: order.id, orderDate: order.created_at });
      });
    }
  });

  // Filter by tab
  const filtered = currentTab === 'active'
    ? splits.filter(s => activeStatuses.includes(s.status))
    : splits.filter(s => historyStatuses.includes(s.status));

  if (filtered.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = filtered.map(split => renderSplitCard(split)).join('');
}

function renderSplitCard(split) {
  const progress = getStatusProgress(split.status);
  const steps = ['pending', 'preparing', 'ready', 'completed'];
  const stepLabels = ['Antrean', 'Dimasak', 'Siap', 'Selesai'];
  const isCancelled = split.status === 'cancelled';

  const waPhone = split.stall_whatsapp ? split.stall_whatsapp.replace(/^0/, '62') : '';
  const waMsg = encodeURIComponent(`Halo Warung ${split.stall_name}, saya ingin bertanya tentang pesanan Antrean nomor ${split.queue_number}...`);
  const hasRated = split.is_rated > 0;

  return `
    <div class="bg-surface rounded-2xl border border-surface-container-high shadow-sm overflow-hidden" id="split-${split.id}">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-surface-container flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
            ${split.stall_photo
              ? `<img src="${API_BASE_URL.replace('/api','')}${split.stall_photo}" class="w-full h-full rounded-xl object-cover"/>`
              : '<span class="material-symbols-outlined text-primary">storefront</span>'}
          </div>
          <div>
            <p class="text-sm font-bold text-on-surface">${split.stall_name || 'Warung'}</p>
            <p class="text-[11px] text-on-surface-variant">${timeAgo(split.orderDate || split.created_at)}</p>
          </div>
        </div>
        ${getStatusBadge(split.status)}
      </div>

      <!-- Queue Number & Progress -->
      <div class="px-5 py-4">
        <div class="text-center mb-4">
          <p class="text-xs text-on-surface-variant mb-1">Nomor Antrean</p>
          <p class="text-3xl font-bold text-primary tracking-wider">${split.queue_number}</p>
        </div>

        <!-- Progress Bar -->
        ${!isCancelled ? `
        <div class="flex items-center justify-between mb-4 px-2">
          ${steps.map((step, i) => `
            ${i > 0 ? `<div class="progress-line ${progress >= i ? 'active' : 'inactive'}"></div>` : ''}
            <div class="flex flex-col items-center gap-1">
              <div class="progress-dot ${progress >= i ? 'active' : 'inactive'}">
                <span class="material-symbols-outlined text-[14px]">${progress >= i ? 'check' : (i + 1)}</span>
              </div>
              <span class="text-[10px] font-medium ${progress >= i ? 'text-tertiary' : 'text-on-surface-variant'}">${stepLabels[i]}</span>
            </div>
          `).join('')}
        </div>
        ` : `
        <div class="text-center mb-4">
          <span class="inline-flex items-center gap-1 text-error text-sm font-medium">
            <span class="material-symbols-outlined text-[18px]">cancel</span> Pesanan Dibatalkan
          </span>
        </div>
        `}

        <!-- Verification Code (show when ready) -->
        ${split.status === 'ready' ? `
        <div class="bg-tertiary/5 border border-tertiary/20 rounded-xl p-4 mb-4 text-center">
          <p class="text-xs text-on-surface-variant mb-2">Kode Verifikasi (tunjukkan ke kasir)</p>
          <div class="flex justify-center gap-1.5 mb-2" id="code-display-${split.id}">
            ${split.verification_code.split('').map(d => `<div class="code-digit">${d}</div>`).join('')}
          </div>
          <button onclick="copyCode('${split.verification_code}')" class="text-xs text-tertiary font-medium hover:underline flex items-center gap-1 mx-auto">
            <span class="material-symbols-outlined text-[14px]">content_copy</span> Salin kode
          </button>
        </div>
        ` : ''}

        <!-- Dining Option -->
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${split.dining_option === 'Bungkus' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
            <span class="material-symbols-outlined text-[12px] align-middle">${split.dining_option === 'Bungkus' ? 'takeout_dining' : 'restaurant'}</span>
            ${split.dining_option || 'Makan di Tempat'}
          </span>
        </div>

        <!-- Items -->
        <div class="space-y-2 mb-4">
          ${(split.items || []).map(item => `
            <div class="flex items-start justify-between text-sm">
              <div class="flex-1">
                <span class="text-on-surface">${item.menu_name_snapshot} <span class="text-on-surface-variant">×${item.quantity}</span></span>
                ${item.notes ? `<p class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5 inline-block">📝 ${item.notes}</p>` : ''}
              </div>
              <span class="text-on-surface font-medium ml-2">${formatRupiah(item.price_snapshot * item.quantity)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Subtotal -->
        <div class="flex justify-between text-sm font-bold border-t border-surface-container pt-3">
          <span>Total</span>
          <span class="text-primary">${formatRupiah(split.subtotal)}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-5 py-3 bg-surface-container-low border-t border-surface-container flex gap-2">
        ${waPhone ? `
        <a href="https://wa.me/${waPhone}?text=${waMsg}" target="_blank"
          class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-tertiary bg-tertiary/10 hover:bg-tertiary/20 transition">
          <span class="material-symbols-outlined text-[18px]">chat</span> WhatsApp
        </a>
        ` : ''}
        ${split.status === 'completed' && !hasRated ? `
        <button onclick="openRatingModal('${split.stall_id}', '${split.id}', '${split.stall_name.replace(/'/g,"\\'")}', ${JSON.stringify(split.items).replace(/"/g, '&quot;')})" class="w-full mt-4 bg-tertiary text-on-tertiary text-sm font-semibold py-2 rounded-xl hover:bg-on-tertiary-container transition flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">star</span> Beri Rating
        </button>
        ` : ''}
        ${['completed', 'ready'].includes(split.status) ? `
        <button onclick="printInvoice('${split.id}')" class="w-full mt-2 border border-surface-variant text-on-surface-variant text-sm font-semibold py-2 rounded-xl hover:bg-surface-container transition flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">receipt_long</span> Cetak Struk
        </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ── Socket.IO ──────────────────────────────────
function setupSocket() {
  try {
    socket = io('http://localhost:5000', {
      auth: { token: getToken() }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      // Join rooms for all active splits
      allOrders.forEach(order => {
        if (order.splits) {
          order.splits.forEach(split => {
            if (['pending', 'preparing', 'ready'].includes(split.status)) {
              socket.emit('join_order_room', split.id);
            }
          });
        }
      });
    });

    socket.on('order:status_updated', (data) => {
      console.log('Status updated:', data);
      // Update local data
      allOrders.forEach(order => {
        if (order.splits) {
          const split = order.splits.find(s => s.id === data.splitId);
          if (split) {
            split.status = data.status;
            split.updated_at = data.updatedAt;
          }
        }
      });
      renderOrders();
      showToast(`Pesanan diperbarui: ${data.status}`, 'info');
    });
  } catch (e) {
    console.error('Socket setup failed:', e);
  }
}

// ── Copy Code ──────────────────────────────────
function copyCode(code) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Kode berhasil disalin!', 'success');
    }).catch(() => fallbackCopyCode(code));
  } else {
    fallbackCopyCode(code);
  }
}

function fallbackCopyCode(code) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = code;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      showToast('Kode berhasil disalin!', 'success');
    } else {
      showToast('Gagal menyalin kode manual', 'error');
    }
  } catch (err) {
    showToast('Browser tidak mendukung', 'error');
  }
}

// ── Rating ─────────────────────────────────────
let ratingItemsState = {};

function openRatingModal(stallId, splitId) {
  document.getElementById('rating-stall-id').value = stallId;
  document.getElementById('rating-split-id').value = splitId;
  document.getElementById('rating-anonymous').checked = false;
  
  ratingItemsState = {};
  
  const split = allOrders.flatMap(o => o.splits || []).find(s => s.id === splitId);
  if (!split || !split.items) return;

  const container = document.getElementById('rating-items-container');
  container.innerHTML = split.items.map(item => {
    // Only allow rating items that have a menu_item_id (not deleted or arbitrary)
    if (!item.menu_item_id) return '';
    ratingItemsState[item.menu_item_id] = { stars: 0, comment: '' };
    return `
      <div class="border border-surface-container-highest rounded-xl p-3 bg-surface-container-lowest">
        <p class="font-medium text-sm text-on-surface mb-2">${item.menu_name_snapshot}</p>
        <div class="flex gap-2 mb-3">
          ${[1, 2, 3, 4, 5].map(n => `
            <button onclick="selectItemStar('${item.menu_item_id}', ${n})" id="star-${item.menu_item_id}-${n}" class="text-3xl text-surface-container-highest hover:text-amber-400 transition">★</button>
          `).join('')}
        </div>
        <textarea onchange="updateItemComment('${item.menu_item_id}', this.value)" rows="2" placeholder="Tulis ulasan (opsional)..."
          class="w-full px-3 py-2 border border-surface-container-highest rounded-lg text-xs bg-surface focus:ring-2 focus:ring-primary resize-none"></textarea>
      </div>
    `;
  }).join('');

  document.getElementById('rating-modal').classList.remove('hidden');
}

function closeRatingModal() {
  document.getElementById('rating-modal').classList.add('hidden');
}

function selectItemStar(menuItemId, n) {
  ratingItemsState[menuItemId].stars = n;
  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`star-${menuItemId}-${i}`);
    if (btn) btn.style.color = i <= n ? '#f59e0b' : '#e0e3e6';
  }
}

function updateItemComment(menuItemId, comment) {
  ratingItemsState[menuItemId].comment = comment;
}

async function submitRating() {
  const stallId = document.getElementById('rating-stall-id').value;
  const splitId = document.getElementById('rating-split-id').value;
  const isAnonymous = document.getElementById('rating-anonymous').checked;
  const btn = document.getElementById('rating-submit-btn');

  const itemsToRate = Object.entries(ratingItemsState)
    .filter(([_, state]) => state.stars > 0)
    .map(([menu_item_id, state]) => ({
      menu_item_id,
      stars: state.stars,
      comment: state.comment
    }));

  if (itemsToRate.length === 0) {
    showToast('Pilih rating bintang minimal untuk satu menu', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  try {
    await fetchApi('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        stall_id: stallId,
        order_split_id: splitId,
        is_anonymous: isAnonymous,
        items: itemsToRate
      })
    });
    showToast('Rating berhasil dikirim! ⭐', 'success');
    closeRatingModal();
    loadOrders();
  } catch (e) {
    showToast('Gagal mengirim ulasan', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirim Rating';
  }
}

// ── Print Invoice ───────────────────────────────
async function printInvoice(splitId) {
  try {
    const res = await fetchApi(`/orders/splits/${splitId}`);
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
