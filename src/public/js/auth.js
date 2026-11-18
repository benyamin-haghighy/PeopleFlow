(function () {
  const $ = (selector) => document.querySelector(selector);
  const messageBox = $('#auth-message');
  const showMessage = (message, type = 'error') => {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = `notice ${type}`;
  };
  const setBusy = (form, busy) => {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.dataset.originalText ||= button.textContent.trim();
    button.textContent = busy ? 'در حال انجام…' : button.dataset.originalText;
    button.style.opacity = busy ? '.7' : '1';
  };
  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      button.textContent = input.type === 'password' ? 'نمایش' : 'مخفی';
    });
  });
  const loginForm = $('#login-form');
  if (loginForm) loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageBox.className = 'notice hidden';
    const form = new FormData(loginForm);
    const payload = { phone: String(form.get('phone') || '').trim(), password: String(form.get('password') || '') };
    if (!/^09\d{9}$/.test(payload.phone)) return showMessage('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
    setBusy(loginForm, true);
    try {
      const result = await HRApi.post('/auth/login', payload);
      if (!result || !result.accessToken || !result.user) throw new Error('پاسخ ورود از سرور کامل نیست.');
      HRApi.setAuthenticated(result.user, result.accessToken);
      location.replace(result.user.role === 'MANAGER' ? '/manager' : '/employee');
    } catch (error) { showMessage(error.message); }
    finally { setBusy(loginForm, false); }
  });
  const registerForm = $('#register-form');
  if (registerForm) registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageBox.className = 'notice hidden';
    const form = new FormData(registerForm);
    const payload = {
      name: String(form.get('name') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      password: String(form.get('password') || ''),
      groupId: Number(form.get('groupId')),
    };
    if (!/^09\d{9}$/.test(payload.phone)) return showMessage('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
    if (!Number.isInteger(payload.groupId) || payload.groupId < 1) return showMessage('شناسه گروه شغلی معتبر نیست.');
    setBusy(registerForm, true);
    try {
      await HRApi.post('/auth/register', payload);
      showMessage('ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد سامانه شوید.', 'success');
      registerForm.reset();
      setTimeout(() => location.assign('/login'), 1400);
    } catch (error) { showMessage(error.message); }
    finally { setBusy(registerForm, false); }
  });
})();
