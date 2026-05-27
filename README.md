<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/sparkles.svg" width="60" height="60" alt="Spendr Icon" />
  <h1>Spendr</h1>
  <p><strong>AI-Powered Personal Finance Companion</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 Product Overview

**Spendr** is a premium, AI-first financial companion designed to help you track, understand, and master your money. 

Unlike traditional finance trackers that simply display static charts, Spendr acts as your personal financial coach. By leveraging state-of-the-art AI, it deeply analyzes your spending patterns, identifies emotional spending triggers, and provides proactive, hyper-personalized coaching to improve your financial health. Our mission is to transform anxiety-inducing budgeting into an engaging, gamified, and effortlessly smooth experience.

## ✨ Features

- **🧠 AI Financial Insights:** Deep behavioral analysis powered by Gemini AI to uncover hidden spending patterns.
- **💰 Expense & Income Tracking:** Seamless logging of transactions with category management.
- **📊 Smart Analytics:** Interactive, beautiful visualizations for monthly summaries and trends.
- **⚡ Real-time Updates:** Optimistic UI rendering for zero-latency interactions.
- **🌍 Currency Support:** Complete support for local currency rendering (₹ INR).
- **📱 Mobile-First Design:** Fully responsive, native-feeling progressive web app with safe-area optimizations.
- **🔒 Secure Authentication:** Multi-provider authentication via Firebase.
- **🎨 Profile Customization:** Personalized avatars and dark/light/system theme toggles.
- **🎮 Gamification:** Financial levels, streaks, and achievements to reward good financial habits.
- **🚀 Fast UI/UX:** Heavily optimized for mobile devices with minimal re-renders and smooth micro-animations.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, TypeScript, Zustand, TanStack Query |
| **Backend / DB** | Firebase, Firestore, Firebase Auth |
| **AI Integration** | Google Gemini API (AI Studio) |
| **Deployment** | Firebase Web Hosting, Capacitor (Android) |
| **Charts & UI** | Recharts, Lucide Icons, Framer Motion |

---

## 📐 Architecture Overview

- **Frontend Flow:** Built on React and Vite, utilizing TanStack Query for robust data fetching, caching, and optimistic UI updates, while Zustand manages global auth state.
- **Backend Flow:** Firestore serves as the primary NoSQL database, leveraging the `persistentLocalCache` API for offline-first capabilities and lightning-fast local reads.
- **AI Integration Workflow:** Transaction data is hashed and mapped securely before being processed by Gemini AI. Caching mechanisms prevent redundant API calls, and outputs are strictly parsed into actionable UI components.
- **Authentication Process:** Firebase Authentication handles secure login states (Google/Email). Protected routes intercept unauthenticated traffic and manage the onboarding flow seamlessly.

---

## 📂 Folder Structure

```text
src/
├── app/
│   ├── components/       # Reusable UI components (charts, modals, nav)
│   ├── screens/          # Core page views (Home, Analytics, Setup)
│   └── routes.tsx        # React Router configuration
├── hooks/                # Custom React hooks (useTransactions, useGeminiInsights)
├── lib/                  # Configurations and utilities (Firebase, analytics, i18n)
├── services/             # API gateways and specialized logic (AI, rewards)
├── store/                # Zustand global state (authStore)
├── types/                # TypeScript interfaces and schema definitions
└── main.tsx              # Application entry point
```

---

## 🚀 Installation Guide

### Prerequisites
Ensure you have `Node.js` (v18+) and `npm` installed.

### 1. Clone the repository
```bash
git clone https://github.com/banty1614-source/spendr.git
cd spendr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env.local
```

### 4. Run development server
```bash
npm run dev
```

### 5. Production build
```bash
npm run build
```

---

## 🔐 Environment Variables Section

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Integration
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## ⚡ Performance Optimizations

Spendr is built for speed and efficiency:
- **Code Splitting & Lazy Loading:** Heavy dependencies like Recharts are lazy-loaded to keep the initial bundle size minimal.
- **Optimized Rendering:** Eliminated layout thrashing and implemented strict React `memo` boundaries.
- **Optimistic UI:** Database writes reflect instantly on the UI without waiting for server round-trips.
- **Reduced API Calls:** Intelligent caching (TanStack Query) and data hashing prevent duplicate AI context generation.
- **CSS Animations:** Hardware-accelerated CSS animations replace expensive JavaScript frame loops for buttery-smooth performance.

---

## 🛡️ Security Practices

- **Secure Authentication:** JWT-based session management through Firebase Auth.
- **Data Validation:** Strict TypeScript schemas ensure data integrity across the pipeline.
- **Protected Routes:** Unauthorized access is aggressively redirected at the router level.
- **Environment Protection:** Secrets are never exposed to the client bundle without the `VITE_` prefix, and production environments restrict API key domains.

---

## 🧗 Challenges Faced

Building a premium AI finance app came with realistic startup hurdles:
- **Latency Optimization:** Traditional React animations caused frame drops on mid-range Android devices. Solved by replacing them with optimized CSS keyframes and removing heavy `layout` props.
- **AI Accuracy & Determinism:** LLMs are inherently non-deterministic. We solved this by strictly typing the AI prompt instructions and building robust fallback parsers.
- **State Synchronization:** Keeping offline storage, React Query caches, and Firestore perfectly synced required a sophisticated optimistic update architecture.

---

## 🗺️ Future Roadmap

- [ ] **AI Budgeting Assistant:** Dynamic budget adjustments based on real-time spending.
- [ ] **Smart Savings Goals:** Automated transfers and goal tracking.
- [ ] **OCR Receipt Scanning:** Extract items from images instantly.
- [ ] **Voice Expense Logging:** "I just spent ₹500 on coffee."
- [ ] **Predictive Analytics:** Forecasting end-of-month balances.
- [ ] **Bank Integrations:** Plaid/Teller support for automatic syncing.
- [ ] **AI Money Personality System:** Dynamic leveling based on unique spending quirks.
- [ ] **Native Mobile App:** Capacitor-wrapped iOS/Android releases.

---

## 📸 Screenshots

*(Add screenshots here)*
| Home Dashboard | AI Insights | Analytics |
| :---: | :---: | :---: |
| `[Screenshot 1]` | `[Screenshot 2]` | `[Screenshot 3]` |

---

## 🤝 Contributing

Contributions are always welcome! 

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with passion by <strong>Banty</strong></p>
</div>
