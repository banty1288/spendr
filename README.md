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
* `VITE_GEMINI_API_KEY`
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

## Architecture Overview

Spendr relies on a serverless architecture. The React frontend communicates directly with Firebase for authentication and database operations via the client SDK. Computationally heavy or secure operations are handled via Vercel Serverless APIs (`backend/api`) and Firebase Cloud Functions (`backend/functions`). AI features are driven by direct client-to-API integrations with Google's Gemini models for real-time responsiveness.

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

## License

MIT License
