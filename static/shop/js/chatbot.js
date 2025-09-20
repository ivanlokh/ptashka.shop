// Chatbot JavaScript for Ptashka.shop

class Chatbot {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.isOpen = false;
        this.isTyping = false;
        this.messageCount = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadChatHistory();
    }
    
    initializeElements() {
        this.container = document.getElementById('chatbot-container');
        this.toggle = document.getElementById('chatbot-toggle');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
        this.typingIndicator = document.getElementById('chatbot-typing');
        this.badge = document.getElementById('chatbot-badge');
        this.quickActions = document.getElementById('quick-actions');
    }
    
    bindEvents() {
        // Toggle chatbot
        this.toggle.addEventListener('click', () => this.toggleChat());
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick actions
        this.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
        });
        
        // Minimize/close buttons
        document.getElementById('minimize-chat').addEventListener('click', () => this.minimizeChat());
        document.getElementById('close-chat').addEventListener('click', () => this.closeChat());
        
        // Auto-resize input
        this.input.addEventListener('input', () => this.autoResizeInput());
    }
    
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.container.style.display = 'flex';
        this.container.classList.add('show');
        this.toggle.classList.add('active');
        this.isOpen = true;
        this.hideBadge();
        this.scrollToBottom();
        this.input.focus();
    }
    
    closeChat() {
        this.container.classList.remove('show');
        this.toggle.classList.remove('active');
        this.isOpen = false;
    }
    
    minimizeChat() {
        this.closeChat();
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message to chat
        this.addMessage('user', message);
        this.input.value = '';
        this.autoResizeInput();
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await fetch('/chatbot/api/send/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Hide typing indicator
                this.hideTyping();
                
                // Add bot response
                this.addMessage('bot', data.bot_response);
                
                // Update quick actions with suggestions
                if (data.suggestions && data.suggestions.length > 0) {
                    this.updateQuickActions(data.suggestions);
                }
                
                // Update session ID if provided
                if (data.session_id) {
                    this.sessionId = data.session_id;
                    localStorage.setItem('chatbot_session_id', this.sessionId);
                }
            } else {
                this.hideTyping();
                this.addMessage('bot', 'Вибачте, виникла помилка. Спробуйте ще раз.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.addMessage('bot', 'Вибачте, виникла помилка з\'єднання. Перевірте інтернет-з\'єднання.');
        }
    }
    
    addMessage(type, content, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const time = timestamp ? new Date(timestamp).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Зараз';
        
        const avatar = type === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessage(content)}
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        // Remove welcome message if exists
        const welcome = this.messagesContainer.querySelector('.chatbot-welcome');
        if (welcome) {
            welcome.remove();
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Show badge if chat is closed
        if (!this.isOpen && type === 'bot') {
            this.showBadge();
        }
    }
    
    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;');
    }
    
    showTyping() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }
    
    updateQuickActions(suggestions) {
        this.quickActions.innerHTML = '';
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'quick-action-btn';
            button.textContent = suggestion;
            button.addEventListener('click', () => {
                this.input.value = suggestion;
                this.sendMessage();
            });
            this.quickActions.appendChild(button);
        });
    }
    
    handleQuickAction(action) {
        const actions = {
            'categories': 'Покажіть категорії товарів',
            'delivery': 'Розкажіть про доставку',
            'payment': 'Як можна оплатити замовлення?',
            'help': 'Допоможіть мені'
        };
        
        const message = actions[action] || action;
        this.input.value = message;
        this.sendMessage();
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch(`/chatbot/api/messages/?session_id=${this.sessionId}`);
            const data = await response.json();
            
            if (data.success && data.messages.length > 0) {
                // Clear welcome message
                const welcome = this.messagesContainer.querySelector('.chatbot-welcome');
                if (welcome) {
                    welcome.remove();
                }
                
                // Add messages
                data.messages.forEach(msg => {
                    this.addMessage(msg.type, msg.content, msg.timestamp);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    autoResizeInput() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    }
    
    showBadge() {
        this.messageCount++;
        this.badge.textContent = this.messageCount;
        this.badge.style.display = 'block';
    }
    
    hideBadge() {
        this.messageCount = 0;
        this.badge.style.display = 'none';
    }
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new Chatbot();
});
