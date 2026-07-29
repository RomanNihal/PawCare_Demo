/* VetCare Pro - Calendar & Booking Rules Module */
import { db, Toast } from '../utils.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed
let selectedDateStr = new Date().toISOString().split('T')[0];
let isGoogleConnected = false;

export function initCalendar(container) {
  isGoogleConnected = localStorage.getItem('vet_gcal_connected') === 'true';
  renderCalendarView(container);
}

function renderCalendarView(container) {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const rules = db.getCalendarRules();
  const ruleForSelected = rules[selectedDateStr] || '';

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Calendar & Booking Rules</h2>
        <p class="section-subtitle">Connect Google Calendar and override availability rules per date</p>
      </div>
      <div>
        <button id="gcal-connect-btn" class="btn ${isGoogleConnected ? 'btn-secondary' : 'btn-primary'}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
          ${isGoogleConnected ? 
            `<svg class="icon" viewBox="0 0 24 24" style="color: var(--success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Connected to Google Calendar</span>` : 
            `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> <span>Connect Google Calendar</span>`
          }
        </button>
      </div>
    </div>

    <div class="grid-2">
      <!-- Calendar panel -->
      <div class="dashboard-card glass-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 id="calendar-month-year" style="font-family: var(--font-heading);">${months[currentMonth]} ${currentYear}</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button id="prev-month-btn" class="btn btn-secondary btn-icon" style="width: 2rem; height: 2rem;">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button id="next-month-btn" class="btn btn-secondary btn-icon" style="width: 2rem; height: 2rem;">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        <div class="calendar-month">
          <div class="calendar-day-header">Sun</div>
          <div class="calendar-day-header">Mon</div>
          <div class="calendar-day-header">Tue</div>
          <div class="calendar-day-header">Wed</div>
          <div class="calendar-day-header">Thu</div>
          <div class="calendar-day-header">Fri</div>
          <div class="calendar-day-header">Sat</div>
          <!-- Days populated dynamically -->
          <div id="calendar-days-grid" style="display: contents;"></div>
        </div>
      </div>

      <!-- Detail/Rules editor panel -->
      <div class="dashboard-card glass-panel" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="margin-bottom: 0.5rem; font-family: var(--font-heading); color: var(--secondary);">Rules for: <span id="selected-date-label">${selectedDateStr}</span></h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
            Add instructions for this date. The AI chatbot will check these before offering slots to clients (e.g. "Do not book any appointments", "Only accept urgent checkups", "Unavailable after 2:00 PM").
          </p>

          <div class="form-group">
            <label class="form-label" for="date-rule-input">Booking Instructions / Block Times</label>
            <textarea id="date-rule-input" class="form-textarea" style="height: 180px;" placeholder="Write rules for this day... (e.g. 'No appointments all day' or 'No appointments after 1 PM')">${escapeHTML(ruleForSelected)}</textarea>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <button id="save-rule-btn" class="btn btn-primary" style="flex-grow: 1;">Save Booking Rule</button>
          <button id="clear-rule-btn" class="btn btn-secondary" style="border-color: var(--danger); color: var(--danger);">Clear</button>
        </div>
      </div>
    </div>
  `;

  // Draw Grid
  drawCalendarGrid(container);

  // Bind Header Controls
  document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    drawCalendarGrid(container);
  });

  document.getElementById('next-month-btn').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    drawCalendarGrid(container);
  });

  // Bind OAuth simulated flow
  const connBtn = document.getElementById('gcal-connect-btn');
  connBtn.addEventListener('click', () => {
    if (isGoogleConnected) {
      if (confirm('Disconnect from Google Calendar?')) {
        isGoogleConnected = false;
        localStorage.setItem('vet_gcal_connected', 'false');
        connBtn.className = 'btn btn-primary';
        connBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="margin-right: 0.25rem;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> <span>Connect Google Calendar</span>`;
        Toast.show('Google Calendar disconnected', 'info');
      }
    } else {
      Toast.show('Initiating Google Calendar Connection...', 'info');
      connBtn.disabled = true;
      setTimeout(() => {
        isGoogleConnected = true;
        localStorage.setItem('vet_gcal_connected', 'true');
        connBtn.disabled = false;
        connBtn.className = 'btn btn-secondary';
        connBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="color: var(--success); margin-right: 0.25rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Connected to Google Calendar</span>`;
        Toast.show('Successfully synchronized with Google Calendar!', 'success');
      }, 1500);
    }
  });

  // Rule actions
  const saveBtn = document.getElementById('save-rule-btn');
  const clearBtn = document.getElementById('clear-rule-btn');
  const ruleInput = document.getElementById('date-rule-input');

  saveBtn.addEventListener('click', () => {
    const text = ruleInput.value.trim();
    const currentRules = db.getCalendarRules();
    if (text) {
      currentRules[selectedDateStr] = text;
      db.saveCalendarRules(currentRules);
      Toast.show(`Instruction saved for ${selectedDateStr}`, 'success');
    } else {
      delete currentRules[selectedDateStr];
      db.saveCalendarRules(currentRules);
      Toast.show(`Instruction cleared for ${selectedDateStr}`, 'info');
    }
    drawCalendarGrid(container);
  });

  clearBtn.addEventListener('click', () => {
    ruleInput.value = '';
    const currentRules = db.getCalendarRules();
    delete currentRules[selectedDateStr];
    db.saveCalendarRules(currentRules);
    Toast.show(`Instruction cleared for ${selectedDateStr}`, 'info');
    drawCalendarGrid(container);
  });
}

function drawCalendarGrid(container) {
  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  document.getElementById('calendar-month-year').textContent = `${months[currentMonth]} ${currentYear}`;

  const rules = db.getCalendarRules();

  // First day of month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Days in month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Draw empty offset cells
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day disabled';
    grid.appendChild(emptyCell);
  }

  // Draw day cells
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    // Format YYYY-MM-DD
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const fullDate = `${currentYear}-${mStr}-${dStr}`;

    if (fullDate === selectedDateStr) {
      dayCell.classList.add('active');
    }

    const numSpan = document.createElement('span');
    numSpan.className = 'calendar-day-number';
    numSpan.textContent = day;
    dayCell.appendChild(numSpan);

    // Indicator if rule exists for day
    if (rules[fullDate]) {
      const dot = document.createElement('span');
      dot.className = 'calendar-day-indicator restricted';
      dayCell.appendChild(dot);
      dayCell.title = rules[fullDate];
    }

    dayCell.addEventListener('click', () => {
      // Set active
      document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('active'));
      dayCell.classList.add('active');

      selectedDateStr = fullDate;
      document.getElementById('selected-date-label').textContent = selectedDateStr;
      
      const updatedRules = db.getCalendarRules();
      document.getElementById('date-rule-input').value = updatedRules[selectedDateStr] || '';
    });

    grid.appendChild(dayCell);
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
