export class ThemeToggle {
  constructor(themeManager) {
    this.themeManager = themeManager;
  }

  render() {
    const currentTheme = this.themeManager.getTheme();
    const icon = currentTheme === 'dark' ? '☀️' : '🌙';
    const label = currentTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';

    return `
      <button
        id="theme-toggle"
        class="theme-toggle"
        aria-label="${label}"
        title="${label}"
      >
        <span class="theme-icon">${icon}</span>
      </button>
    `;
  }

  mount() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    button.addEventListener('click', () => {
      const newTheme = this.themeManager.toggle();
      this.updateButton(button, newTheme);
    });

    // Subscribe to theme changes
    this.themeManager.subscribe((theme) => {
      const btn = document.getElementById('theme-toggle');
      if (btn) this.updateButton(btn, theme);
    });
  }

  updateButton(button, theme) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const label = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';

    const iconEl = button.querySelector('.theme-icon');
    if (iconEl) iconEl.textContent = icon;

    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }
}
