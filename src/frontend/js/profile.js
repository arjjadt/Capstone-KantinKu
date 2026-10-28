document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  await loadProfile();
  await loadMyApplications();

  // Hide "Daftar Warung" for sellers (already have a stall)
  const user = getUser();
  if (user && user.role === 'seller') {
    const link = document.getElementById('apply-stall-link');
    if (link) link.style.display = 'none';
  }
});

async function loadProfile() {
  try {
    const res = await fetchApi('/auth/me');
    const user = res.data;

    document.getElementById('p-username').value = user.username || '';
    document.getElementById('p-email').value = user.email || '';
    document.getElementById('p-fullname').value = user.full_name || '';
    document.getElementById('p-phone').value = user.phone_number || '';

    const nameDisplay = document.getElementById('profile-name-display');
    const roleDisplay = document.getElementById('profile-role-display');
    const avatar = document.getElementById('profile-avatar');
    const initial = document.getElementById('profile-initial');

    nameDisplay.textContent = user.full_name || user.username;
    roleDisplay.textContent = user.role === 'seller' ? 'Penjual' : user.role === 'admin' ? 'Admin' : 'Pembeli';

    if (user.avatar_url) {
      avatar.src = user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL.replace('/api','')}${user.avatar_url}`;
      avatar.classList.remove('hidden');
      initial.classList.add('hidden');
    } else {
      initial.textContent = (user.full_name || user.username || '?')[0].toUpperCase();
    }
  } catch (error) {
    showToast('Gagal memuat profil', 'error');
  }
}

async function handleUpdateProfile() {
  const btn = document.getElementById('save-profile-btn');
  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...';

  try {
    const formData = new FormData();
    formData.append('full_name', document.getElementById('p-fullname').value);
    formData.append('phone_number', document.getElementById('p-phone').value);

    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput.files[0]) {
      formData.append('avatar', avatarInput.files[0]);
    }

    await fetchApi('/auth/me', { method: 'PATCH', body: formData });

    // Update localStorage user
    const user = getUser();
    user.full_name = document.getElementById('p-fullname').value;
    user.phone_number = document.getElementById('p-phone').value;
    localStorage.setItem('kantinku_user', JSON.stringify(user));

    showToast('Profil berhasil diperbarui!', 'success');
    loadProfile();
  } catch (error) {
    showToast(error.message || 'Gagal memperbarui profil', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

function previewAvatar(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatar = document.getElementById('profile-avatar');
      const initial = document.getElementById('profile-initial');
      avatar.src = e.target.result;
      avatar.classList.remove('hidden');
      initial.classList.add('hidden');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function togglePasswordSection() {
  const section = document.getElementById('password-section');
  const icon = document.getElementById('pw-toggle-icon');
  section.classList.toggle('hidden');
  icon.textContent = section.classList.contains('hidden') ? 'expand_more' : 'expand_less';
}

async function handleChangePassword() {
  const current = document.getElementById('pw-current').value;
  const newPw = document.getElementById('pw-new').value;
  const confirm = document.getElementById('pw-confirm').value;

  if (!current || !newPw || !confirm) {
    showToast('Semua field password harus diisi', 'error');
    return;
  }
  if (newPw.length < 6) {
    showToast('Password baru minimal 6 karakter', 'error');
    return;
  }
  if (newPw !== confirm) {
    showToast('Konfirmasi password tidak cocok', 'error');
    return;
  }

  const btn = document.getElementById('change-pw-btn');
  btn.disabled = true;
  btn.textContent = 'Mengubah...';

  try {
    await fetchApi('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ old_password: current, new_password: newPw })
    });
    showToast('Password berhasil diubah!', 'success');
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value = '';
    document.getElementById('pw-confirm').value = '';
  } catch (error) {
    showToast(error.message || 'Gagal mengubah password', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ubah Password';
  }
}

async function loadMyApplications() {
  const container = document.getElementById('my-applications');
  try {
    const [umkmRes, stallRes] = await Promise.all([
      fetchApi('/applications/umkm/my'),
      fetchApi('/applications/stall/my')
    ]);

    const umkmApps = umkmRes.data || [];
    const stallApps = stallRes.data || [];

    if (umkmApps.length === 0 && stallApps.length === 0) {
      container.innerHTML = '<p class="text-xs text-on-surface-variant">Belum ada pengajuan</p>';
      return;
    }

    container.innerHTML = [
      ...umkmApps.map(app => `
        <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
          <div>
            <p class="text-sm font-medium text-on-surface">${app.proposed_name}</p>
            <p class="text-[11px] text-on-surface-variant">UMKM · ${formatDate(app.created_at)}</p>
          </div>
          ${getStatusBadge(app.status)}
        </div>
      `),
      ...stallApps.map(app => `
        <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
          <div>
            <p class="text-sm font-medium text-on-surface">${app.proposed_name}</p>
            <p class="text-[11px] text-on-surface-variant">Warung · ${formatDate(app.created_at)}</p>
          </div>
          ${getStatusBadge(app.status)}
        </div>
      `)
    ].join('');
  } catch (error) {
    container.innerHTML = '<p class="text-xs text-error">Gagal memuat pengajuan</p>';
  }
}
