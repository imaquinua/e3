export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('e3_theme') || 'dark';
    this.listeners = [];
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('e3_theme', theme);
    this.currentTheme = theme;
    this.notifyListeners(theme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }

  getTheme() {
    return this.currentTheme;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(theme) {
    this.listeners.forEach(callback => callback(theme));
  }
}
