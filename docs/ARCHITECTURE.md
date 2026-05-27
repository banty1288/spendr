# Spendr Architecture

This document provides a high-level overview of the Spendr application architecture.

## System Overview

Spendr is a modern Single Page Application (SPA) built with React and deployed on serverless infrastructure. It utilizes a Backend-as-a-Service (BaaS) architecture primarily powered by Firebase.

### High-Level Components

1. **Client Application (Frontend)**
   - **Framework:** React 18 + Vite
   - **Routing:** React Router 7
   - **State Management:**
     - **Zustand:** For global client UI state (e.g., theme, sidebar toggles).
     - **React Query:** For server state synchronization (fetching, caching, and updating Firestore data).
   - **UI Library:** Tailwind CSS, Radix UI primitives, and Shadcn UI patterns.
   - **Mobile:** Configured for Capacitor to allow cross-platform native builds.

2. **Backend Services (Firebase)**
   - **Authentication:** Firebase Auth handles user identity.
   - **Database:** Cloud Firestore (NoSQL) stores user profiles, transactions, and gamification state.
   - **Storage:** Firebase Storage (if needed for receipt uploads/avatars).
   - **Security Rules:** `firestore.rules` define tight access control ensuring data isolation per user.

3. **AI Services**
   - **Google Generative AI (Gemini):** Used to process user transaction history and generate personalized behavioral insights, impulse spending awareness, and coaching.

## Data Flow

1. **User Action:** User logs a transaction in the UI.
2. **Optimistic Update:** React Query optimistically updates the UI.
3. **Database Write:** The app communicates directly with Firestore via the Firebase JS SDK to persist the transaction.
4. **AI Processing:** Periodically, or on-demand, transaction history is bundled and sent to the Gemini API to generate updated financial insights. These insights are then cached locally or in Firestore to minimize API calls.

## Directory Structure

- `src/app/`: Contains the main page layouts and routing definitions.
- `src/hooks/`: Custom React hooks for shared logic (e.g., `useTransactions`, `useAuth`).
- `src/services/`: Wrappers around external APIs (Firebase setup, Gemini API client).
- `src/store/`: Zustand definitions for client-side state.
- `src/components/` : Shared UI components and Shadcn UI components.

## Deployment Strategy

- **Frontend:** Vercel automatically builds and deploys the application. Vercel acts as a CDN for static assets.
- **Backend Rules:** Firebase rules are deployed via GitHub Actions or manual CLI commands (`npm run deploy:rules`).
