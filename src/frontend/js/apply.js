// ── UMKM Application ──────────────────────────
let sellerCount = 0;

function initUmkmForm() {
  if (!requireAuth()) return;
  // Add 5 initial seller fields
  for (let i = 0; i < 5; i++) addSellerField();

  document.getElementById('umkm-form').addEventListener('submit', handleUmkmSubmit);
}

function addSellerField() {
  sellerCount++;
  const container = document.getElementById('sellers-container');
  const div = document.createElement('div');
  div.className = 'flex gap-2 items-start seller-row';
  div.id = `seller-row-${sellerCount}`;
  div.innerHTML = `
    <div class="flex-1 grid grid-cols-2 gap-2">
      <input type="text" placeholder="Nama calon penjual" required
        class="px-3 py-2 border border-surface-container-highest rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary transition seller-name"/>
      <input type="tel" placeholder="No. HP / WA"
        class="px-3 py-2 border border-surface-container-highest rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary transition seller-phone"/>
    </div>
    ${sellerCount > 5 ? `
    <button type="button" onclick="removeSellerField('seller-row-${sellerCount}')"
      class="p-2 text-error hover:bg-error-container/30 rounded-lg transition flex-shrink-0 mt-0.5">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
    ` : '<div class="w-10"></div>'}
  `;
  container.appendChild(div);
  updateSellerCount();
}

function removeSellerField(id) {
  document.getElementById(id)?.remove();
  updateSellerCount();
}

function updateSellerCount() {
  const count = document.querySelectorAll('.seller-row').length;
  const text = document.getElementById('seller-count-text');
  if (text) {
    text.textContent = `${count} dari 5 calon penjual (minimum)`;
    text.style.color = count >= 5 ? '#006d3e' : '#8d7168';
  }
}

async function handleUmkmSubmit(e) {
  e.preventDefault();

  // Collect seller data
  const sellers = [];
  document.querySelectorAll('.seller-row').forEach(row => {
    const name = row.querySelector('.seller-name')?.value?.trim();
    const phone = row.querySelector('.seller-phone')?.value?.trim();
    if (name) sellers.push({ name, phone });
  });

  if (sellers.length < 5) {
    showToast('Minimal 5 calon penjual harus diisi', 'error');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Mengajukan...';

  try {
    // Send UMKM application data
    // We include sellers in the description since backend doesn't have a separate field
    const sellersList = sellers.map((s, i) => `${i+1}. ${s.name}${s.phone ? ' (' + s.phone + ')' : ''}`).join('\n');
    const description = document.getElementById('description').value + '\n\n--- Calon Penjual ---\n' + sellersList;

    const formData = new FormData();
    formData.append('proposed_name', document.getElementById('proposed_name').value);
    formData.append('description', description);
    formData.append('city_region', document.getElementById('city_region').value);
    formData.append('full_address', document.getElementById('full_address').value);

    await fetchApi('/applications/umkm', {
      method: 'POST',
      body: formData
    });

    showToast('Pengajuan UMKM berhasil dikirim! 🎉', 'success');
    setTimeout(() => window.location.href = 'profile.html', 1500);
  } catch (error) {
    showToast(error.message || 'Gagal mengajukan UMKM', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">send</span> Ajukan Pendaftaran UMKM';
  }
}

// ── Stall Application ─────────────────────────
async function initStallForm() {
  if (!requireAuth()) return;

  // Load UMKM locations for dropdown
  try {
    const res = await fetchApi('/umkm');
    const umkms = res.data || [];
    const select = document.getElementById('stall_umkm');
    select.innerHTML = '<option value="">Pilih lokasi UMKM...</option>' +
      umkms.map(u => `<option value="${u.id}">${u.name} - ${u.city_region}</option>`).join('');
  } catch (error) {
    console.error('Failed to load UMKMs:', error);
  }

  document.getElementById('stall-form').addEventListener('submit', handleStallSubmit);
}

async function handleStallSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('stall-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Mengajukan...';

  try {
    await fetchApi('/applications/stall', {
      method: 'POST',
      body: JSON.stringify({
        umkm_location_id: document.getElementById('stall_umkm').value,
        proposed_name: document.getElementById('stall_name').value,
        whatsapp_number: document.getElementById('stall_wa').value,
        description: document.getElementById('stall_desc').value
      })
    });

    showToast('Pengajuan warung berhasil dikirim! 🎉', 'success');
    setTimeout(() => window.location.href = 'profile.html', 1500);
  } catch (error) {
    showToast(error.message || 'Gagal mengajukan warung', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">send</span> Ajukan Pendaftaran Warung';
  }
}
