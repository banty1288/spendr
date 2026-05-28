# 💸 Spendr

Spendr is a production-grade, AI-powered financial tracking application. Built with modern web architecture, Spendr goes beyond simple budgeting by leveraging Google's Gemini AI to analyze your spending habits, discover your "Money Personality", and generate personalized weekly coaching reports.

---

## 🏗 Architecture & Stack

Spendr utilizes a highly scalable, decoupled serverless architecture:

*   **Frontend:** React 18, Vite, React Router v7. Styled with TailwindCSS and Radix UI primitives.
*   **State Management:** Hybrid approach. Zustand for global synchronous state (Authentication), and `@tanstack/react-query` for heavily cached, asynchronous server state.
*   **Authentication & Database:** Firebase Auth & Firestore (NoSQL).
*   **AI Backend:** Vercel Serverless Edge Functions (`/api/generateInsight`) securely acting as a proxy to the Gemini API.

## 🛡️ Security Posture

Spendr is engineered with enterprise-level security concepts:

*   **Strict Client-Side Trust:** Granular Firestore Rules enforce strict field-level validation. Clients cannot arbitrarily modify protected fields such as `subscription` or `isPro`.
*   **Zero Exposure Architecture:** AI API keys are never exposed to the client. All AI generation is routed through a secure backend proxy.
*   **Distributed Rate Limiting:** The Vercel API utilizes Upstash Redis for distributed, IP-based, and UID-based rate limiting to prevent Denial of Wallet attacks.
*   **Payload Validation:** Incoming API requests are strictly sanitized and typed using Zod to prevent prompt injection and payload stuffing.

## ✨ Features

*   **⚡ Lightning Fast:** Aggressive code-splitting via Rollup `manualChunks`, lazy-loaded routes, and `staleTime` React Query caches.
*   **🤖 AI Financial Insights:** Secure, backend-proxied AI generation that analyzes your specific transactions and provides actionable advice.
*   **🎮 Gamification:** Unlock badges and achievements as you hit savings goals.
*   **🌓 Adaptive UI:** Full light/dark mode support with fluid micro-animations using Framer Motion.

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Firebase Account
*   Google Gemini API Key
*   Upstash Redis Account (for production rate-limiting)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spendr.git
   cd spendr
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Setup:
   Copy `.env.example` to `.env.local` and fill in your Firebase details.
   *(Note: Do not put your Gemini API key in the frontend `.env.local`. Set it in your backend environment).*
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment Guide

Spendr is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Ensure the Framework Preset is set to **Vite**.
3. In Vercel Environment Variables, configure the following:
   * `GEMINI_API_KEY` (Required for AI features)
   * `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` (Required for API rate limiting)
   * `VITE_FIREBASE_API_KEY` (and corresponding Firebase vars)
4. Deploy! Vercel will automatically read `vercel.json` to enforce strict Security headers (HSTS, XSS Protection) and cache immutable assets at the edge.

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
