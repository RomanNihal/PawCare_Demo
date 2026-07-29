/* VetCare Pro - Bookings Module */
import { db, Toast } from '../utils.js';

export function initBookings(container) {
  renderBookings(container);
}

function renderBookings(container) {
  const bookings = db.getBookings();

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Appointments Booked</h2>
        <p class="section-subtitle">View and manage appointments scheduled by patient owners via the AI chatbot</p>
      </div>
    </div>

    <div class="dashboard-card glass-panel">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Pet Name</th>
              <th>Pet Info / Type</th>
              <th>Owner Name</th>
              <th>Contact Phone</th>
              <th>Notes / Reason</th>
              <th>Status</th>
              <th style="text-align: right; width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody id="bookings-table-body">
            ${bookings.map(b => `
              <tr>
                <td><strong>${escapeHTML(b.date)}</strong></td>
                <td><span class="badge badge-info">${escapeHTML(b.time)}</span></td>
                <td><strong>${escapeHTML(b.patientName)}</strong></td>
                <td>${escapeHTML(b.petType || 'Pet')}</td>
                <td>${escapeHTML(b.ownerName)}</td>
                <td>${escapeHTML(b.ownerPhone)}</td>
                <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-secondary);">${escapeHTML(b.notes || 'N/A')}</td>
                <td><span class="badge badge-success">${escapeHTML(b.status || 'Confirmed')}</span></td>
                <td style="text-align: right;">
                  <button class="btn-icon delete-booking-btn" data-id="${b.id}" title="Cancel Appointment" style="border-color: var(--danger); color: var(--danger);">
                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
            ${bookings.length === 0 ? '<tr><td colspan="9" style="text-align: center;">No bookings recorded yet. Appointments booked by the chatbot will appear here.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind cancel action
  container.querySelectorAll('.delete-booking-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to cancel and delete this appointment booking?')) {
        let currentBookings = db.getBookings();
        currentBookings = currentBookings.filter(b => b.id !== id);
        db.saveBookings(currentBookings);
        Toast.show('Booking cancelled successfully', 'success');
        renderBookings(container);
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
