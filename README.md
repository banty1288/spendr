# Spendr

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

Spendr is a modern, mobile-first personal finance application built to help users track expenses, visualize spending habits, and receive AI-driven financial insights. 

The project focuses on delivering a responsive, low-latency user experience through optimistic UI updates, offline-first caching, and a clean interface. It is currently developed as a React single-page application (SPA) with Firebase handling the backend infrastructure.

## Project Overview

Traditional budgeting apps often require heavy manual categorization and lack actionable feedback. Spendr aims to streamline this process by providing a fast transaction logging interface paired with automated AI insights. The application uses the Google Gemini API to analyze user transaction history and provide weekly summaries, identify emotional spending triggers, and suggest actionable savings strategies.

## Core Features

- **Transaction Management**: Fast entry for income and expenses with automatic categorization.
- **AI Financial Insights**: Uses Gemini to generate behavioral spending analysis and weekly financial coaching.
- **Analytics Dashboard**: Interactive charts (Recharts) to visualize cash flow and category breakdowns.
- **Offline-First & Optimistic UI**: Transactions are cached locally via Firestore `persistentLocalCache` and UI updates immediately via TanStack Query `onMutate`.
- **Gamification**: Basic leveling and streak systems to encourage consistent financial tracking.
- **Local Currency Support**: Currently optimized for local currency rendering (₹ INR).
- **Mobile-Responsive**: Designed with a bottom navigation bar and safe-area insets for native-like PWA behavior.

## Tech Stack

**Frontend Framework & Build Tool**
- React 18
- Vite
- TypeScript
- Tailwind CSS

**State Management & Data Fetching**
- TanStack React Query (Server state, caching, optimistic updates)
- Zustand (Global client state, primarily Auth)

**Backend & Infrastructure**
- Firebase Authentication (Email/Password & Google OAuth)
- Cloud Firestore (NoSQL database with local IndexedDB persistence)
- Firebase Web Hosting

**AI & Analytics Integration**
- Google Gemini API (`@google/generative-ai`)

**UI Components**
- Radix UI Primitives
- Recharts (Lazy-loaded for performance)
- Framer Motion (Optimized for micro-interactions)
- Lucide React (Iconography)

## Architecture Overview

Spendr separates concerns by isolating authentication state from application data:

1. **Frontend Flow**: The application is wrapped in a React Query `QueryClientProvider` and a custom `RootLayout`. Routing is handled by React Router. Heavy components (like charts) are code-split and lazy-loaded.
2. **State Pattern**: `useAuthStore` (Zustand) acts as the single source of truth for the active user session. `useTransactions` and `useUserData` (React Query) handle remote data fetching, caching, and optimistic mutations.
3. **Backend Interaction**: Firestore is accessed directly from the client via the Firebase Web SDK. Security rules (deployed via `firestore.rules`) ensure users can only read/write their own documents.
4. **AI Workflow**: AI requests are generated client-side. The app hashes transaction data to create a "fingerprint" and caches the AI response. A new API call to Gemini is only triggered if the fingerprint changes (i.e., new transactions are added).

## Folder Structure

```text
src/
├── app/
│   ├── components/       # Reusable UI elements (nav, cards, modals)
│   ├── screens/          # Page-level components (Home, Transactions, Analytics)
│   ├── App.tsx           # Main application shell
│   └── routes.tsx        # React Router definitions
├── hooks/                # Data fetching and business logic hooks
├── lib/                  # Utilities (Firebase init, i18n, formatting)
├── services/             # External service integrations (AI prompts, parsers)
├── store/                # Zustand stores
├── types/                # TypeScript interfaces and schemas
└── main.tsx              # Application entry point
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Firebase project with Firestore and Authentication enabled
- A Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/banty1614-source/spendr.git
   cd spendr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory using the template below.

   ```env
   # Firebase Configuration (Find these in your Firebase Project Settings)
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Google Gemini API
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Performance & Scalability

- **Optimistic Updates**: Using `onMutate` in React Query, adding or deleting a transaction updates the UI in less than 16ms, masking network latency.
- **Query Limits**: Firestore queries are capped (e.g., `limit(500)`) to prevent memory bloating on devices with extensive transaction histories.
- **Bundle Optimization**: The Vite configuration implements `manualChunks` to isolate `recharts`, `firebase`, and `react` vendors, ensuring the initial Javascript payload remains lightweight.
- **Animation Performance**: Costly `layout` animations in long lists have been replaced with efficient CSS keyframes and hardware-accelerated transforms to maintain 60fps on mid-range mobile devices.

## Security Notes

- **Client-Side Environment Variables**: All environment variables prefixed with `VITE_` are exposed to the browser. Ensure your Firebase API keys are restricted by domain in the Google Cloud Console.
- **Firestore Rules**: Ensure you deploy strict Firestore security rules to prevent unauthorized data access.
- **CSP Headers**: The `index.html` includes a strict `Content-Security-Policy` to mitigate Cross-Site Scripting (XSS) attacks.

## Project Status & Roadmap

Spendr is currently an actively developed MVP. Core functionality (tracking, AI insights, analytics) is stable. 

**Current Priorities:**
- Implement robust unit testing for AI parsing logic and transaction reducers.
- Expand localization beyond the current hardcoded INR formats.
- Transition to a Capacitor-wrapper for native iOS/Android distribution.
- Implement server-side AI evaluation (Cloud Functions) to hide the Gemini API key from the client bundle.

## Screenshots

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://placehold.co/300x600/0a0a14/00d9ff?text=Dashboard+View" alt="Dashboard View Placeholder" width="200" />
  <img src="https://placehold.co/300x600/0a0a14/9d4edd?text=AI+Insights" alt="AI Insights Placeholder" width="200" />
  <img src="https://placehold.co/300x600/0a0a14/00ff88?text=Analytics+Charts" alt="Analytics Charts Placeholder" width="200" />
</div>

> *Note: Replace the placeholder images above with actual application screenshots by uploading them to the repository and updating the `src` paths.*

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Ensure strict TypeScript compilation passes (`npx tsc -b`)
4. Commit your changes (`git commit -m 'feat: add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.

---
Built by Banty.
