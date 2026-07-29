/* VetCare Pro - Patient Management Module */
import { db, Toast } from '../utils.js';
import { Modal } from './dashboard.js';

let activePatientId = null;

export function initPatients(container) {
  renderPatientsList(container);
}

function renderPatientsList(container) {
  const patients = db.getPatients();
  
  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Patient Management</h2>
        <p class="section-subtitle">Track, update and review patient visit records & prescriptions</p>
      </div>
      <button id="add-patient-btn" class="btn btn-primary">
        <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add New Patient</span>
      </button>
    </div>

    <div class="dashboard-card glass-panel" style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
      <input type="text" id="patient-search" class="form-input" placeholder="Search patients by pet name, owner, or breed..." style="flex-grow: 1;">
    </div>

    <div class="dashboard-card glass-panel">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pet Name</th>
              <th>Species / Breed</th>
              <th>Age</th>
              <th>Owner Name</th>
              <th>Owner Contact</th>
              <th>Visits Count</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="patients-table-body">
            ${patients.map(p => `
              <tr style="cursor: pointer;" data-id="${p.id}">
                <td><strong>${escapeHTML(p.name)}</strong></td>
                <td>${escapeHTML(p.species)} (${escapeHTML(p.breed)})</td>
                <td>${escapeHTML(p.age || 'N/A')}</td>
                <td>${escapeHTML(p.ownerName)}</td>
                <td>${escapeHTML(p.ownerPhone)}</td>
                <td><span class="badge badge-info">${p.visits ? p.visits.length : 0} visits</span></td>
                <td style="text-align: right;" class="no-click">
                  <button class="btn-icon view-patient-btn" data-id="${p.id}" title="View/Edit Visits">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  </button>
                  <button class="btn-icon delete-patient-btn" data-id="${p.id}" title="Delete Patient" style="border-color: var(--danger); color: var(--danger);">
                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
            ${patients.length === 0 ? '<tr><td colspan="7" style="text-align: center;">No patients found. Add your first patient to get started.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach search listener
  const searchInput = document.getElementById('patient-search');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#patients-table-body tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(q)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });

  // Open patient details on row click (excluding buttons column)
  const rows = document.querySelectorAll('#patients-table-body tr');
  rows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.no-click')) return;
      const id = row.getAttribute('data-id');
      if (id) renderPatientDetails(container, id);
    });
  });

  // Action buttons
  container.querySelectorAll('.view-patient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderPatientDetails(container, btn.getAttribute('data-id'));
    });
  });

  container.querySelectorAll('.delete-patient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this patient and all their visit history?')) {
        let list = db.getPatients();
        list = list.filter(p => p.id !== id);
        db.savePatients(list);
        Toast.show('Patient deleted successfully', 'success');
        renderPatientsList(container);
      }
    });
  });

  document.getElementById('add-patient-btn').addEventListener('click', () => {
    openAddPatientModal(container);
  });
}

function openAddPatientModal(container) {
  const formHTML = `
    <form id="add-patient-form">
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="pat-name">Pet Name *</label>
          <input type="text" id="pat-name" class="form-input" required placeholder="e.g. Buddy">
        </div>
        <div class="form-group">
          <label class="form-label" for="pat-species">Species *</label>
          <input type="text" id="pat-species" class="form-input" required placeholder="e.g. Dog, Cat">
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="pat-breed">Breed *</label>
          <input type="text" id="pat-breed" class="form-input" required placeholder="e.g. Golden Retriever">
        </div>
        <div class="form-group">
          <label class="form-label" for="pat-age">Age *</label>
          <input type="text" id="pat-age" class="form-input" required placeholder="e.g. 2 years">
        </div>
      </div>
      <h4 style="margin: 1rem 0 0.5rem 0; color: var(--secondary);">Owner Information</h4>
      <div class="form-group">
        <label class="form-label" for="owner-name">Owner Name *</label>
        <input type="text" id="owner-name" class="form-input" required placeholder="e.g. John Smith">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="owner-phone">Owner Phone *</label>
          <input type="text" id="owner-phone" class="form-input" required placeholder="e.g. +1 (555) 123-4567">
        </div>
        <div class="form-group">
          <label class="form-label" for="owner-email">Owner Email</label>
          <input type="email" id="owner-email" class="form-input" placeholder="e.g. owner@example.com">
        </div>
      </div>
      <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">Save Patient</button>
    </form>
  `;

  Modal.open('Add New Patient', formHTML, (modalBody) => {
    modalBody.querySelector('#add-patient-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPatient = {
        id: 'pat_' + Date.now(),
        name: document.getElementById('pat-name').value,
        species: document.getElementById('pat-species').value,
        breed: document.getElementById('pat-breed').value,
        age: document.getElementById('pat-age').value,
        ownerName: document.getElementById('owner-name').value,
        ownerPhone: document.getElementById('owner-phone').value,
        ownerEmail: document.getElementById('owner-email').value,
        visits: []
      };

      const patients = db.getPatients();
      patients.push(newPatient);
      db.savePatients(patients);
      
      Toast.show('Patient added successfully', 'success');
      Modal.close();
      renderPatientsList(container);
    });
  });
}

function renderPatientDetails(container, patientId) {
  activePatientId = patientId;
  const patients = db.getPatients();
  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    Toast.show('Patient not found', 'error');
    renderPatientsList(container);
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Profile: ${escapeHTML(patient.name)}</h2>
        <p class="section-subtitle">Manage visits, files, and write prescriptions</p>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        <button id="back-to-list-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.35rem;">
          <svg class="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Back to Patients</span>
        </button>
        <button id="new-visit-btn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.35rem;">
          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>New Visit Entry</span>
        </button>
      </div>
    </div>

    <div class="patient-profile">
      <!-- Left sidebar summary info -->
      <div class="patient-info-sidebar">
        <div class="dashboard-card glass-panel" style="padding: 1.5rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <svg class="icon icon-xl" style="color: var(--secondary); margin-bottom: 0.75rem;" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <h3>${escapeHTML(patient.name)}</h3>
          <span class="badge badge-success" style="margin-top: 0.25rem;">${escapeHTML(patient.species)}</span>
        </div>

        <div class="dashboard-card glass-panel" style="padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem;">
          <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem; color: var(--secondary);">Pet Details</h4>
          <p style="margin-bottom: 0.5rem;"><strong>Breed:</strong> ${escapeHTML(patient.breed)}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Age:</strong> ${escapeHTML(patient.age)}</p>
          
          <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--secondary);">Owner Details</h4>
          <p style="margin-bottom: 0.5rem;"><strong>Name:</strong> ${escapeHTML(patient.ownerName)}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Phone:</strong> ${escapeHTML(patient.ownerPhone)}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${escapeHTML(patient.ownerEmail || 'N/A')}</p>

          <button id="edit-patient-btn" class="btn btn-secondary" style="width: 100%; margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.8rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.25rem;">
            <svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <!-- Right visits area -->
      <div class="patient-visits-area">
        <h3 style="margin-bottom: 1rem; font-family: var(--font-heading);">Visit History (${patient.visits ? patient.visits.length : 0})</h3>
        
        <div id="visits-list">
          ${patient.visits && patient.visits.length > 0 ? 
            patient.visits.map(v => `
              <div class="visit-card glass-panel" id="visit-${v.id}">
                <div class="visit-meta">
                  <span class="visit-date" style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Visit Date: ${v.date}</span>
                  </span>
                  <div style="display: flex; gap: 0.5rem;" class="no-print">
                    <button class="btn btn-secondary btn-icon delete-visit-btn" data-visit-id="${v.id}" title="Delete Visit" style="border-color: var(--danger); color: var(--danger); width: 2rem; height: 2rem;">
                      <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>

                <div style="margin-bottom: 1rem;">
                  <strong style="color: var(--text-secondary); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">Doctor Notes:</strong>
                  <p style="font-size: 0.9rem; line-height: 1.5; white-space: pre-line;">${escapeHTML(v.notes)}</p>
                </div>

                <!-- Prescription Section inside visit -->
                <div style="border-top: 1px dashed var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <strong style="color: var(--primary); font-size: 0.9rem;">℞ Prescription</strong>
                    <div>
                      ${v.prescription ? `
                        <button class="btn btn-secondary print-prescription-btn" data-visit-id="${v.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                          <svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                          <span>Print</span>
                        </button>
                        <button class="btn btn-secondary edit-prescription-btn" data-visit-id="${v.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                          <svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          <span>Edit</span>
                        </button>
                      ` : `
                        <button class="btn btn-primary add-prescription-btn" data-visit-id="${v.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          <span>Create Prescription</span>
                        </button>
                      `}
                    </div>
                  </div>
                  ${v.prescription ? `
                    <div class="glass-panel" style="padding: 0.75rem 1rem; font-size: 0.85rem; background: rgba(232, 168, 124, 0.05);">
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.5rem;">
                        <thead>
                          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                            <th style="padding: 0.25rem 0;">Medicine</th>
                            <th style="padding: 0.25rem 0;">Dosage</th>
                            <th style="padding: 0.25rem 0;">Frequency</th>
                            <th style="padding: 0.25rem 0;">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${v.prescription.medicines.map(m => `
                            <tr>
                              <td style="padding: 0.25rem 0;"><strong>${escapeHTML(m.name)}</strong></td>
                              <td style="padding: 0.25rem 0;">${escapeHTML(m.dosage)}</td>
                              <td style="padding: 0.25rem 0;">${escapeHTML(m.frequency)}</td>
                              <td style="padding: 0.25rem 0;">${escapeHTML(m.duration)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      ${v.prescription.instructions ? `
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);"><strong>Directions:</strong> ${escapeHTML(v.prescription.instructions)}</p>
                      ` : ''}
                    </div>
                  ` : `
                    <p style="font-size: 0.8rem; color: var(--text-tertiary); font-style: italic;">No prescription created for this visit yet.</p>
                  `}
                </div>

                <!-- Attached Files Section -->
                <div style="border-top: 1px dashed var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: var(--text-secondary); font-size: 0.85rem;">Attached Medical Documents:</strong>
                    <label class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;">
                      <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                      <span>Upload Document</span>
                      <input type="file" class="visit-file-upload-input" data-visit-id="${v.id}" style="display: none;">
                    </label>
                  </div>
                  <div class="visit-docs" id="docs-list-${v.id}">
                    ${v.documents && v.documents.length > 0 ? 
                      v.documents.map((d, index) => `
                        <div class="doc-pill">
                          <span style="cursor: pointer; display: inline-flex; align-items: center;" class="view-doc-btn" data-visit-id="${v.id}" data-doc-idx="${index}">
                            <svg class="icon" style="margin-right: 0.25rem;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            <span>${escapeHTML(d.name)}</span>
                          </span>
                          <span class="delete-doc-btn" data-visit-id="${v.id}" data-doc-idx="${index}" style="cursor: pointer; color: var(--danger); margin-left: 0.25rem; font-weight: bold;">&times;</span>
                        </div>
                      `).join('') : `
                      <p style="font-size: 0.8rem; color: var(--text-tertiary); font-style: italic;">No documents uploaded.</p>
                    `}
                  </div>
                </div>
              </div>
            `).join('')
            : '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--text-tertiary);">No visits recorded yet. Click "New Visit Entry" above to record one.</div>'
          }
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('back-to-list-btn').addEventListener('click', () => {
    renderPatientsList(container);
  });

  document.getElementById('edit-patient-btn').addEventListener('click', () => {
    openEditPatientModal(container, patient);
  });

  document.getElementById('new-visit-btn').addEventListener('click', () => {
    openNewVisitModal(container, patient);
  });

  // Action listeners inside visit cards
  container.querySelectorAll('.delete-visit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const visitId = btn.getAttribute('data-visit-id');
      if (confirm('Delete this visit entry?')) {
        let patientList = db.getPatients();
        const pIdx = patientList.findIndex(p => p.id === patientId);
        if (pIdx !== -1) {
          patientList[pIdx].visits = patientList[pIdx].visits.filter(v => v.id !== visitId);
          db.savePatients(patientList);
          Toast.show('Visit entry removed', 'success');
          renderPatientDetails(container, patientId);
        }
      }
    });
  });

  // File Upload listener
  container.querySelectorAll('.visit-file-upload-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const visitId = input.getAttribute('data-visit-id');
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const fileData = evt.target.result;
        let patientList = db.getPatients();
        const pIdx = patientList.findIndex(p => p.id === patientId);
        if (pIdx !== -1) {
          const vIdx = patientList[pIdx].visits.findIndex(v => v.id === visitId);
          if (vIdx !== -1) {
            if (!patientList[pIdx].visits[vIdx].documents) {
              patientList[pIdx].visits[vIdx].documents = [];
            }
            patientList[pIdx].visits[vIdx].documents.push({
              name: file.name,
              type: file.type,
              data: fileData
            });
            db.savePatients(patientList);
            Toast.show('Document uploaded successfully!', 'success');
            renderPatientDetails(container, patientId);
          }
        }
      };
      // For binary files/images/pdfs load as Data URL. For txt files also safe.
      reader.readAsDataURL(file);
    });
  });

  // Document actions
  container.querySelectorAll('.view-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const visitId = btn.getAttribute('data-visit-id');
      const docIdx = parseInt(btn.getAttribute('data-doc-idx'), 10);
      const patients = db.getPatients();
      const patient = patients.find(p => p.id === patientId);
      const visit = patient.visits.find(v => v.id === visitId);
      const doc = visit.documents[docIdx];
      
      openDocumentViewerModal(doc);
    });
  });

  container.querySelectorAll('.delete-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const visitId = btn.getAttribute('data-visit-id');
      const docIdx = parseInt(btn.getAttribute('data-doc-idx'), 10);
      if (confirm('Delete this document?')) {
        let patientList = db.getPatients();
        const pIdx = patientList.findIndex(p => p.id === patientId);
        if (pIdx !== -1) {
          const vIdx = patientList[pIdx].visits.findIndex(v => v.id === visitId);
          if (vIdx !== -1) {
            patientList[pIdx].visits[vIdx].documents.splice(docIdx, 1);
            db.savePatients(patientList);
            Toast.show('Document deleted', 'success');
            renderPatientDetails(container, patientId);
          }
        }
      }
    });
  });

  // Prescription creation/editing
  container.querySelectorAll('.add-prescription-btn, .edit-prescription-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const visitId = btn.getAttribute('data-visit-id');
      openPrescriptionModal(container, patientId, visitId);
    });
  });

  container.querySelectorAll('.print-prescription-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const visitId = btn.getAttribute('data-visit-id');
      const patients = db.getPatients();
      const patientObj = patients.find(p => p.id === patientId);
      const visitObj = patientObj.visits.find(v => v.id === visitId);
      
      printPrescription(patientObj, visitObj);
    });
  });
}

function openEditPatientModal(container, patient) {
  const formHTML = `
    <form id="edit-patient-form">
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="epat-name">Pet Name</label>
          <input type="text" id="epat-name" class="form-input" required value="${escapeHTML(patient.name)}">
        </div>
        <div class="form-group">
          <label class="form-label" for="epat-species">Species</label>
          <input type="text" id="epat-species" class="form-input" required value="${escapeHTML(patient.species)}">
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="epat-breed">Breed</label>
          <input type="text" id="epat-breed" class="form-input" required value="${escapeHTML(patient.breed)}">
        </div>
        <div class="form-group">
          <label class="form-label" for="epat-age">Age</label>
          <input type="text" id="epat-age" class="form-input" required value="${escapeHTML(patient.age)}">
        </div>
      </div>
      <h4 style="margin: 1rem 0 0.5rem 0; color: var(--secondary);">Owner Details</h4>
      <div class="form-group">
        <label class="form-label" for="eowner-name">Owner Name</label>
        <input type="text" id="eowner-name" class="form-input" required value="${escapeHTML(patient.ownerName)}">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label" for="eowner-phone">Owner Phone</label>
          <input type="text" id="eowner-phone" class="form-input" required value="${escapeHTML(patient.ownerPhone)}">
        </div>
        <div class="form-group">
          <label class="form-label" for="eowner-email">Owner Email</label>
          <input type="email" id="eowner-email" class="form-input" value="${escapeHTML(patient.ownerEmail || '')}">
        </div>
      </div>
      <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">Update Details</button>
    </form>
  `;

  Modal.open('Edit Patient Profile', formHTML, (modalBody) => {
    modalBody.querySelector('#edit-patient-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      let list = db.getPatients();
      const pIdx = list.findIndex(p => p.id === patient.id);
      if (pIdx !== -1) {
        list[pIdx].name = document.getElementById('epat-name').value;
        list[pIdx].species = document.getElementById('epat-species').value;
        list[pIdx].breed = document.getElementById('epat-breed').value;
        list[pIdx].age = document.getElementById('epat-age').value;
        list[pIdx].ownerName = document.getElementById('eowner-name').value;
        list[pIdx].ownerPhone = document.getElementById('eowner-phone').value;
        list[pIdx].ownerEmail = document.getElementById('eowner-email').value;
        
        db.savePatients(list);
        Toast.show('Profile updated successfully', 'success');
        Modal.close();
        renderPatientDetails(container, patient.id);
      }
    });
  });
}

function openNewVisitModal(container, patient) {
  const today = new Date().toISOString().split('T')[0];
  const formHTML = `
    <form id="new-visit-form">
      <div class="form-group">
        <label class="form-label" for="visit-date-input">Visit Date</label>
        <input type="date" id="visit-date-input" class="form-input" required value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label" for="visit-notes-input">Visit Diagnosis & Notes</label>
        <textarea id="visit-notes-input" class="form-textarea" required placeholder="Write clinical diagnosis, findings, checkup parameters..."></textarea>
      </div>
      <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">Save Visit Entry</button>
    </form>
  `;

  Modal.open('New Visit Entry', formHTML, (modalBody) => {
    modalBody.querySelector('#new-visit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newVisit = {
        id: 'vis_' + Date.now(),
        date: document.getElementById('visit-date-input').value,
        notes: document.getElementById('visit-notes-input').value,
        documents: [],
        prescription: null
      };

      let list = db.getPatients();
      const pIdx = list.findIndex(p => p.id === patient.id);
      if (pIdx !== -1) {
        if (!list[pIdx].visits) list[pIdx].visits = [];
        list[pIdx].visits.unshift(newVisit); // Add to top of list
        db.savePatients(list);
        Toast.show('Visit saved successfully', 'success');
        Modal.close();
        renderPatientDetails(container, patient.id);
      }
    });
  });
}

function openPrescriptionModal(container, patientId, visitId) {
  const patients = db.getPatients();
  const patient = patients.find(p => p.id === patientId);
  const visit = patient.visits.find(v => v.id === visitId);
  const prescription = visit.prescription || { medicines: [], instructions: '' };

  const formHTML = `
    <form id="prescription-form">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h4 style="color: var(--primary);">Prescribed Medicines</h4>
        <button type="button" id="add-med-row-btn" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.25rem;">
          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Add Row</span>
        </button>
      </div>
      
      <div style="max-height: 250px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <table class="data-table" style="width: 100%; min-width: 500px;">
          <thead>
            <tr>
              <th>Medicine Name *</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th style="width: 50px;">Remove</th>
            </tr>
          </thead>
          <tbody id="med-table-rows">
            <!-- Row generation -->
          </tbody>
        </table>
      </div>

      <div class="form-group">
        <label class="form-label" for="pres-directions">Special Directions & Warnings</label>
        <textarea id="pres-directions" class="form-textarea" placeholder="e.g. Administer with food, keep hydration high...">${escapeHTML(prescription.instructions || '')}</textarea>
      </div>
      
      <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 0.5rem;">Save Prescription</button>
    </form>
  `;

  Modal.open('Write Prescription', formHTML, (modalBody) => {
    const tbody = modalBody.querySelector('#med-table-rows');
    
    // Helper to generate a new row
    function createRow(name = '', dosage = '', freq = '', dur = '') {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-input med-name" style="padding: 0.4rem;" required placeholder="e.g. Carprofen" value="${escapeHTML(name)}"></td>
        <td><input type="text" class="form-input med-dosage" style="padding: 0.4rem;" placeholder="e.g. 50mg" value="${escapeHTML(dosage)}"></td>
        <td><input type="text" class="form-input med-frequency" style="padding: 0.4rem;" placeholder="e.g. Twice daily" value="${escapeHTML(freq)}"></td>
        <td><input type="text" class="form-input med-duration" style="padding: 0.4rem;" placeholder="e.g. 5 days" value="${escapeHTML(dur)}"></td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon remove-row-btn" style="border-color: var(--danger); color: var(--danger); width: 1.8rem; height: 1.8rem;">
            <svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </td>
      `;
      
      tr.querySelector('.remove-row-btn').addEventListener('click', () => {
        tr.remove();
      });
      tbody.appendChild(tr);
    }

    // Load existing medicines
    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach(m => {
        createRow(m.name, m.dosage, m.frequency, m.duration);
      });
    } else {
      createRow(); // start with one blank row
    }

    // Add row action
    modalBody.querySelector('#add-med-row-btn').addEventListener('click', () => {
      createRow();
    });

    // Form submission
    modalBody.querySelector('#prescription-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const medicines = [];
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(r => {
        const nameVal = r.querySelector('.med-name').value.trim();
        const dosageVal = r.querySelector('.med-dosage').value.trim();
        const freqVal = r.querySelector('.med-frequency').value.trim();
        const durVal = r.querySelector('.med-duration').value.trim();
        if (nameVal) {
          medicines.push({
            name: nameVal,
            dosage: dosageVal,
            frequency: freqVal,
            duration: durVal
          });
        }
      });

      if (medicines.length === 0) {
        Toast.show('Please add at least one medicine', 'warning');
        return;
      }

      let patientList = db.getPatients();
      const pIdx = patientList.findIndex(p => p.id === patientId);
      if (pIdx !== -1) {
        const vIdx = patientList[pIdx].visits.findIndex(v => v.id === visitId);
        if (vIdx !== -1) {
          patientList[pIdx].visits[vIdx].prescription = {
            id: prescription.id || 'pres_' + Date.now(),
            date: visit.date,
            medicines: medicines,
            instructions: document.getElementById('pres-directions').value
          };

          db.savePatients(patientList);
          Toast.show('Prescription saved successfully!', 'success');
          Modal.close();
          renderPatientDetails(container, patientId);
        }
      }
    });
  });
}

function openDocumentViewerModal(doc) {
  let content = '';
  if (doc.type.startsWith('image/')) {
    content = `<div style="text-align: center;"><img src="${doc.data}" style="max-width: 100%; max-height: 60vh; border-radius: var(--radius-md); box-shadow: var(--shadow-md);"></div>`;
  } else if (doc.type === 'text/plain') {
    // doc.data contains either text or text encoded as dataUrl
    let text = doc.content || '';
    if (doc.data && doc.data.startsWith('data:')) {
      try {
        const base64 = doc.data.split(',')[1];
        text = atob(base64);
      } catch (ex) {
        text = 'Unable to decode text document.';
      }
    }
    content = `<pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); font-family: monospace; white-space: pre-wrap; word-wrap: break-word; color: var(--text-primary); border: 1px solid var(--border-color);">${escapeHTML(text)}</pre>`;
  } else if (doc.type === 'application/pdf') {
    content = `
      <div style="text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center;">
        <svg class="icon icon-xl" style="color: var(--secondary); margin-bottom: 1rem;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <h3>PDF Document: ${escapeHTML(doc.name)}</h3>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">For security reasons in this browser environment, please download the PDF to view its contents.</p>
        <a href="${doc.data}" download="${doc.name}" class="btn btn-primary">⬇️ Download PDF</a>
      </div>
    `;
  } else {
    content = `
      <div style="text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center;">
        <svg class="icon icon-xl" style="color: var(--secondary); margin-bottom: 1rem;" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        <h3>Document: ${escapeHTML(doc.name)}</h3>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">Unknown or binary file type (${escapeHTML(doc.type)}).</p>
        <a href="${doc.data}" download="${doc.name}" class="btn btn-primary">⬇️ Download File</a>
      </div>
    `;
  }

  Modal.open(doc.name, content);
}

// Print prescription functionality mapping details into hidden print area & issuing print trigger
function printPrescription(patient, visit) {
  if (!visit.prescription) return;
  const p = visit.prescription;
  
  // Bind inputs to print template nodes
  document.getElementById('print-pet-name').textContent = `${patient.name} (${patient.species} - ${patient.breed})`;
  document.getElementById('print-owner-name').textContent = patient.ownerName;
  document.getElementById('print-visit-date').textContent = p.date;
  
  const medTbody = document.getElementById('print-medicines-list');
  medTbody.innerHTML = p.medicines.map(m => `
    <tr>
      <td><strong>${escapeHTML(m.name)}</strong></td>
      <td>${escapeHTML(m.dosage)}</td>
      <td>${escapeHTML(m.frequency)}</td>
      <td>${escapeHTML(m.duration)}</td>
    </tr>
  `).join('');

  document.getElementById('print-instructions-text').textContent = p.instructions || "None provided.";
  
  // Issue window print
  window.print();
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
