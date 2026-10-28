document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  if (isLoggedIn()) {
    const user = getUser();
    if (user.role === 'seller') {
      window.location.href = 'seller/dashboard.html';
    } else if (user.role === 'admin') {
      window.location.href = 'admin/dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
    return;
  }

  const form = document.querySelector('form');
  if (!form) return;

  // Determine page type by checking for email input (register has it, login doesn't)
  const isRegister = !!document.getElementById('email');

  // Wire up register link on login page
  const registerLink = document.querySelector('a[href="#"]');
  if (registerLink && !isRegister) {
    registerLink.href = 'register.html';
  }

  // Wire up login link on register page
  const loginLink = document.querySelector('a[href="#"]');
  if (loginLink && isRegister) {
    loginLink.href = 'login.html';
  }

  // Password visibility toggle
  document.querySelectorAll('button[type="button"]').forEach(btn => {
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
      showToast('Semua field wajib harus diisi.', 'error');
      return;
    }

    if (username.includes(' ')) {
      showToast('Username tidak boleh mengandung spasi.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Password dan konfirmasi tidak cocok!', 'error');
      return;
    }

    const body = { username, full_name: fullName, email, password };
    if (phone) body.phone_number = phone;

    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    showToast('Registrasi berhasil! Silakan login.', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (error) {
    showToast(error.message || 'Registrasi gagal.', 'error');
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
      showToast('Username dan password harus diisi.', 'error');
      return;
    }

    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // Save auth data
    saveAuth(data.data.token, data.data.user);
    showToast('Login berhasil!', 'success');

    // Redirect based on role
    setTimeout(() => {
      if (data.data.user.role === 'seller') {
        window.location.href = 'seller/dashboard.html';
      } else if (data.data.user.role === 'admin') {
        window.location.href = 'admin/dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 800);
  } catch (error) {
    showToast('Login gagal: ' + (error.message || 'Username atau password salah.'), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}
