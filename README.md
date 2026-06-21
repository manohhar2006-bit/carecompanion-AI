# CareBridge AI

CareBridge AI is an AI-powered elder care and medication management platform designed to help elderly patients and their caregivers stay on top of medicine schedules. By combining modern AI vision capabilities with browser speech features, the platform enables seamless uploading of physical doctor prescriptions, translates them into precise medicine reminders with customizable timeslots, and reads out clear, friendly voice alerts in natural female voices.

## Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manohhar2006-bit/carecompanion-AI.git
   cd carecompanion-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment configuration to create your local environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Open the `.env.local` file and add your real API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Key Dependencies

- **Framework & Language**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Prescription OCR**: Google Gemini Vision API (gemini-2.5-flash)
- **Voice Reminders**: Browser Web Speech API (SpeechSynthesis)

## What's Real vs. Simulated

To help you understand the current capabilities of the application:

- **Prescription OCR (Real)**: Uses the live Google Gemini Vision API (gemini-2.5-flash) to extract medication details, dosages, frequencies, and duration directly from uploaded prescription images.
- **Voice Reminders (Real)**: Uses the browser's native Speech Synthesis API to read out personalized care reminders using the clearest and most friendly female voice available.
- **Caregiver SMS & Phone Alerts (Simulated)**: Notifications and call alerts sent to caregivers are simulated in-app on the Caregiver Dashboard. There is currently no active Twilio or telecom carrier integration.
- **Persistence (Simulated)**: Application data (such as patients, scheduled medicines, and reminder configurations) is persisted directly in the browser's `localStorage`. No backend database is connected.
