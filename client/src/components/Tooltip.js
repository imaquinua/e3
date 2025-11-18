/**
 * Tooltip Component - Sistema de ayuda contextual
 */
export class Tooltip {
  constructor() {
    this.container = null;
    this.activeTooltip = null;
    this.hideTimeout = null;
    this.showTimeout = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
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
    // Track scrolling to hide tooltips
    document.addEventListener('scroll', () => {
      this.isScrolling = true;
      this.hide();

      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    }, true);

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        // Cancel any pending hide timeout
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          this.hideTimeout = null;
        }

        // Schedule show after delay (makes it less intrusive)
        this.scheduleShow(target);
      } else if (!e.target.closest('.tooltip-container')) {
        // Mouse is not over any tooltip element, hide immediately
        this.hide();
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        // Check if we're moving to the tooltip itself or another tooltip element
        const relatedTarget = e.relatedTarget;
        const movingToTooltip = relatedTarget && relatedTarget.closest('.tooltip-container');
        const movingToAnotherTooltip = relatedTarget && relatedTarget.closest('[data-tooltip]');

        // Cancel scheduled show
        if (this.showTimeout) {
          clearTimeout(this.showTimeout);
          this.showTimeout = null;
        }

        // Only schedule hide if not moving to tooltip or another tooltip element
        if (!movingToTooltip && !movingToAnotherTooltip) {
          this.scheduleHide(300);
        }
      }
    });

    // Hide tooltip when mouse leaves the tooltip container
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.tooltip-container')) {
        // Mouse entered tooltip, cancel hide
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          this.hideTimeout = null;
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.tooltip-container')) {
        const relatedTarget = e.relatedTarget;
        const movingBackToElement = relatedTarget && relatedTarget.closest('[data-tooltip]');

        if (!movingBackToElement) {
          // Mouse left tooltip and not going back to element, hide
          this.scheduleHide(100);
        }
      }
    });

    // Hide on click anywhere
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-tooltip]');

      // Mobile support - tap to show/hide
      if (target && window.innerWidth <= 768) {
        if (this.activeTooltip === target) {
          this.hide();
        } else {
          this.show(target);
        }
      } else {
        // Desktop - hide on any click
        this.hide();
      }
    });
  }

  scheduleShow(element) {
    // Don't show if scrolling
    if (this.isScrolling) return;

    // Clear any existing show timeout
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }

    // Wait 600ms before showing (gives user time to pass over)
    this.showTimeout = setTimeout(() => {
      this.show(element);
      this.showTimeout = null;
    }, 600);
  }

  show(element) {
    const text = element.getAttribute('data-tooltip');
    const position = element.getAttribute('data-tooltip-position') || 'top';
    const type = element.getAttribute('data-tooltip-type') || 'info';

    if (!text) return;
    if (this.isScrolling) return;

    // Remove any existing tooltip
    this.hide();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${type} tooltip-${position} tooltip-compact`;
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

  scheduleHide(delay = 300) {
    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Clear any pending show
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    // Schedule hide after delay
    this.hideTimeout = setTimeout(() => {
      this.hide();
      this.hideTimeout = null;
    }, delay);
  }

  hide() {
    // Clear any pending timeouts
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    const tooltip = this.container.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible');
      setTimeout(() => {
        tooltip.remove();
      }, 150);
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
