# MindGlow (मनGlow) — AI Exam Mental Wellness Companion

MindGlow is a premium, interactive, and Gen Z-friendly mental wellness companion designed for students in India preparing for board exams and competitive entrance tests (like JEE, NEET, UPSC, Board exams, CAT, GATE, etc.). 

By analyzing mood vibe checks, text entries, and voice reflections using the Gemini API, MindGlow helps students track emotional well-being, identify academic stress triggers, and practice immediate, engaging coping mechanisms.

---

## 🚀 Live Links
* **Live Web App**: [https://prompt-wars-mindglow.vercel.app](https://prompt-wars-mindglow.vercel.app)
* **GitHub Repository**: [https://github.com/harshvardhan7737/prompt-wars-mindglow](https://github.com/harshvardhan7737/prompt-wars-mindglow)

---

## ✨ Features
1. **Daily Vibe Check**: Quick selection of current mood state (Slay, Vibe, Mid, Down Bad, Panik) with accessible ARIA tags.
2. **Text & Voice Journal**: Students can type thoughts or tap to transcribe speech using the browser-integrated Web Speech API. Includes shortcut preset concerns derived from Indian student struggles.
3. **AI Stress Insights**: Calls the `gemini-2.5-flash` model to analyze inputs and extract emotional state summaries, stress levels, confidence levels, burnout risks, stress triggers, and custom study break recommendations.
4. **Glow Log History**: Saved locally in `LocalStorage` with dashboard statistics (Total checks, dominant mood, average stress).
5. **Interactive Guided Breathing**: Custom 60-second box breathing simulator (4s Inhale, 4s Hold, 4s Exhale) with responsive scaling visual indicator rings.
6. **Stress Pop-it Game**: Satisfying interactive 16-bubble pop-it grid to quickly release tension from long hours of study.
7. **Mindset Coping Cards**: Quick recovery strategies for test scores, backlog management, and exam eve sleep habits.

---

## 🛠️ Tech Stack & Architecture
* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript.
* **Backend**: Next.js API route (`/api/analyze`) handling input validations and payload sanity parsing.
* **AI Service**: Google Generative AI SDK (`@google/generative-ai`) calling `gemini-2.5-flash`.
* **Testing**: Jest, JSDOM, `@testing-library/react` (4 unit tests, 100% coverage).
* **Styling**: Light mode, pastel glassmorphism elements, custom breathing and recording microphone animation keyframes.

---

## 🔒 Security & Accessibility best practices
* **Error Masking**: Replaces raw server-side stack traces with friendly user messages during API failures.
* **Input Sanitization**: Rejects malformed requests (missing mood, empty reflection strings) with clear `400 Bad Request` responses.
* **A11y (Accessibility)**: Uses semantic HTML5 layout wrappers (`<header>`, `<main>`, `<section>`), links labels to input controls via matching IDs, provides descriptive image attributes, and adds `aria-label` screen reader tags to all buttons.

---

## ⚙️ Local Setup Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harshvardhan7737/prompt-wars-mindglow.git
cd prompt-wars-mindglow
npm install
```

### 2. Configure Environment Key
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Running Automated Tests
To run unit tests verifying rendering and API mocks:
```bash
npm run test
```

---

## 🚀 Deployment Instructions
The application is pre-configured for one-click Vercel deployments. Ensure the `GEMINI_API_KEY` is loaded under Environment Variables in the project settings dashboard on Vercel.
