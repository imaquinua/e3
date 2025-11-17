/**
 * Tooltip Component - Sistema de ayuda contextual
 */
export class Tooltip {
  constructor() {
    this.container = null;
    this.activeTooltip = null;
    this.hideTimeout = null;
  }

  init() {
    // Create tooltip container
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'tooltip-container';
      this.container.className = 'tooltip-container';
      document.body.appendChild(this.container);
    }

    // Attach event listeners to all elements with data-tooltip
    this.attachListeners();
  }

  attachListeners() {
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        // Cancel any pending hide timeout
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          this.hideTimeout = null;
        }
        this.show(target);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        // Schedule hide after 1 second
        this.scheduleHide();
      }
    });

    // Mobile support - tap to show/hide
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target && window.innerWidth <= 768) {
        if (this.activeTooltip === target) {
          this.hide();
        } else {
          this.show(target);
        }
      }
    });
  }

  show(element) {
    const text = element.getAttribute('data-tooltip');
    const position = element.getAttribute('data-tooltip-position') || 'top';
    const type = element.getAttribute('data-tooltip-type') || 'info';

    if (!text) return;

    // Remove any existing tooltip
    this.hide();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${type} tooltip-${position}`;
    tooltip.innerHTML = `
      <div class="tooltip-arrow"></div>
      <div class="tooltip-content">${this.escapeHTML(text)}</div>
    `;

    this.container.appendChild(tooltip);
    this.activeTooltip = element;

    // Position tooltip
    this.position(tooltip, element, position);

    // Animate in
    requestAnimationFrame(() => {
      tooltip.classList.add('tooltip-visible');
    });
  }

  scheduleHide() {
    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Schedule hide after 1 second
    this.hideTimeout = setTimeout(() => {
      this.hide();
      this.hideTimeout = null;
    }, 1000);
  }

  hide() {
    // Clear any pending timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    const tooltip = this.container.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible');
      setTimeout(() => {
        tooltip.remove();
      }, 200);
    }
    this.activeTooltip = null;
  }

  position(tooltip, element, position) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 10;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 10;
        break;
    }

    // Keep tooltip in viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;

    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left}px`;
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
