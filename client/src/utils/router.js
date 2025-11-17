export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentView = null;
  }

  start() {
    // Listen for route changes
    window.addEventListener('popstate', () => this.route());
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('href'));
      }
    });

    // Initial route
    this.route();
  }

  navigate(path) {
    window.history.pushState(null, null, path);
    this.route();
  }

  async route() {
    const path = window.location.pathname;
    const { view, params } = this.matchRoute(path);

    // Check if route requires auth
    const publicRoutes = ['/', '/login', '/register', '/auth/callback'];
    const isAuthenticated = window.store?.get('isAuthenticated');

    if (!publicRoutes.includes(path) && !isAuthenticated) {
      window.history.replaceState(null, null, '/login');
      await this.loadView(this.routes['/login']);
      return;
    }

    if (publicRoutes.includes(path) && isAuthenticated) {
      window.history.replaceState(null, null, '/dashboard');
      await this.loadView(this.routes['/dashboard']);
      return;
    }

    if (view) {
      await this.loadView(view, params);
    } else {
      await this.loadView(this.routes['/']);
    }
  }

  matchRoute(path) {
    // Exact match
    if (this.routes[path]) {
      return { view: this.routes[path], params: {} };
    }

    // Pattern match with params
    for (const [pattern, view] of Object.entries(this.routes)) {
      const paramNames = [];
      const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });

      const regex = new RegExp(`^${regexPattern}$`);
      const match = path.match(regex);

      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { view, params };
      }
    }

    return { view: null, params: {} };
  }

  async loadView(ViewClass, params = {}) {
    const app = document.getElementById('app');

    // Cleanup previous view
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    // Create and render new view
    this.currentView = new ViewClass(params);
    const html = await this.currentView.render();

    app.innerHTML = html;

    // Call mounted lifecycle hook
    if (typeof this.currentView.mounted === 'function') {
      await this.currentView.mounted();
    }
  }
}
