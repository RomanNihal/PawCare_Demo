# 🐾 PawCare Pro - Small Animal Veterinary Clinic

A premium, state-of-the-art veterinary clinic web application built for **Dr. Roman Nihal's Small Animal Clinic**. Featuring rich visual aesthetics, modern design patterns, interactive clinic tools, and a seamless client experience.

🔗 **Live Demo**: [https://romannihal.github.io/PawCare_Demo/](https://romannihal.github.io/PawCare_Demo/)

---

## ✨ Features

### 🌟 Client Experience & Landing Page
- **3D Pop-out Gallery**: Layered, white-bordered capsules and circles that project high-resolution transparent pet portraits into the third dimension, complete with dynamic hover animations.
- **Infinite Looping Testimonials**: A custom CSS flex-marquee that loops user testimonials seamlessly with zero jumps, pixel mismatches, or timing gaps on all viewport sizes.
- **Responsive Layout**: Designed from the ground up with elegant navy blue (`#2e3a59`) and warm peach (`#e8a87c`) styling on a clean light theme.
- **Stroke Vector Icons**: Clean, professional outline SVG vector icons used consistently throughout the application (no emojis or generic shapes).

### 🏥 Doctor Portal & Clinic Dashboard
- **Executive Analytics**: Clean visualization of patient registration growth, revenue, and diagnostic distribution utilizing Chart.js.
- **Patient Management System**: A search-and-filter enabled list of active pet records, tracking breeds, diagnostic history, statuses, and custom medical actions.
- **Interactive Booking Calendar**: A color-coded calendar showing upcoming diagnostic, checkup, and surgery slots.
- **Live Chat Desk**: Portal to monitor flagging chatbot conversations and review logs of AI assistant bookings.
- **Knowledge Base & Clinical Settings**: Panel to customize the clinic's digital templates and automated chatbot scripts.

---

## 🛠️ Technology Stack
- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom variables, responsive grids, and transitions).
- **Interactions**: Vanilla Modern ES6+ JavaScript.
- **Charts**: [Chart.js](https://www.chartjs.org/) library.
- **Icons**: Clean SVG vector paths.

---

## 🚀 How to Run Locally

Since this is a fully static website, you do not need to install complex databases or frameworks. You can run it instantly using any local web server:

### Option A: Python (Quickest)
Open a terminal in the project directory and run:
```bash
python -m http.server 8080
```
Then visit: `http://localhost:8080/` in your web browser.

### Option B: Node.js (http-server)
If you have Node.js installed, you can use the static server utility:
```bash
npx http-server -p 8080
```
Then visit: `http://localhost:8080/` in your web browser.
