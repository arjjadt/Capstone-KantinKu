document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth(['admin'])) return;
  switchAdminTab('overview');
});

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  if (tab === 'overview') loadOverview();
  else if (tab === 'umkm-apps') loadUmkmApps();
  else if (tab === 'stall-apps') loadStallApps();
  else if (tab === 'users') loadUsers();
  else if (tab === 'umkm-mgmt') loadUmkmMgmt();
  else if (tab === 'stall-mgmt') loadStallMgmt();
}

// ── Overview (FR-13 Metrics) ───────────────────
async function loadOverview() {
  const container = document.getElementById('overview-content');
  try {
    const [statsRes, metricsRes] = await Promise.all([
      fetchApi('/admin/stats'),
      fetchApi('/admin/metrics')
    ]);
    const stats = statsRes.data || {};
    const metrics = metricsRes.data || {};

    container.innerHTML = `
      <h2 class="text-xl font-bold text-on-surface mb-1">Dashboard Admin</h2>
      <p class="text-sm text-on-surface-variant mb-6">Ringkasan operasional platform</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2"><span class="material-symbols-outlined text-primary">group</span></div>
          <p class="text-2xl font-bold text-on-surface">${stats.total_users || 0}</p>
          <p class="text-xs text-on-surface-variant">Total Pengguna</p>
        </div>
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <div class="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-2"><span class="material-symbols-outlined text-secondary">location_city</span></div>
          <p class="text-2xl font-bold text-on-surface">${metrics.active_umkm || 0}</p>
          <p class="text-xs text-on-surface-variant">UMKM Aktif</p>
        </div>
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center mb-2"><span class="material-symbols-outlined text-tertiary">receipt_long</span></div>
          <p class="text-2xl font-bold text-on-surface">${metrics.total_orders || 0}</p>
          <p class="text-xs text-on-surface-variant">Total Pesanan</p>
        </div>
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2"><span class="material-symbols-outlined text-amber-600">payments</span></div>
          <p class="text-2xl font-bold text-on-surface">${formatRupiah(metrics.total_revenue || 0)}</p>
          <p class="text-xs text-on-surface-variant">Total Revenue</p>
        </div>
      </div>

      <!-- Pending Alerts -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        ${metrics.pending_umkm_applications > 0 ? `
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-amber-400 transition" onclick="switchAdminTab('umkm-apps')">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center"><span class="material-symbols-outlined text-amber-700">pending_actions</span></div>
          <div><p class="text-lg font-bold text-amber-800">${metrics.pending_umkm_applications}</p><p class="text-xs text-amber-700">Pengajuan UMKM menunggu review</p></div>
        </div>` : ''}
        ${metrics.pending_stall_applications > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-blue-400 transition" onclick="switchAdminTab('stall-apps')">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><span class="material-symbols-outlined text-blue-700">pending_actions</span></div>
          <div><p class="text-lg font-bold text-blue-800">${metrics.pending_stall_applications}</p><p class="text-xs text-blue-700">Pengajuan Warung menunggu review</p></div>
        </div>` : ''}
      </div>

      <!-- Performance -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <p class="text-xs text-on-surface-variant mb-1">Pesanan Selesai</p>
          <p class="text-2xl font-bold text-tertiary">${metrics.completed_orders || 0}</p>
        </div>
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <p class="text-xs text-on-surface-variant mb-1">Pesanan Dibatalkan</p>
          <p class="text-2xl font-bold text-error">${metrics.cancelled_orders || 0}</p>
        </div>
        <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
          <p class="text-xs text-on-surface-variant mb-1">Error Rate</p>
          <p class="text-2xl font-bold text-on-surface">${metrics.error_rate || 0}%</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <h3 class="text-sm font-bold text-on-surface mb-3">Aktivitas Terbaru</h3>
      <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-surface-container bg-surface-container-low">
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Warung</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Antrean</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Status</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Waktu</th>
          </tr></thead>
          <tbody>
            ${(metrics.recent_orders || []).map(o => `
              <tr class="border-b border-surface-container last:border-0">
                <td class="px-4 py-3 text-on-surface">${o.stall_name}</td>
                <td class="px-4 py-3 font-mono text-on-surface">${o.queue_number}</td>
                <td class="px-4 py-3">${getStatusBadge(o.status)}</td>
                <td class="px-4 py-3 text-on-surface-variant">${timeAgo(o.created_at)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" class="px-4 py-8 text-center text-on-surface-variant">Belum ada aktivitas</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-error py-8">Gagal memuat data</p>';
  }
}

// ── UMKM Applications ──────────────────────────
async function loadUmkmApps() {
  const list = document.getElementById('umkm-apps-list');
  showLoading(list);
  try {
    const res = await fetchApi('/admin/applications/umkm');
    const apps = res.data || [];
    if (apps.length === 0) { list.innerHTML = '<p class="text-sm text-on-surface-variant text-center py-8">Tidak ada pengajuan</p>'; return; }
    list.innerHTML = apps.map(app => `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-on-surface">${app.proposed_name}</h3>
            <p class="text-xs text-on-surface-variant">${app.city_region} · ${app.full_address || ''}</p>
            <p class="text-xs text-on-surface-variant mt-1">Oleh: ${app.applicant_name || app.user_id} · ${formatDate(app.created_at)}</p>
          </div>
          ${getStatusBadge(app.status)}
        </div>
        ${app.description ? `<p class="text-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3 mb-3 whitespace-pre-line">${app.description}</p>` : ''}
        ${app.status === 'pending' ? `
        <div class="flex gap-2">
          <button onclick="openReviewModal('${app.id}', 'umkm', '${app.proposed_name.replace(/'/g,"\\'")}')" class="flex-1 bg-tertiary text-on-tertiary text-sm font-semibold py-2 rounded-xl hover:bg-on-tertiary-container transition">Review</button>
        </div>
        ` : app.admin_notes ? `<p class="text-xs text-on-surface-variant italic">Admin: ${app.admin_notes}</p>` : ''}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-sm text-error">Gagal memuat data</p>';
  }
}

// ── Stall Applications ─────────────────────────
async function loadStallApps() {
  const list = document.getElementById('stall-apps-list');
  showLoading(list);
  try {
    const res = await fetchApi('/admin/applications/stall');
    const apps = res.data || [];
    if (apps.length === 0) { list.innerHTML = '<p class="text-sm text-on-surface-variant text-center py-8">Tidak ada pengajuan</p>'; return; }
    list.innerHTML = apps.map(app => `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-on-surface">${app.proposed_name}</h3>
            <p class="text-xs text-on-surface-variant">UMKM: ${app.umkm_name || app.umkm_location_id}</p>
            <p class="text-xs text-on-surface-variant">WA: ${app.whatsapp_number || '-'} · ${formatDate(app.created_at)}</p>
          </div>
          ${getStatusBadge(app.status)}
        </div>
        ${app.status === 'pending' ? `
        <button onclick="openReviewModal('${app.id}', 'stall', '${app.proposed_name.replace(/'/g,"\\'")}')" class="w-full bg-tertiary text-on-tertiary text-sm font-semibold py-2 rounded-xl hover:bg-on-tertiary-container transition">Review</button>
        ` : app.admin_notes ? `<p class="text-xs text-on-surface-variant italic">Admin: ${app.admin_notes}</p>` : ''}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-sm text-error">Gagal memuat data</p>';
  }
}

// ── Review Modal ───────────────────────────────
function openReviewModal(id, type, name) {
  document.getElementById('review-id').value = id;
  document.getElementById('review-type').value = type;
  document.getElementById('review-modal-title').textContent = `Review: ${name}`;
  document.getElementById('review-notes').value = '';
  document.getElementById('review-detail').innerHTML = `<p class="font-medium">Nama: ${name}</p>`;
  document.getElementById('review-modal').classList.remove('hidden');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.add('hidden');
}

async function handleReview(status) {
  const id = document.getElementById('review-id').value;
  const type = document.getElementById('review-type').value;
  const notes = document.getElementById('review-notes').value;

  try {
    const endpoint = type === 'umkm'
      ? `/admin/applications/umkm/${id}/review`
      : `/admin/applications/stall/${id}/review`;

    await fetchApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes: notes })
    });

    showToast(`Pengajuan ${status === 'approved' ? 'disetujui' : 'ditolak'}!`, status === 'approved' ? 'success' : 'info');
    closeReviewModal();
    if (type === 'umkm') loadUmkmApps(); else loadStallApps();
  } catch (e) {
    showToast(e.message || 'Gagal memproses review', 'error');
  }
}

// ── Users ──────────────────────────────────────
async function loadUsers() {
  const container = document.getElementById('users-list');
  showLoading(container);
  try {
    const res = await fetchApi('/admin/users');
    const users = res.data || [];
    container.innerHTML = `
      <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-surface-container bg-surface-container-low">
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Username</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Nama</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Email</th>
            <th class="px-4 py-3 text-left font-semibold text-on-surface-variant">Role</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
              <tr class="border-b border-surface-container last:border-0 hover:bg-surface-container-low transition">
                <td class="px-4 py-3 font-medium text-on-surface">${u.username}</td>
                <td class="px-4 py-3 text-on-surface">${u.full_name}</td>
                <td class="px-4 py-3 text-on-surface-variant">${u.email}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${u.role === 'admin' ? 'bg-primary/10 text-primary' : u.role === 'seller' ? 'bg-tertiary/10 text-tertiary' : 'bg-secondary/10 text-secondary'}">${u.role}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-error">Gagal memuat pengguna</p>';
  }
}

// ── UMKM Management ────────────────────────────
async function loadUmkmMgmt() {
  const list = document.getElementById('umkm-mgmt-list');
  showLoading(list);
  try {
    const res = await fetchApi('/admin/umkm');
    const umkms = res.data || [];
    if (umkms.length === 0) { list.innerHTML = '<p class="text-sm text-on-surface-variant text-center py-8">Belum ada UMKM</p>'; return; }
    list.innerHTML = umkms.map(u => `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-4 flex items-center justify-between">
        <div>
          <p class="font-bold text-on-surface text-sm">${u.name}</p>
          <p class="text-xs text-on-surface-variant">${u.city_region} · ${u.status}</p>
        </div>
        <div class="flex gap-1">
          <button onclick="openEditUmkmModal('${u.id}', '${u.name.replace(/'/g,"\\'")}', '${(u.description || '').replace(/'/g,"\\'")}', '${(u.city_region || '').replace(/'/g,"\\'")}', '${(u.full_address || '').replace(/'/g,"\\'")}')" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="if(confirm('Hapus UMKM ${u.name.replace(/'/g,"\\'")}?')){deleteUmkm('${u.id}')}" class="p-2 text-error hover:bg-error-container/30 rounded-lg transition">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-sm text-error">Gagal memuat data</p>';
  }
}

async function deleteUmkm(id) {
  try { await fetchApi(`/admin/umkm/${id}`, { method: 'DELETE' }); showToast('UMKM dihapus', 'success'); loadUmkmMgmt(); } catch (e) { showToast('Gagal menghapus', 'error'); }
}

function openEditUmkmModal(id, name, desc, city, addr) {
  document.getElementById('edit-umkm-id').value = id;
  document.getElementById('edit-umkm-name').value = name;
  document.getElementById('edit-umkm-desc').value = desc;
  document.getElementById('edit-umkm-city').value = city;
  document.getElementById('edit-umkm-addr').value = addr;
  document.getElementById('edit-umkm-modal').classList.remove('hidden');
}

function closeEditUmkmModal() {
  document.getElementById('edit-umkm-modal').classList.add('hidden');
}

async function submitEditUmkm(e) {
  e.preventDefault();
  const id = document.getElementById('edit-umkm-id').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('edit-umkm-name').value);
  formData.append('description', document.getElementById('edit-umkm-desc').value);
  formData.append('city_region', document.getElementById('edit-umkm-city').value);
  formData.append('full_address', document.getElementById('edit-umkm-addr').value);
  
  const photo = document.getElementById('edit-umkm-photo').files[0];
  if (photo) formData.append('photo', photo);

  const btn = document.getElementById('edit-umkm-save-btn');
  const oldText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;

  try {
    await fetchApi(`/admin/umkm/${id}`, {
      method: 'PATCH',
      body: formData
    });
    showToast('UMKM berhasil diperbarui', 'success');
    closeEditUmkmModal();
    loadUmkmMgmt();
  } catch (error) {
    showToast(error.message || 'Gagal menyimpan', 'error');
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }
}


// ── Stall Management ───────────────────────────
async function loadStallMgmt() {
  const list = document.getElementById('stall-mgmt-list');
  showLoading(list);
  try {
    const res = await fetchApi('/admin/stalls');
    const stalls = res.data || [];
    if (stalls.length === 0) { list.innerHTML = '<p class="text-sm text-on-surface-variant text-center py-8">Belum ada warung</p>'; return; }
    list.innerHTML = stalls.map(s => `
      <div class="bg-surface rounded-2xl border border-surface-container-high p-4 flex items-center justify-between">
        <div>
          <p class="font-bold text-on-surface text-sm">${s.name}</p>
          <p class="text-xs text-on-surface-variant">Owner: ${s.owner_name || s.owner_user_id}</p>
        </div>
        <button onclick="if(confirm('Hapus warung ${s.name.replace(/'/g,"\\'")}?')){deleteStall('${s.id}')}" class="p-2 text-error hover:bg-error-container/30 rounded-lg transition">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-sm text-error">Gagal memuat data</p>';
  }
}

async function deleteStall(id) {
  try { await fetchApi(`/admin/stalls/${id}`, { method: 'DELETE' }); showToast('Warung dihapus', 'success'); loadStallMgmt(); } catch (e) { showToast('Gagal menghapus', 'error'); }
}
