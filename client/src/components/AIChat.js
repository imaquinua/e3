/**
 * AI Chat Assistant Component
 * Floating chat widget for conversational AI assistant
 */
export class AIChat {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.context = {};
    this.container = null;
  }

  setContext(context) {
    this.context = context;
  }

  render() {
    if (this.container) {
      return;
    }

    const chatHTML = `
      <div id="ai-chat-widget" class="ai-chat-widget ${this.isOpen ? 'open' : ''}">
        <!-- Chat Toggle Button with Imaquinua Logo -->
        <button id="ai-chat-toggle" class="ai-chat-toggle neomorphic-button" aria-label="Toggle AI Assistant">
          <img src="/logo.png" alt="Imaquinua AI" class="ai-logo" />
          <span class="ai-chat-badge" id="ai-chat-badge" style="display: none;"></span>
        </button>

        <!-- Chat Window -->
        <div class="ai-chat-window" id="ai-chat-window">
          <div class="ai-chat-header">
            <div class="ai-chat-header-content">
              <div class="ai-chat-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div>
                <h3>Asistente E³</h3>
                <p class="ai-chat-status">Experto en estrategia de contenido</p>
              </div>
            </div>
            <div class="ai-chat-header-actions">
              <button id="ai-chat-clear" class="ai-chat-action-btn" aria-label="Clear conversation" title="Borrar conversación">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
              <button id="ai-chat-close" class="ai-chat-close" aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="ai-chat-messages" id="ai-chat-messages">
            <div class="ai-message">
              <div class="ai-message-avatar">AI</div>
              <div class="ai-message-content">
                <p>👋 ¡Hola! Soy tu asistente educativo de estrategia E³.</p>
                <p><strong>Mi misión es ayudarte a ENTENDER tus métricas y estrategia:</strong></p>
                <ul>
                  <li><strong>📊 Explico tus KPIs</strong>: VTR, CTR, tiempo de permanencia, tasa de rebote, ROAS y más</li>
                  <li><strong>💡 Te enseño qué medir</strong>: Por qué cada métrica importa y cómo actuar en base a ella</li>
                  <li><strong>🎯 Optimizo tu estrategia</strong>: Distribución de presupuesto y canales</li>
                  <li><strong>👥 Analizo tu audiencia</strong>: Segmentación y targeting efectivo</li>
                </ul>
                <p><strong>Pregúntame cosas como:</strong></p>
                <ul>
                  <li>"¿Qué es el VTR y por qué importa?"</li>
                  <li>"¿Cómo sé si mi anuncio está bien construido?"</li>
                  <li>"¿Qué significa una tasa de rebote alta?"</li>
                  <li>"¿Cómo distribuyo mi presupuesto?"</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="ai-chat-input-container">
            <form id="ai-chat-form" class="ai-chat-form">
              <textarea
                id="ai-chat-input"
                class="ai-chat-input"
                placeholder="Escribe tu pregunta..."
                rows="1"
              ></textarea>
              <button type="submit" class="ai-chat-send" aria-label="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Append to body
    const temp = document.createElement('div');
    temp.innerHTML = chatHTML;
    this.container = temp.firstElementChild;
    document.body.appendChild(this.container);

    this.attachEventListeners();
  }

  attachEventListeners() {
    const toggle = document.getElementById('ai-chat-toggle');
    const close = document.getElementById('ai-chat-close');
    const clear = document.getElementById('ai-chat-clear');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');

    toggle.addEventListener('click', () => this.toggle());
    close.addEventListener('click', () => this.close());
    clear.addEventListener('click', () => this.confirmClearHistory());
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const widget = document.getElementById('ai-chat-widget');
    widget.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      document.getElementById('ai-chat-input').focus();
    }
  }

  open() {
    if (!this.isOpen) {
      this.toggle();
    }
  }

  close() {
    if (this.isOpen) {
      this.toggle();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Add user message to chat
    this.addMessage(message, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await window.api.ai.chat(message, this.conversationHistory, this.context);

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.response }
      );

      // Keep only last 10 messages to avoid token limits
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Remove typing indicator
      this.removeTypingIndicator();

      // Add AI response
      this.addMessage(response.response, 'ai');
    } catch (error) {
      console.error('Chat error:', error);
      this.removeTypingIndicator();
      this.addMessage(
        'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        'ai',
        true
      );
    }
  }

  addMessage(content, role = 'ai', isError = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');

    const messageHTML = role === 'user'
      ? `
        <div class="user-message">
          <div class="user-message-content">
            <p>${this.escapeHTML(content)}</p>
          </div>
          <div class="user-message-avatar">Tú</div>
        </div>
      `
      : `
        <div class="ai-message ${isError ? 'error' : ''}">
          <div class="ai-message-avatar">AI</div>
          <div class="ai-message-content">
            ${this.formatMessage(content)}
          </div>
        </div>
      `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const indicator = `
      <div class="ai-message typing-indicator" id="typing-indicator">
        <div class="ai-message-avatar">AI</div>
        <div class="ai-message-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  formatMessage(content) {
    // Convert markdown-like formatting to HTML
    let formatted = this.escapeHTML(content);

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Lists
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    formatted = formatted.split('\n\n').map(p => {
      if (!p.startsWith('<ul>') && !p.startsWith('<li>')) {
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      }
      return p;
    }).join('');

    return formatted;
  }

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  confirmClearHistory() {
    if (confirm('¿Estás seguro de que quieres borrar toda la conversación?')) {
      this.clearHistory();
      window.toast?.success('Conversación borrada');
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    const messagesContainer = document.getElementById('ai-chat-messages');
    messagesContainer.innerHTML = `
      <div class="ai-message">
        <div class="ai-message-avatar">AI</div>
        <div class="ai-message-content">
          <p>👋 ¡Hola! Soy tu asistente educativo de estrategia E³.</p>
          <p><strong>Mi misión es ayudarte a ENTENDER tus métricas y estrategia:</strong></p>
          <ul>
            <li><strong>📊 Explico tus KPIs</strong>: VTR, CTR, tiempo de permanencia, tasa de rebote, ROAS y más</li>
            <li><strong>💡 Te enseño qué medir</strong>: Por qué cada métrica importa y cómo actuar en base a ella</li>
            <li><strong>🎯 Optimizo tu estrategia</strong>: Distribución de presupuesto y canales</li>
            <li><strong>👥 Analizo tu audiencia</strong>: Segmentación y targeting efectivo</li>
          </ul>
          <p><strong>Pregúntame cosas como:</strong></p>
          <ul>
            <li>"¿Qué es el VTR y por qué importa?"</li>
            <li>"¿Cómo sé si mi anuncio está bien construido?"</li>
            <li>"¿Qué significa una tasa de rebote alta?"</li>
            <li>"¿Cómo distribuyo mi presupuesto?"</li>
          </ul>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
