/* VetCare Pro - Settings Module */
import { db, Toast } from '../utils.js';

export function initSettings(container) {
  const settings = db.getSettings();

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Chatbot Settings</h2>
        <p class="section-subtitle">Manage OpenAI integration, models, and system guidelines</p>
      </div>
    </div>

    <div class="dashboard-card glass-panel" style="max-width: 650px;">
      <form id="settings-form">
        <div class="form-group">
          <label class="form-label" for="setting-apikey">OpenAI API Key</label>
          <input type="password" id="setting-apikey" class="form-input" placeholder="sk-proj-..." value="${escapeHTML(settings.apiKey || '')}">
          <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">
            Your key is stored locally in your browser storage and is sent directly to OpenAI.
          </p>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-model">Completions Model</label>
          <select id="setting-model" class="form-select">
            <option value="gpt-4o-mini" ${settings.model === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini (Recommended - Fast & Cost-Effective)</option>
            <option value="gpt-4o" ${settings.model === 'gpt-4o' ? 'selected' : ''}>gpt-4o (High intelligence & capability)</option>
            <option value="gpt-4" ${settings.model === 'gpt-4' ? 'selected' : ''}>gpt-4 (Legacy smart model)</option>
            <option value="gpt-3.5-turbo" ${settings.model === 'gpt-3.5-turbo' ? 'selected' : ''}>gpt-3.5-turbo (Basic speed model)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-instructions">General Chatbot Instructions</label>
          <textarea id="setting-instructions" class="form-textarea" style="height: 200px;" placeholder="Define the AI persona, clinic parameters, booking limits, and formatting rules...">${escapeHTML(settings.instructions || '')}</textarea>
        </div>

        <button class="btn btn-primary" type="submit" style="margin-top: 0.5rem; width: 150px;">Save Settings</button>
      </form>
    </div>
  `;

  document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      apiKey: document.getElementById('setting-apikey').value.trim(),
      model: document.getElementById('setting-model').value,
      instructions: document.getElementById('setting-instructions').value.trim()
    };
    db.saveSettings(updated);
    Toast.show('Settings saved successfully', 'success');
  });
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
