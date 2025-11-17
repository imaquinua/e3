/**
 * Onboarding Component - Guía inicial para nuevos usuarios
 */
export class Onboarding {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        target: '.nav-brand',
        title: '¡Bienvenido a E³ Content Generator!',
        content: 'Esta plataforma te ayuda a crear ecosistemas de contenido estratégico basados en el modelo See-Think-Do-Care. Coloca el cursor sobre cualquier elemento para ver tooltips educativos. Powered by Google Gemini IA.',
        position: 'bottom',
      },
      {
        target: '#ai-chat-toggle',
        title: 'Asistente IA Educativo',
        content: 'Haz clic aquí para hablar con tu asistente personal. Te explicará métricas como VTR, CTR, tasa de rebote, tiempo de permanencia, y cualquier duda sobre estrategia de marketing digital.',
        position: 'left',
      },
      {
        target: '[data-onboarding="projects"]',
        title: 'Tus Proyectos',
        content: 'Crea proyectos para organizar tus diferentes campañas y estrategias de contenido.',
        position: 'bottom',
      },
      {
        target: '[data-onboarding="generator"]',
        title: 'Generador de Ecosistemas',
        content: 'Aquí crearás ecosistemas completos con IA de Google Gemini. La plataforma te generará una estrategia personalizada con KPIs educativos, distribución de presupuesto optimizada y piezas de contenido específicas para cada etapa.',
        position: 'bottom',
      },
    ];
  }

  shouldShow() {
    // Check if user has seen onboarding
    return !localStorage.getItem('e3_onboarding_completed');
  }

  start() {
    if (!this.shouldShow()) return;

    this.currentStep = 0;
    this.showStep();
  }

  showStep() {
    if (this.currentStep >= this.steps.length) {
      this.complete();
      return;
    }

    const step = this.steps[this.currentStep];

    // Wait for target element to be available
    const checkElement = setInterval(() => {
      const target = document.querySelector(step.target);
      if (target) {
        clearInterval(checkElement);
        this.renderStep(target, step);
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkElement), 5000);
  }

  renderStep(targetElement, step) {
    // Remove any existing onboarding overlay
    this.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay';

    // Create spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'onboarding-spotlight';
    this.positionSpotlight(spotlight, targetElement);

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = `onboarding-tooltip onboarding-tooltip-${step.position}`;
    tooltip.innerHTML = `
      <div class="onboarding-tooltip-content">
        <div class="onboarding-step-indicator">
          Paso ${this.currentStep + 1} de ${this.steps.length}
        </div>
        <h3 class="onboarding-title">${step.title}</h3>
        <p class="onboarding-content">${step.content}</p>
        <div class="onboarding-actions">
          ${this.currentStep > 0 ? '<button class="btn btn-secondary" onclick="window.onboarding.prev()">Anterior</button>' : ''}
          ${this.currentStep < this.steps.length - 1
            ? '<button class="btn btn-primary" onclick="window.onboarding.next()">Siguiente</button>'
            : '<button class="btn btn-primary" onclick="window.onboarding.complete()">¡Entendido!</button>'
          }
          <button class="btn btn-text" onclick="window.onboarding.skip()">Saltar tutorial</button>
        </div>
      </div>
    `;

    this.positionTooltip(tooltip, targetElement, step.position);

    overlay.appendChild(spotlight);
    overlay.appendChild(tooltip);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('onboarding-visible');
    });

    // Scroll to target if needed
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  positionSpotlight(spotlight, target) {
    const rect = target.getBoundingClientRect();
    const padding = 10;

    spotlight.style.top = `${rect.top + window.scrollY - padding}px`;
    spotlight.style.left = `${rect.left - padding}px`;
    spotlight.style.width = `${rect.width + padding * 2}px`;
    spotlight.style.height = `${rect.height + padding * 2}px`;
  }

  positionTooltip(tooltip, target, position) {
    const rect = target.getBoundingClientRect();

    setTimeout(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 20;
      let top, left;

      switch (position) {
        case 'top':
          top = rect.top + window.scrollY - tooltipRect.height - 20;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + 20;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left - tooltipRect.width - 20;
          // If tooltip goes off left edge, position it to the right instead
          if (left < padding) {
            left = rect.right + 20;
          }
          break;
        case 'right':
          top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + 20;
          // If tooltip goes off right edge, position it to the left instead
          if (left + tooltipRect.width > viewportWidth - padding) {
            left = rect.left - tooltipRect.width - 20;
          }
          break;
      }

      // Ensure tooltip doesn't go off left edge
      if (left < padding) {
        left = padding;
      }

      // Ensure tooltip doesn't go off right edge
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }

      // Ensure tooltip doesn't go off top edge
      if (top < window.scrollY + padding) {
        top = window.scrollY + padding;
      }

      // Ensure tooltip doesn't go off bottom edge
      if (top + tooltipRect.height > window.scrollY + viewportHeight - padding) {
        top = window.scrollY + viewportHeight - tooltipRect.height - padding;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }, 10);
  }

  next() {
    this.currentStep++;
    this.showStep();
  }

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  }

  skip() {
    this.complete();
  }

  complete() {
    localStorage.setItem('e3_onboarding_completed', 'true');
    this.remove();
  }

  remove() {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.classList.remove('onboarding-visible');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  reset() {
    localStorage.removeItem('e3_onboarding_completed');
  }
}
