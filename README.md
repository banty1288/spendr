# Spendr

Spendr is a personal finance and expense management web application designed to help users track their spending, manage budgets, and gain financial insights. It integrates AI-powered analysis to provide contextual recommendations and simplify financial planning.

## Key Features

* **Intelligent Bill Splitting**: Create customized splits via manual entry, percentage-based splits, or itemized selections with real-time settlement tracking.
* **AI Receipt Smart Scan**: Instantly parse and auto-assign line items from physical receipts or invoices using multimodal AI.
* **Groups & Settlements Dashboard**: Manage individual and group balances in a unified Settlement Center, complete with payment histories.
* **Expense tracking**: Log and categorize daily transactions.
* **Budget planning**: Set and monitor spending limits across different categories.
* **Financial insights**: View analytics and trends to understand spending behavior.
* **Financial wellness tools**: Track financial habits and goals.
* **News and financial tips**: Access relevant financial news and daily insights.
* **AI-powered assistance**: Use Gemini AI via text or voice for contextual financial advice and transaction analysis.

---

## AEGIS Intelligence Layer

### What is AEGIS?

AEGIS (AI Economic & Global Intelligence System) is the market intelligence and risk analysis engine being developed alongside Spendr. 

It continuously analyzes:
- Global commodity markets
- Inflation trends
- Interest rate movements
- Economic indicators
- Geopolitical developments
- Financial news and market sentiment

Its purpose is to convert complex macroeconomic signals into actionable financial intelligence.

### Why Spendr Needs AEGIS

Most personal finance applications focus on historical data. They answer:
- Where money was spent
- How much was saved
- What investments were made

However, they rarely answer:
**"How will future economic events affect my financial life?"**

Spendr is being built to solve both problems. It helps users manage their finances today while preparing them for tomorrow. AEGIS enables that future-focused intelligence.

### The Spendr + AEGIS Ecosystem

**Spendr** focuses on:
- Expense Management
- Budgeting
- Goal Tracking
- Bill Splitting
- Savings Optimization
- Financial Wellness
- Personal Financial Insights

**AEGIS** focuses on:
- Market Intelligence
- Commodity Analysis
- Inflation Monitoring
- Economic Forecasting
- Black Swan Detection
- Risk Assessment
- Scenario Simulation

Together they create a unified platform that understands both **Personal Finance** and **Global Economic Conditions**.

### Future Features Powered by AEGIS

#### Financial Weather Forecast
Provide users with a simple outlook of upcoming financial conditions.
*Examples: Fuel costs expected to rise, Food inflation increasing, Interest rates likely to change, Market volatility increasing.*

#### Life Impact Engine
Translate macroeconomic events into personal financial consequences.
*Example: Global Event: Crude oil prices increase significantly. Spendr Insight: "Based on your spending patterns, transportation costs may increase by approximately 10–15% over the next two months."*

#### Goal Protection System
Monitor financial goals and assess how economic changes may impact progress.
*Examples: Buying a car, Purchasing a home, Building an emergency fund, Achieving investment targets.*
AI can recommend adjustments before goals are affected.

#### Personal Risk Intelligence
Provide proactive warnings about potential financial risks.
*Examples: Inflation pressure, Economic slowdowns, Commodity shocks, Credit tightening, Recession indicators.*

#### AI Scenario Simulator
Allow users to explore hypothetical situations.
*Examples: What happens if inflation reaches 8%? What if fuel prices rise by 20%? What if interest rates increase again?*
The platform generates personalized impact assessments.

### Long-Term Vision

Spendr is evolving beyond a budgeting application. The long-term vision is to create an AI-native Financial Operating System that combines personal financial management with real-time economic intelligence.

Instead of only answering *"Where did my money go?"*, Spendr will help users answer *"What should I do today to prepare for tomorrow?"*

AEGIS serves as the intelligence layer that makes this possible.

---

## Tech Stack

**Frontend:**
* React
* Vite
* TypeScript
* Tailwind CSS
* Framer Motion (Animations)

**Backend:**
* Firebase Authentication
* Cloud Firestore (Database)
* Firebase Cloud Functions
* Vercel Serverless Functions (API)

**AI Integration:**
* Google Gemini API (REST and WebSockets for Voice)

## Installation

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/banty1614-source/spendr.git
   cd spendr
   ```

2. Install dependencies (using pnpm workspaces):
   ```bash
   npm install -g pnpm
   pnpm install
   ```

### Environment Variables

Copy the provided environment template from the infrastructure directory and populate it with your Firebase and Gemini credentials:

```bash
cp infrastructure/.env.example frontend/.env.local
```

Ensure the following variables are set:
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_PROJECT_ID`
* `GEMINI_API_KEY` (Required for the Vercel Serverless Function proxy)
*(See `.env.example` for the full list of required variables).*

### Development

To start the local development server:

```bash
pnpm run dev
```

This will run the Vite frontend development server on `http://localhost:5173`.

### Build

To compile the application for production:

```bash
pnpm run build
```

## Project Structure

This repository uses a monorepo structure with four primary domains:

* `frontend/`: Contains the React/Vite web application, components, and user interface logic.
* `backend/`: Contains server-side API endpoints, Firebase Cloud Functions, and business logic.
* `infrastructure/`: Contains deployment configurations (`firebase.json`, `vercel.json`), security rules, CI/CD workflows, and environment templates.
* `docs/`: Contains architectural documentation, design guidelines, and contribution rules.

## Architecture & Security Overview

Spendr relies on a serverless architecture. The React frontend communicates directly with Firebase for authentication and database operations via the client SDK. Computationally heavy or secure operations are handled via Vercel Serverless APIs (`/api`) and Firebase Cloud Functions (`backend/functions`). 

                    AEGIS
      (Economic & Market Intelligence Engine)
                              │
                              ▼
 ┌─────────────────────────────────────────┐
 │                 SPENDR                  │
 ├─────────────────────────────────────────┤
 │ Expense Management                      │
 │ Budgeting                               │
 │ Goal Tracking                           │
 │ Bill Splitting                          │
 │ Savings Optimization                    │
 │ Financial Wellness                      │
 │ AI Insights                             │
 └─────────────────────────────────────────┘
                              │
                              ▼
                 Personalized Financial Decisions

**Security Features:**
* **API Key Protection:** The Google Gemini API is accessed securely through a Vercel Serverless Function proxy (`api/generate.ts`), preventing client-side exposure of API keys.
* **Strict Data Boundaries:** Advanced Firestore rules enforce strict IDOR prevention and explicitly reject unauthenticated attempts to alter balance or profile state.
* **Prompt Injection Prevention:** The AI modules execute rigorous client and server-side text sanitization to protect structured generation paths.

## Deployment

**Vercel (Frontend & Serverless APIs):**
When deploying to Vercel, set the **Root Directory** to the repository root if you are using the Vercel API routing, or configure Vercel to build the `frontend` workspace.

**Firebase (Database & Functions):**
Use the deployment scripts provided in the root `package.json`:
```bash
pnpm run deploy:firebase
```

## Known Limitations

* Voice assistance relies on modern browser WebSockets and microphone permissions.
* The application currently requires a Firebase project for authentication and data storage; it cannot run fully offline.
* Real-time bill splitting sync requires active internet connections and Firebase listener quotas.

## Contributing

Please refer to `docs/CONTRIBUTING.md` and `docs/Guidelines.md` for coding standards, pull request processes, and architectural boundaries.

---

**Spendr is the Financial Operating System. AEGIS is the Intelligence Engine. Together they form a next-generation AI-powered Financial Intelligence Platform designed to help individuals understand, manage, and anticipate the future of their financial lives.**

## License

MIT License
