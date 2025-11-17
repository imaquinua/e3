export class LoginView {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card card">
          <div style="text-align: center; margin-bottom: 2rem;">
            <img src="/logo_letras.png" alt="E³ Content Generator" style="height: 50px; width: auto; margin: 0 auto;">
          </div>
          <form id="loginForm">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-input" required autocomplete="email">
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-input" required autocomplete="current-password">
              <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                <button type="button" id="togglePassword" class="toggle-password-link" aria-label="Mostrar contraseña">
                  <svg id="eyeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span id="toggleText">Mostrar contraseña</span>
                </button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Iniciar Sesión</button>
          </form>

          <div style="position: relative; text-align: center; margin: 1.5rem 0;">
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--color-border);"></div>
            <span style="position: relative; background: var(--color-bg-secondary); padding: 0 1rem; color: var(--color-text-secondary); font-size: 0.875rem;">o continúa con</span>
          </div>

          <button type="button" class="btn-google" onclick="loginWithGoogle()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Iniciar sesión con Google</span>
          </button>

          <p style="text-align: center; margin-top: 1.5rem; color: var(--color-gray-400);">
            ¿No tienes cuenta? <a href="/register" data-link style="color: var(--color-primary);">Regístrate</a>
          </p>
        </div>
      </div>
    `;
  }

  async mounted() {
    // Google login function
    window.loginWithGoogle = () => {
      window.location.href = '/api/auth/google';
    };

    const form = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
      const toggleText = document.getElementById('toggleText');
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      // Update icon and text
      if (type === 'text') {
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
        toggleText.textContent = 'Ocultar contraseña';
      } else {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
        toggleText.textContent = 'Mostrar contraseña';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = passwordInput.value;

      try {
        const { user, token } = await window.api.auth.login({ email, password });
        localStorage.setItem('e3_token', token);
        window.store.set('user', user);
        window.store.set('isAuthenticated', true);

        window.toast.success('Sesión iniciada correctamente');
        window.location.href = '/dashboard';
      } catch (error) {
        window.toast.error(error.message || 'Error al iniciar sesión');
      }
    });
  }
}
