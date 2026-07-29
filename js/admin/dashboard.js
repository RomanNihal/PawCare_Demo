/* VetCare Pro - Admin Dashboard Coordinator */
import { auth } from './auth.js';
import { db, Toast } from '../utils.js';

// Import Tab Handlers
import { initPatients } from './patients.js';
import { initBookings } from './bookings.js';
import { initCalendar } from './calendar.js';
import { initConversations } from './conversations.js';
import { initKnowledgebase } from './knowledgebase.js';
import { initSettings } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  if (auth.isLoggedIn()) {
    bootstrapDashboard();
  }
});

// Setup Authentication Form Listeners
function setupAuth() {
  const loginForm = document.getElementById('login-form');
  const loginOverlay = document.getElementById('login-overlay');
  const adminShell = document.getElementById('admin-shell');

  if (auth.isLoggedIn()) {
    loginOverlay.style.display = 'none';
    adminShell.style.display = 'flex';
  } else {
    loginOverlay.style.display = 'flex';
    adminShell.style.display = 'none';
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    if (auth.login(user, pass)) {
      loginOverlay.style.display = 'none';
      adminShell.style.display = 'flex';
      bootstrapDashboard();
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
  });
}

// Bootstrap Dashboard Shell and Routing
function bootstrapDashboard() {
  setupNavigation();
  checkConversationsBadge();
  
  // Default to patients tab
  switchTab('patients');

  // Set up periodic check for new/flagged conversations
  setInterval(checkConversationsBadge, 5000);
}

// Sidebar Navigation Management
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

// Tab Switching Orchestrator
export function switchTab(tabName) {
  // Update nav UI active class
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Load modules
  const container = document.getElementById('active-tab-content');
  container.innerHTML = ''; // Clear contents

  switch(tabName) {
    case 'patients':
      initPatients(container);
      break;
    case 'bookings':
      initBookings(container);
      break;
    case 'calendar':
      initCalendar(container);
      break;
    case 'conversations':
      initConversations(container);
      break;
    case 'knowledgebase':
      initKnowledgebase(container);
      break;
    case 'settings':
      initSettings(container);
      break;
    default:
      container.innerHTML = '<h2>Module not found</h2>';
  }
}

// Check for flagged conversations to display red dot next to sidebar option
export function checkConversationsBadge() {
  const conversations = db.getConversations();
  const hasFlagged = conversations.some(c => c.flagged === true);
  const badge = document.getElementById('conversations-badge');
  if (badge) {
    badge.style.display = hasFlagged ? 'inline-block' : 'none';
  }
}

// Modal helper methods
export const Modal = {
  open(title, contentHTML, onRender = () => {}) {
    const modal = document.getElementById('shared-modal');
    document.getElementById('modal-title').textContent = title;
    
    const body = document.getElementById('modal-body');
    body.innerHTML = contentHTML;
    
    modal.classList.add('active');
    onRender(body);
    
    // Close events
    const closeBtn = document.getElementById('modal-close');
    const closeHandler = () => {
      Modal.close();
      closeBtn.removeEventListener('click', closeHandler);
    };
    closeBtn.addEventListener('click', closeHandler);
  },
  
  close() {
    const modal = document.getElementById('shared-modal');
    modal.classList.remove('active');
  }
};
