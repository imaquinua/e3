export class AuthCallbackView {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card card" style="text-align: center;">
          <div style="margin-bottom: 2rem;">
            <img src="/logo_letras.png" alt="E³ Content Generator" style="height: 50px; width: auto; margin: 0 auto;">
          </div>
          <div style="padding: 2rem 0;">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            <p style="color: var(--color-text-secondary);">Completando autenticación...</p>
          </div>
        </div>
      </div>
    `;
  }

  async mounted() {
    try {
      // Get token from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        throw new Error('Error en la autenticación con Google');
      }

      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }

      // Store token
      localStorage.setItem('e3_token', token);

      // Fetch user data
      const { user } = await window.api.auth.me();
      window.store.set('user', user);
      window.store.set('isAuthenticated', true);

      // Show success message
      window.toast.success('Sesión iniciada correctamente');

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Auth callback error:', error);
      window.toast.error(error.message || 'Error al completar la autenticación');

      // Redirect to login after error
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }
}
