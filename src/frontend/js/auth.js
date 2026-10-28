document.addEventListener('DOMContentLoaded', () => {
  // Determine page type by checking for email input (register has it, login doesn't)
  const isRegister = !!document.getElementById('email');

  // Auto-fill username if redirected from registration
  if (!isRegister) {
    const urlParams = new URLSearchParams(window.location.search);
    const registeredUser = urlParams.get('registered') || urlParams.get('username');
    if (registeredUser) {
      const userInput = document.getElementById('username');
      if (userInput) {
        userInput.value = registeredUser;
        const passInput = document.getElementById('password');
        if (passInput) passInput.focus();
      }
      if (typeof showToast === 'function') {
        showToast('Akun berhasil dibuat! Silakan masukkan password untuk login.', 'success');
      }
    }
  }

  const form = document.querySelector('form');
  if (!form) return;

  // Password visibility toggle (only target password toggle buttons inside field wrapper)
  document.querySelectorAll('.relative button[type="button"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span>${isRegister ? 'Mendaftar...' : 'Masuk...'}</span>
    `;

    if (isRegister) {
      await handleRegister(form, submitBtn, originalBtnText);
    } else {
      await handleLogin(form, submitBtn, originalBtnText);
    }
  });
});

async function handleRegister(form, submitBtn, originalBtnText) {
  try {
    const username = document.getElementById('username')?.value?.trim();
    const fullName = document.getElementById('full_name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm_password')?.value;

    // Validations
    if (!username || !fullName || !email || !password || !confirmPassword) {
      if (typeof showToast === 'function') showToast('Semua field wajib harus diisi.', 'error');
      else alert('Semua field wajib harus diisi.');
      return;
    }

    if (username.includes(' ')) {
      if (typeof showToast === 'function') showToast('Username tidak boleh mengandung spasi.', 'error');
      else alert('Username tidak boleh mengandung spasi.');
      return;
    }

    if (password.length < 6) {
      if (typeof showToast === 'function') showToast('Password minimal 6 karakter.', 'error');
      else alert('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      if (typeof showToast === 'function') showToast('Password dan konfirmasi password tidak cocok!', 'error');
      else alert('Password dan konfirmasi password tidak cocok!');
      return;
    }

    const body = { username, full_name: fullName, email, password };
    if (phone) body.phone_number = phone;

    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    // Clear any previous session so the user can test their new account
    localStorage.removeItem('kantinku_token');
    localStorage.removeItem('kantinku_user');

    if (typeof showToast === 'function') {
      showToast('Registrasi berhasil! Silakan masuk dengan akun baru Anda...', 'success');
    }

    setTimeout(() => {
      window.location.href = `login.html?registered=${encodeURIComponent(username)}`;
    }, 1200);
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast(error.message || 'Registrasi gagal. Silakan coba lagi.', 'error');
    } else {
      alert(error.message || 'Registrasi gagal.');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

async function handleLogin(form, submitBtn, originalBtnText) {
  try {
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
      if (typeof showToast === 'function') showToast('Username dan password harus diisi.', 'error');
      else alert('Username dan password harus diisi.');
      return;
    }

    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // Save auth data
    saveAuth(data.data.token, data.data.user);
    if (typeof showToast === 'function') showToast('Login berhasil!', 'success');

    // Redirect based on role
    setTimeout(() => {
      if (data.data.user.role === 'seller') {
        window.location.href = 'seller/dashboard.html';
      } else if (data.data.user.role === 'admin') {
        window.location.href = 'admin/dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 600);
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast('Login gagal: ' + (error.message || 'Username atau password salah.'), 'error');
    } else {
      alert('Login gagal: ' + (error.message || 'Username atau password salah.'));
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}
