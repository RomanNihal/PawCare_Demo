/* VetCare Pro - Conversations Module */
import { db, Toast } from '../utils.js';
import { checkConversationsBadge } from './dashboard.js';

let activeConvId = null;

export function initConversations(container) {
  const conversations = db.getConversations();
  
  // Set default active conversation if none selected
  if (!activeConvId && conversations.length > 0) {
    activeConvId = conversations[0].id;
  }
  
  renderConversationsLayout(container);
}

function renderConversationsLayout(container) {
  const conversations = db.getConversations();
  const currentConv = conversations.find(c => c.id === activeConvId);

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Chatbot Conversations</h2>
        <p class="section-subtitle">Monitor AI chat interactions and take over conversations marked for human escalation</p>
      </div>
    </div>

    <div class="conversations-container glass-panel">
      <!-- Left List -->
      <div class="conv-list">
        <div class="conv-list-header">All Chats (${conversations.length})</div>
        <div id="conv-items-wrapper" style="flex-grow: 1; overflow-y: auto;">
          ${conversations.map(c => {
            const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : '';
            return `
              <div class="conv-item ${c.id === activeConvId ? 'active' : ''}" data-id="${c.id}">
                <div class="conv-meta">
                  <span class="conv-name">${escapeHTML(c.petOwner)}</span>
                  <span class="conv-excerpt">${escapeHTML(lastMsg)}</span>
                </div>
                ${c.flagged ? '<span class="red-dot" title="Human Intervention Required"></span>' : ''}
              </div>
            `;
          }).join('')}
          ${conversations.length === 0 ? '<div style="padding: 2rem; text-align: center; color: var(--text-tertiary);">No chats logged.</div>' : ''}
        </div>
      </div>

      <!-- Right Chat Stream -->
      <div class="conv-chat-area">
        ${currentConv ? `
          <div class="conv-chat-header">
            <div>
              <strong style="font-size: 1.05rem;">${escapeHTML(currentConv.petOwner)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
                Last Active: ${new Date(currentConv.lastActive).toLocaleString()}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              ${currentConv.flagged ? `
                <span class="badge badge-danger">Escalated to Human</span>
                <button id="resolve-btn" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Mark Resolved</button>
              ` : `
                <span class="badge badge-success">AI Managed</span>
              `}
              <button id="delete-chat-btn" class="btn btn-secondary btn-icon" title="Delete Conversation" style="width: 2rem; height: 2rem; border-color: var(--danger); color: var(--danger);">
                <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <div class="conv-messages" id="chat-messages-container">
            ${currentConv.messages.map(m => {
              let bubbleClass = 'user';
              let senderName = currentConv.petOwner;
              if (m.sender === 'bot') {
                bubbleClass = 'bot';
                senderName = 'Vet AI';
              } else if (m.sender === 'human') {
                bubbleClass = 'human';
                senderName = 'Dr. Roman Nihal (Doctor)';
              }
              return `
                <div style="display: flex; flex-direction: column; width: 100%;">
                  <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-bottom: 0.2rem; align-self: ${bubbleClass === 'user' ? 'flex-start' : 'flex-end'}">
                    ${senderName}
                  </span>
                  <div class="chat-bubble ${bubbleClass}">
                    ${escapeHTML(m.text)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="conv-input-area">
            <input type="text" id="doctor-reply-input" class="form-input" placeholder="Type a reply to the pet owner..." style="flex-grow: 1;">
            <button id="doctor-send-btn" class="btn btn-primary">Send Reply</button>
          </div>
        ` : `
          <div style="display: flex; height: 100%; align-items: center; justify-content: center; color: var(--text-tertiary); flex-direction: column; gap: 1rem;">
            <svg class="icon icon-xl" style="color: var(--text-tertiary);" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p>Select a conversation from the list to view transcript and reply</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Scroll chat messages to bottom
  const msgContainer = document.getElementById('chat-messages-container');
  if (msgContainer) {
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // Bind side list items
  container.querySelectorAll('.conv-item').forEach(item => {
    item.addEventListener('click', () => {
      activeConvId = item.getAttribute('data-id');
      renderConversationsLayout(container);
    });
  });

  // Action: Send doctor reply
  const replyInput = document.getElementById('doctor-reply-input');
  const sendBtn = document.getElementById('doctor-send-btn');
  
  if (replyInput && sendBtn) {
    const handleSend = () => {
      const text = replyInput.value.trim();
      if (!text) return;

      let list = db.getConversations();
      const idx = list.findIndex(c => c.id === activeConvId);
      if (idx !== -1) {
        list[idx].messages.push({
          sender: 'human',
          text: text
        });
        // Auto-unflag when doctor sends response
        list[idx].flagged = false;
        list[idx].lastActive = new Date().toISOString();
        db.saveConversations(list);
        
        replyInput.value = '';
        Toast.show('Reply sent to chat!', 'success');
        
        // Refresh view & badge
        renderConversationsLayout(container);
        checkConversationsBadge();
      }
    };

    sendBtn.addEventListener('click', handleSend);
    replyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Action: Mark resolved manually
  const resolveBtn = document.getElementById('resolve-btn');
  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => {
      let list = db.getConversations();
      const idx = list.findIndex(c => c.id === activeConvId);
      if (idx !== -1) {
        list[idx].flagged = false;
        db.saveConversations(list);
        Toast.show('Conversation marked as resolved', 'success');
        renderConversationsLayout(container);
        checkConversationsBadge();
      }
    });
  }

  // Action: Delete conversation
  const deleteBtn = document.getElementById('delete-chat-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this conversation history permanently?')) {
        let list = db.getConversations();
        list = list.filter(c => c.id !== activeConvId);
        db.saveConversations(list);
        activeConvId = list.length > 0 ? list[0].id : null;
        Toast.show('Conversation deleted', 'info');
        renderConversationsLayout(container);
        checkConversationsBadge();
      }
    });
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
