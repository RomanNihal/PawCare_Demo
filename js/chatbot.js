/* VetCare Pro - Public AI Chatbot Widget Logic */
import { db } from './utils.js';

let sessionConversationId = 'conv_' + Date.now();
let activeMessages = [];
let petOwnerName = 'Guest Owner';

// Mock list of slots available for bookings
const AVAILABLE_SLOTS = [
  { date: '2026-07-30', time: '10:30 AM', dayName: 'Thursday' },
  { date: '2026-07-31', time: '02:00 PM', dayName: 'Friday' },
  { date: '2026-08-01', time: '11:00 AM', dayName: 'Saturday' },
  { date: '2026-08-03', time: '09:30 AM', dayName: 'Monday' },
  { date: '2026-08-03', time: '03:30 PM', dayName: 'Monday' }
];

document.addEventListener('DOMContentLoaded', () => {
  setupChatPanel();
});

function setupChatPanel() {
  const trigger = document.getElementById('chat-trigger');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const userInput = document.getElementById('chat-user-input');

  // Toggle open
  trigger.addEventListener('click', () => {
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
      userInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('active');
  });

  // Action: Send Message
  const handleSend = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';
    
    // Show typing loader
    const loaderId = showTypingIndicator();
    
    try {
      const reply = await generateAIResponse(text);
      removeTypingIndicator(loaderId);
      appendMessage(reply, 'bot');
    } catch (e) {
      removeTypingIndicator(loaderId);
      appendMessage("I apologize, I encountered a communication problem. Please try again shortly or contact the clinic directly.", 'bot');
    }
  };

  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

function appendMessage(text, sender) {
  const stream = document.getElementById('chat-body-stream');
  if (!stream) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble-p ${sender}`;
  
  // Clean up [NEEDS_HUMAN] tag from displaying to patient
  let displayText = text;
  let hasEscalated = false;
  if (text.includes('[NEEDS_HUMAN]')) {
    displayText = text.replace('[NEEDS_HUMAN]', '').trim();
    hasEscalated = true;
  }

  bubble.innerHTML = formatMessageText(displayText);
  stream.appendChild(bubble);

  // If bot offered buttons, let's append slot button selector
  if (sender === 'bot' && text.toLowerCase().includes('select a convenient time slot') || text.toLowerCase().includes('available slots:')) {
    // Generate interactive buttons for available slots matching rules
    const slotsHTML = getAvailableSlotsHTML();
    if (slotsHTML) {
      const div = document.createElement('div');
      div.className = 'booking-slots-list';
      div.innerHTML = slotsHTML;
      stream.appendChild(div);
      
      // Bind click handlers to slot selection
      div.querySelectorAll('.booking-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const date = btn.getAttribute('data-date');
          const time = btn.getAttribute('data-time');
          handleSlotSelection(date, time);
        });
      });
    }
  }

  // Auto-scroll
  stream.scrollTop = stream.scrollHeight;

  // Persist conversation to localStorage
  activeMessages.push({ sender, text });
  saveConversationState(hasEscalated);
}

function handleSlotSelection(date, time) {
  appendMessage(`I select the slot: ${time} on ${date}`, 'user');
  
  const loaderId = showTypingIndicator();
  
  // Process Mock Booking
  setTimeout(() => {
    removeTypingIndicator(loaderId);
    
    // Seed new booking
    const bookings = db.getBookings();
    const newBooking = {
      id: 'bk_' + Date.now(),
      patientName: 'Companion (Pet)',
      petType: 'Determined during visit',
      ownerName: petOwnerName,
      ownerPhone: '+1 (555) 000-0000',
      date: date,
      time: time,
      status: 'Confirmed',
      notes: 'Booked via Vet AI Chatbot'
    };
    bookings.push(newBooking);
    db.saveBookings(bookings);
    
    appendMessage(`Excellent! I have successfully secured your booking for **${time} on ${date}**. Dr. Roman Nihal looks forward to seeing you. Let me know if you need anything else!`, 'bot');
  }, 1000);
}

function getAvailableSlotsHTML() {
  const rules = db.getCalendarRules();
  const bookings = db.getBookings();
  
  // Filter slots checking:
  // 1. If date is blocked by calendar rules
  // 2. If slot is already booked
  const freeSlots = AVAILABLE_SLOTS.filter(slot => {
    // Check if day is blocked (rules contains day instruction)
    const blockRule = rules[slot.date];
    if (blockRule && (blockRule.toLowerCase().includes('no') || blockRule.toLowerCase().includes('closed') || blockRule.toLowerCase().includes('block'))) {
      return false; // fully blocked
    }
    
    // Check if slot is booked
    const isBooked = bookings.some(b => b.date === slot.date && b.time === slot.time);
    return !isBooked;
  });

  if (freeSlots.length === 0) return `<p style="font-size: 0.8rem; color: var(--text-tertiary);">No slots currently open online. Please contact clinic office at +1 (555) 019-9988.</p>`;

  return freeSlots.map(s => `
    <button class="booking-slot-btn" data-date="${s.date}" data-time="${s.time}">
      📅 ${s.dayName}, ${s.date} @ ${s.time}
    </button>
  `).join('');
}

function showTypingIndicator() {
  const stream = document.getElementById('chat-body-stream');
  if (!stream) return null;

  const loaderId = 'loader_' + Date.now();
  const loader = document.createElement('div');
  loader.id = loaderId;
  loader.className = 'chat-typing-loader';
  loader.innerHTML = '<span></span><span></span><span></span>';
  stream.appendChild(loader);
  
  stream.scrollTop = stream.scrollHeight;
  return loaderId;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const loader = document.getElementById(id);
  if (loader) loader.remove();
}

async function generateAIResponse(userMessage) {
  const settings = db.getSettings();
  const kb = db.getKnowledgebase();
  
  // Update name if user states their name
  if (userMessage.toLowerCase().includes('my name is ')) {
    const parts = userMessage.split(/my name is /i);
    if (parts.length > 1) petOwnerName = parts[1].trim();
  }

  // If OpenAI API Key is not set, run in Simulation/Mock Mode
  if (!settings.apiKey) {
    return simulateAIResponse(userMessage);
  }

  // Prepare knowledgebase context text
  const kbContent = kb.map(d => `Document Name: ${d.name}\nContent:\n${d.content}`).join('\n---\n');

  // Format Calendar Rules
  const rules = db.getCalendarRules();
  let rulesText = "Doctor's Date Block Rules:\n";
  for (const [date, text] of Object.entries(rules)) {
    rulesText += `- Date ${date}: ${text}\n`;
  }

  // Prepare full chat request payload
  const systemPrompt = `
    ${settings.instructions}
    
    Clinic Services and Knowledgebase Context:
    ${kbContent || 'No additional documents uploaded.'}
    
    Current Clinic Booking State:
    - Today's date is: 2026-07-29.
    ${rulesText}
    
    Available slots for appointments:
    ${AVAILABLE_SLOTS.map(s => `- ${s.dayName}, ${s.date} at ${s.time}`).join('\n')}
    
    IMPORTANT INSTRUCTION:
    1. If the user expresses intent to book an appointment, list the slots that are available, AND you MUST output this exact phrase to trigger the buttons: 'Please select a convenient time slot:' or 'Available slots:'.
    2. If the user asks about something not found in the instructions/knowledgebase, or if the user asks a highly specific medical question (like critical emergency), state politely that a human doctor needs to answer this, and append '[NEEDS_HUMAN]' to the end of your response.
  `;

  // Construct OpenAI payload
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...activeMessages.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI Error:', err);
    // Fall back to simulation mode if API call fails (e.g. network/invalid key)
    return `[Connection Issue] I had trouble connecting to the AI services, so I am running in local backup. ${simulateAIResponse(userMessage)}`;
  }
}

// Simulated replies when OpenAI API key is missing
function simulateAIResponse(msg) {
  const text = msg.toLowerCase();
  
  if (text.includes('chocolate') || text.includes('sick') || text.includes('vomit') || text.includes('emergency')) {
    return "This sounds like an urgent medical concern! Please contact our emergency line or go directly to the clinic. I have flagged this session for Dr. Roman Nihal to review. [NEEDS_HUMAN]";
  }
  
  if (text.includes('book') || text.includes('appointment') || text.includes('schedule') || text.includes('time')) {
    return "Certainly! I can help you secure an appointment. Please select a convenient time slot below:";
  }
  
  if (text.includes('price') || text.includes('pricing') || text.includes('cost') || text.includes('fee')) {
    return "Our standard Consultation starts at $45. Vaccines are $75, and Spay/Neuter ranges from $180-$350. For custom operations, please consult with the doctor. Would you like to book a slot for a checkup?";
  }

  if (text.includes('service') || text.includes('treatment') || text.includes('dental') || text.includes('care')) {
    return "PawCare Pro offers General Checkups, Annual Vaccinations, Spay/Neuter surgery, and Professional Dental Hygiene scaling. Would you like to schedule one of these services?";
  }

  return "Hi there! I am PawCare Pro's assistant. You can ask about our treatments (checkup, vaccine, surgery, dental hygiene), our pricing, or ask me to schedule/book an appointment for you! How can I help you and your pet today?";
}

function saveConversationState(hasEscalated) {
  const conversations = db.getConversations();
  
  // Find or create conversation entry
  let idx = conversations.findIndex(c => c.id === sessionConversationId);
  if (idx === -1) {
    conversations.unshift({
      id: sessionConversationId,
      petOwner: petOwnerName,
      lastActive: new Date().toISOString(),
      flagged: hasEscalated,
      messages: activeMessages
    });
  } else {
    conversations[idx].messages = activeMessages;
    conversations[idx].lastActive = new Date().toISOString();
    if (hasEscalated) {
      conversations[idx].flagged = true;
    }
  }

  db.saveConversations(conversations);
}

function formatMessageText(text) {
  if (!text) return '';
  // Convert markdown bold to HTML bold for nicer UI rendering
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}
