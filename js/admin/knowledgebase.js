/* VetCare Pro - Knowledgebase Module */
import { db, Toast } from '../utils.js';

export function initKnowledgebase(container) {
  renderKnowledgebase(container);
}

function renderKnowledgebase(container) {
  const docs = db.getKnowledgebase();

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Knowledgebase</h2>
        <p class="section-subtitle">Upload text documents that the chatbot can consult to answer questions</p>
      </div>
      <div>
        <label class="btn btn-primary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;">
          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Upload Text Document</span>
          <input type="file" id="kb-file-input" accept=".txt,.json,.md" style="display: none;">
        </label>
      </div>
    </div>

    <div class="dashboard-card glass-panel">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Size</th>
              <th>Content Excerpt</th>
              <th style="text-align: right; width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody id="kb-table-body">
            ${docs.map((d, index) => `
              <tr>
                <td>
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <strong>${escapeHTML(d.name)}</strong>
                  </span>
                </td>
                <td>${escapeHTML(d.size)}</td>
                <td style="color: var(--text-secondary); max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHTML(d.content)}
                </td>
                <td style="text-align: right;">
                  <button class="btn-icon delete-kb-btn" data-id="${d.id}" title="Delete Document" style="border-color: var(--danger); color: var(--danger);">
                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
            ${docs.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No knowledgebase documents uploaded. Upload text/JSON files to instruct the AI chatbot.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind Upload Handler
  const fileInput = document.getElementById('kb-file-input');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const textContent = evt.target.result;
      const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
      
      const newDoc = {
        id: 'kb_' + Date.now(),
        name: file.name,
        size: sizeKB,
        content: textContent
      };

      const currentDocs = db.getKnowledgebase();
      currentDocs.push(newDoc);
      db.saveKnowledgebase(currentDocs);
      
      Toast.show('Document uploaded to Knowledgebase!', 'success');
      renderKnowledgebase(container);
    };
    reader.readAsText(file);
  });

  // Bind Delete Handler
  container.querySelectorAll('.delete-kb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to remove this document from the knowledgebase?')) {
        let currentDocs = db.getKnowledgebase();
        currentDocs = currentDocs.filter(d => d.id !== id);
        db.saveKnowledgebase(currentDocs);
        Toast.show('Document deleted from Knowledgebase', 'info');
        renderKnowledgebase(container);
      }
    });
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
