# Spendr

Spendr is a modern, AI-powered personal finance tracker designed for speed, simplicity, and actionable insights. Built with React, Firebase, and Google Gemini, it acts as your personal gamified financial advisor.

## 🚀 Live Links

- **Production App**: [https://spendr-app-85a7b.web.app](https://spendr-app-85a7b.web.app)
- **AI Backend (Vercel)**: [https://spendr-main.vercel.app](https://spendr-main.vercel.app)

## 📖 App Workflow

1. **Authentication & Onboarding**: 
   - Sign up using Email/Password or Google via Firebase Auth.
   - Complete a quick onboarding flow to establish your financial identity, goals, and challenges.

2. **Home Dashboard**: 
   - View your total net balance, income, and expenses at a glance.
   - See a dynamically generated "Health Score" based on your spending habits.
   - Swipe through bite-sized, AI-generated insights based on your recent activity.

3. **Transaction Tracking**: 
   - Add new transactions (Income or Expense) seamlessly via the bottom sheet.
   - All monetary values are strictly formatted in Indian Rupees (INR ₹).
   - Filter, sort, and analyze your transaction history visually using category pie charts and monthly bar charts.

4. **AI-Powered Analytics**: 
   - Tap into the AI Insights page for a deep dive into your finances.
   - The app securely sends an anonymized fingerprint of your transactions to our Vercel Serverless Backend, where Google Gemini analyzes your behavior and suggests specific, actionable strategies to save money.

5. **Gamification & Savings**: 
   - Set specific, tracked savings goals (e.g., "Emergency Fund").
   - Earn XP (Experience Points) and level up your financial profile just by practicing good habits like logging expenses.
   - Unlock achievement badges for hitting milestones.

## 🛠️ Architecture Setup

- **Frontend**: React + Vite + TailwindCSS + Zustand + Framer Motion.
- **Backend / AI Proxy**: Vercel Serverless Functions (`api/generateInsight.ts`).
- **Database**: Firebase Firestore (NoSQL).
- **Storage**: Firebase Storage (Profile images are compressed client-side to `.webp` before upload).
- **State Sync**: `@tanstack/react-query` handles aggressive caching and optimistic UI updates for instant interaction feedback.
