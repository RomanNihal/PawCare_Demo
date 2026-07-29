/* VetCare Pro - Shared Utilities & Mock Database Initializer */

const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4o-mini',
  instructions: 'You are a warm, helpful veterinary AI assistant at "PawCare Pro". You speak on behalf of Dr. Roman Nihal. Answer questions about services, pricing, treatments, and help book appointments. Be concise and friendly. If a user asks a highly specific medical question or is upset, acknowledge and say a human will review, then end with: [NEEDS_HUMAN].'
};

const DEFAULT_PATIENTS = [
  {
    id: "pat_1",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    ownerName: "John Smith",
    ownerPhone: "+1 (555) 123-4567",
    ownerEmail: "john.smith@example.com",
    visits: [
      {
        id: "vis_1_1",
        date: "2026-05-10",
        notes: "Routine vaccination and general checkup. Heart and lungs sound healthy. Recommended flea control.",
        documents: [
          { name: "Vaccination_Record.pdf", type: "application/pdf", data: "data:application/pdf;base64,JVBERi0xLjQKJ..." },
          { name: "Prescription_Dewormer.txt", type: "text/plain", content: "Rx: Dewormer (Milbemycin oxime) - 1 tablet once monthly.\nDr. Roman Nihal" }
        ],
        prescription: {
          id: "pres_1_1",
          date: "2026-05-10",
          medicines: [
            { name: "Interceptor Plus", dosage: "1 tablet", frequency: "Monthly", duration: "6 months" }
          ],
          instructions: "Give with food. Watch for any lethargy."
        }
      },
      {
        id: "vis_1_2",
        date: "2026-06-15",
        notes: "Came in for minor limp in front left paw. X-ray showed mild sprain. Prescribed anti-inflammatory.",
        documents: [],
        prescription: {
          id: "pres_1_2",
          date: "2026-06-15",
          medicines: [
            { name: "Carprofen", dosage: "50mg", frequency: "Twice daily", duration: "5 days" }
          ],
          instructions: "Give after meals. Limit physical activity (no running or jumping) for a week."
        }
      }
    ]
  },
  {
    id: "pat_2",
    name: "Luna",
    species: "Cat",
    breed: "Siamese",
    age: "1.5 years",
    ownerName: "Emily Davis",
    ownerPhone: "+1 (555) 987-6543",
    ownerEmail: "emily.d@example.com",
    visits: [
      {
        id: "vis_2_1",
        date: "2026-04-12",
        notes: "Dental cleaning and minor scale removal. Gums were slightly inflamed (mild gingivitis).",
        documents: [],
        prescription: null
      }
    ]
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: "bk_1",
    patientName: "Bella",
    petType: "Dog (Poodle)",
    ownerName: "Alice Cooper",
    ownerPhone: "+1 (555) 246-8101",
    date: "2026-07-30",
    time: "10:30 AM",
    status: "Confirmed",
    notes: "Dental scaling consultation"
  },
  {
    id: "bk_2",
    patientName: "Rocky",
    petType: "Cat (Tabby)",
    ownerName: "Bob Miller",
    ownerPhone: "+1 (555) 369-1215",
    date: "2026-07-31",
    time: "02:00 PM",
    status: "Confirmed",
    notes: "General checkup and vaccination booster"
  }
];

const DEFAULT_CONVERSATIONS = [
  {
    id: "conv_1",
    petOwner: "Alice Cooper",
    lastActive: "2026-07-29T08:15:00Z",
    flagged: false,
    messages: [
      { sender: "user", text: "Hi, what are your opening hours and dental service prices?" },
      { sender: "bot", text: "Hello! We are open Monday to Friday from 9:00 AM to 6:00 PM. Dental cleaning and scaling start at $120 depending on the pet's size and oral condition. Would you like to book a dental consultation?" },
      { sender: "user", text: "Yes please, that would be great." }
    ]
  },
  {
    id: "conv_2",
    petOwner: "Unknown (Guest)",
    lastActive: "2026-07-29T08:30:00Z",
    flagged: true,
    messages: [
      { sender: "user", text: "My dog just ate a whole chocolate bar! Is he going to be okay? He is throwing up." },
      { sender: "bot", text: "Oh no! Chocolate can be highly toxic to dogs, and throwing up is a serious symptom. Please seek emergency veterinary care immediately. Since this is an urgent medical concern, I am flagging this chat for Dr. Roman Nihal to review, but please do not wait—go to the nearest emergency clinic! [NEEDS_HUMAN]" }
    ]
  }
];

const DEFAULT_KNOWLEDGEBASE = [
  {
    id: "kb_1",
    name: "clinic_pricing_and_services.txt",
    size: "1.2 KB",
    content: `PawCare Pro Services & Pricing:
- General Consultation: $45 (Includes physical examination and temperature check)
- Annual Vaccinations: $75 (DHPP / FVRCP booster + Rabies vaccine)
- Dental Scaling & Polishing: $150 - $250 (Requires general anesthesia, which is evaluated separately)
- Spay/Neuter Procedure: $180 - $350 (Based on gender and weight)
- Microchipping: $35 (Includes registration)
- X-Ray / Radiography: $120 per session

Hours of Operation:
- Mon - Fri: 9:00 AM - 6:00 PM
- Saturday: 10:00 AM - 3:00 PM
- Sunday: Closed`
  }
];

// Initialize Mock Database
function initDB() {
  if (!localStorage.getItem("vet_settings")) {
    localStorage.setItem("vet_settings", JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem("vet_patients")) {
    localStorage.setItem("vet_patients", JSON.stringify(DEFAULT_PATIENTS));
  }
  if (!localStorage.getItem("vet_bookings")) {
    localStorage.setItem("vet_bookings", JSON.stringify(DEFAULT_BOOKINGS));
  }
  if (!localStorage.getItem("vet_conversations")) {
    localStorage.setItem("vet_conversations", JSON.stringify(DEFAULT_CONVERSATIONS));
  }
  if (!localStorage.getItem("vet_knowledgebase")) {
    localStorage.setItem("vet_knowledgebase", JSON.stringify(DEFAULT_KNOWLEDGEBASE));
  }
  if (!localStorage.getItem("vet_calendar_rules")) {
    localStorage.setItem("vet_calendar_rules", JSON.stringify({}));
  }
}

// Database Getters/Setters
const db = {
  getSettings() {
    return JSON.parse(localStorage.getItem("vet_settings") || "{}");
  },
  saveSettings(settings) {
    localStorage.setItem("vet_settings", JSON.stringify(settings));
  },
  getPatients() {
    return JSON.parse(localStorage.getItem("vet_patients") || "[]");
  },
  savePatients(patients) {
    localStorage.setItem("vet_patients", JSON.stringify(patients));
  },
  getBookings() {
    return JSON.parse(localStorage.getItem("vet_bookings") || "[]");
  },
  saveBookings(bookings) {
    localStorage.setItem("vet_bookings", JSON.stringify(bookings));
  },
  getConversations() {
    return JSON.parse(localStorage.getItem("vet_conversations") || "[]");
  },
  saveConversations(conversations) {
    localStorage.setItem("vet_conversations", JSON.stringify(conversations));
  },
  getKnowledgebase() {
    return JSON.parse(localStorage.getItem("vet_knowledgebase") || "[]");
  },
  saveKnowledgebase(kb) {
    localStorage.setItem("vet_knowledgebase", JSON.stringify(kb));
  },
  getCalendarRules() {
    return JSON.parse(localStorage.getItem("vet_calendar_rules") || "{}");
  },
  saveCalendarRules(rules) {
    localStorage.setItem("vet_calendar_rules", JSON.stringify(rules));
  }
};

// Auto-init on script load
initDB();

// Toast Notification Toast System
const Toast = {
  show(message, type = 'info', duration = 3000) {
    // Check if container exists
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 9999;
      `;
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass-panel`;
    toast.style.cssText = `
      padding: 12px 24px;
      color: var(--text-primary);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 250px;
      transform: translateY(20px);
      opacity: 0;
      transition: all var(--transition-fast);
    `;
    
    // Icon selection
    let icon = `<svg class="icon" style="color: var(--info);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    if (type === 'success') {
      icon = `<svg class="icon" style="color: var(--success);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      toast.style.borderLeft = '4px solid var(--success)';
    } else if (type === 'error') {
      icon = `<svg class="icon" style="color: var(--danger);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      toast.style.borderLeft = '4px solid var(--danger)';
    } else if (type === 'warning') {
      icon = `<svg class="icon" style="color: var(--warning);" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      toast.style.borderLeft = '4px solid var(--warning)';
    } else {
      toast.style.borderLeft = '4px solid var(--secondary)';
    }
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    // Animate In
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);
    
    // Animate Out
    setTimeout(() => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
};
export { db, Toast };
