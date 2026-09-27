(function () {
  console.log('[Allo Widget] Script loaded');

  const initWidget = () => {
    const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
    
    if (!scriptTag) {
      console.error('[Allo Widget] Script tag not found');
      return;
    }

    const scriptSrc = scriptTag.getAttribute('src') || '';
    let detectedApiHost = 'https://allo-backend-production-0fb3.up.railway.app/api';
    
    if (scriptSrc && scriptSrc.startsWith('http')) {
      try {
        const urlObj = new URL(scriptSrc);
        if (urlObj.port === '5173' || urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          detectedApiHost = 'http://localhost:8000/api';
        } else {
          detectedApiHost = `${urlObj.origin}/api`;
        }
      } catch (e) {}
    }

    const API_HOST = scriptTag.getAttribute('data-api-host') || detectedApiHost;
    const API_ROOT = API_HOST.replace(/\/api\/?$/, '');
    const WS_HOST = API_ROOT.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    
    const companyId = scriptTag.getAttribute('data-company-id') || 'demo';

    console.log('[Allo Widget] Target API:', API_HOST);
    console.log('[Allo Widget] Target WS:', WS_HOST);

    let config = {
      name: scriptTag.getAttribute('data-name') || 'Allo Support',
      color: scriptTag.getAttribute('data-color') || '#ffffff',
      position: scriptTag.getAttribute('data-position') || 'right',
      launcherStyle: scriptTag.getAttribute('data-launcher') || 'icon',
      logoUrl: scriptTag.getAttribute('data-logo') || '',
      welcomeMessage: 'Hi! How can we help you today?',
    };

    let conversationId = localStorage.getItem(`allo_conv_${companyId}`) || null;
    let chatSocket = null;
    let visitorId = localStorage.getItem('allo_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('allo_visitor_id', visitorId);
    }

    if (document.getElementById('allo-widget-host')) return;

    function parseMarkdown(text) {
      if (!text) return '';
      let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="chat-inline-img" />');
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      html = html.replace(/\n/g, '<br/>');
      return html;
    }

    const host = document.createElement('div');
    host.id = 'allo-widget-host';
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    function connectWebSocket(id) {
      if (chatSocket || !id) return;
      
      const wsUrl = `${WS_HOST}/ws/chat/conversation/${id}/`;
      console.log('[Allo Widget] Connecting WebSocket:', wsUrl);

      try {
        chatSocket = new WebSocket(wsUrl);

        chatSocket.onopen = () => {
          console.log('[Allo Widget] ✅ Live WebSocket connected');
        };

        chatSocket.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'chat_message') {
              const msg = data.message;
              if (msg.sender_role !== 'user') {
                addMessage(msg.content, msg.sender_role);
              }
            }
          } catch (err) {
            console.error('[Allo Widget] Parse error:', err);
          }
        };

        chatSocket.onclose = () => {
          chatSocket = null;
          setTimeout(() => connectWebSocket(id), 3000);
        };

        chatSocket.onerror = (err) => {
          console.error('[Allo Widget] WS error:', err);
        };
      } catch (e) {
        chatSocket = null;
      }
    }

    function addMessage(text, sender) {
      const messagesContainer = shadow.querySelector('#messages');
      if (!messagesContainer) return;

      const typing = shadow.querySelector('#typing-indicator');
      if (typing) typing.remove();

      const msg = document.createElement('div');
      msg.className = `msg msg-${sender}`;

      let headerPrefix = '';
      if (sender === 'agent') {
        headerPrefix = '<span class="agent-tag">Live Agent</span>';
      }

      msg.innerHTML = `${headerPrefix}${parseMarkdown(text)}`;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function renderUI() {
      const isLight = (config.color.toLowerCase() === '#ffffff' || config.color.toLowerCase() === '#fff');
      const contrastColor = isLight ? '#000000' : '#ffffff';

      const style = document.createElement('style');
      style.textContent = `
        #allo-root {
          position: fixed !important;
          bottom: 20px !important;
          ${config.position === 'left' ? 'left: 20px !important;' : 'right: 20px !important;'}
          z-index: 2147483647 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          line-height: 1.5 !important;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .launcher {
          width: 60px;
          height: 60px;
          background: ${config.color};
          color: ${contrastColor};
          border: none;
          border-radius: ${config.launcherStyle === 'logo-square' ? '12px' : '50%'};
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          overflow: hidden;
        }
        .launcher:hover { transform: scale(1.08); }
        .launcher svg { width: 28px; height: 28px; fill: currentColor; }
        .launcher img { width: 100%; height: 100%; object-fit: cover; }
        .window {
          position: absolute;
          bottom: 75px;
          ${config.position === 'left' ? 'left: 0;' : 'right: 0;'}
          width: 360px;
          height: 520px;
          background: #0a0a0a;
          border: 1px solid #27272a;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
          opacity: 0;
          pointer-events: none;
          transform: translateY(12px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          overflow: hidden;
        }
        .window.open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .header {
          background: ${config.color};
          color: ${contrastColor};
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 15px;
        }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header-logo { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
        .close-btn { background: transparent; border: none; color: inherit; cursor: pointer; display: flex; }
        .messages {
          flex: 1;
          background: #000000;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .msg {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }
        .msg-ai {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.08);
          color: #e4e4e7;
          border: 1px solid #27272a;
          border-bottom-left-radius: 2px;
        }
        .msg-agent {
          align-self: flex-start;
          background: #18181b;
          color: #ffffff;
          border: 1px solid #3b82f6;
          border-bottom-left-radius: 2px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .agent-tag {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #60a5fa;
          margin-bottom: 4px;
        }
        .msg-user {
          align-self: flex-end;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-bottom-right-radius: 2px;
        }
        .msg a { color: #38bdf8; text-decoration: underline; }
        .chat-inline-img {
          max-width: 100%;
          max-height: 180px;
          border-radius: 6px;
          margin-top: 8px;
          display: block;
          border: 1px solid #27272a;
        }
        .typing {
          font-size: 12px;
          color: #a1a1aa;
          font-style: italic;
        }
        .input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: #0a0a0a;
          border-top: 1px solid #27272a;
        }
        .input-area input {
          flex: 1;
          background: #000000;
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 10px 12px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
        }
        .input-area button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 6px;
          background: ${config.color};
          color: ${contrastColor};
          cursor: pointer;
          font-weight: bold;
        }
      `;

      const root = document.createElement('div');
      root.id = 'allo-root';

      let launcherContent = config.launcherStyle === 'icon' || !config.logoUrl
        ? `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
        : `<img src="${config.logoUrl}" alt="Logo" />`;

      root.innerHTML = `
        <div class="window" id="chat-window">
          <div class="header">
            <div class="header-left">
              ${config.logoUrl ? `<img src="${config.logoUrl}" class="header-logo" />` : ''}
              <span>${config.name}</span>
            </div>
            <button class="close-btn" id="close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="messages" id="messages">
            <div class="msg msg-ai">${parseMarkdown(config.welcomeMessage)}</div>
          </div>
          <form class="input-area" id="chat-form">
            <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off" />
            <button type="submit" id="send-btn">→</button>
          </form>
        </div>
        <button class="launcher" id="launcher-btn">${launcherContent}</button>
      `;

      shadow.innerHTML = '';
      shadow.appendChild(style);
      shadow.appendChild(root);

      const launcherBtn = shadow.querySelector('#launcher-btn');
      const closeBtn = shadow.querySelector('#close-btn');
      const chatWindow = shadow.querySelector('#chat-window');
      const chatForm = shadow.querySelector('#chat-form');
      const chatInput = shadow.querySelector('#chat-input');
      const messagesContainer = shadow.querySelector('#messages');
      const sendBtn = shadow.querySelector('#send-btn');

      let isOpen = false;

      const toggleChat = () => {
        isOpen = !isOpen;
        if (isOpen) {
          chatWindow.classList.add('open');
          chatInput.focus();
          if (conversationId) connectWebSocket(conversationId);
        } else {
          chatWindow.classList.remove('open');
        }
      };

      launcherBtn.addEventListener('click', toggleChat);
      closeBtn.addEventListener('click', toggleChat);

      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        const typingDiv = document.createElement('div');
        typingDiv.className = 'msg msg-ai typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.textContent = 'Allo is typing…';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        chatInput.disabled = true;
        sendBtn.disabled = true;

        try {
          const response = await fetch(`${API_HOST}/chat/widget/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: companyId,
              visitor_id: visitorId,
              message: text,
              conversation_id: conversationId,
            }),
          });

          const data = await response.json();
          
          const indicator = shadow.querySelector('#typing-indicator');
          if (indicator) indicator.remove();

          if (response.ok) {
            conversationId = data.conversation_id;
            localStorage.setItem(`allo_conv_${companyId}`, conversationId);
            
            connectWebSocket(conversationId);

            const aiMsg = data.messages && data.messages.find(m => m.sender_role === 'ai');
            if (aiMsg) {
              addMessage(aiMsg.content, 'ai');
            }
          } else {
            addMessage('Sorry, something went wrong.', 'ai');
          }
        } catch (err) {
          const indicator = shadow.querySelector('#typing-indicator');
          if (indicator) indicator.remove();
          addMessage('Unable to connect to support.', 'ai');
        } finally {
          chatInput.disabled = false;
          sendBtn.disabled = false;
          chatInput.focus();
        }
      });
    }

    renderUI();

    if (conversationId) {
      connectWebSocket(conversationId);
    }

    if (companyId && companyId.length > 20) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      fetch(`${API_HOST}/chat/widget-config/${companyId}/`, { signal: controller.signal })
        .then((res) => {
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Config 404');
          return res.json();
        })
        .then((data) => {
          if (data.color) config.color = data.color;
          if (data.name) config.name = data.name;
          if (data.position) config.position = data.position;
          if (data.launcher) config.launcherStyle = data.launcher;
          if (data.logo_url) config.logoUrl = data.logo_url;
          if (data.welcome_message) config.welcomeMessage = data.welcome_message;
          renderUI();
        })
        .catch(() => {
          clearTimeout(timeoutId);
        });
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initWidget());
  } else {
    setTimeout(() => initWidget(), 0);
  }
})();