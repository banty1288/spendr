# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Firebase Functions Migration**: Ported all Vercel Serverless APIs to native Firebase Functions (`generateInsight`, `getPersonalizedFeed`, `generateBudget`, `logReward`, `getVoiceToken`).
- **Comprehensive Documentation**: Added README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, and CHANGELOG to establish a production-ready open source structure.
- **Upstash Redis Throttling**: Added a robust distributed rate limiter for reward generation via Upstash Redis to prevent client-side farming.

### Changed
- Refactored `useAIBudget`, `useNews`, `useVoiceAssistant`, and `rewards` hooks to use Firebase `httpsCallable` instead of direct HTTP calls, securing the endpoints with strict Firebase Authentication rules.
- Stripped all `vercel.json` configurations and established `firebase.json` as the definitive master configuration for Hosting, Functions, Firestore, and Storage.
- Standardized package manager across the repository to `pnpm`, completely removing `package-lock.json`.

### Removed
- **Vercel API Layer**: Completely removed the `/api` and `/backend/api` directories.
- Removed obsolete scratch files (`user_messages.txt`, `default_shadcn_theme.css`, `models.json`).

## [1.0.0] - 2026-06-01

### Added
- **Initial Release**: Core functionality for Spendr including Smart Expense Tracking, Group Settlements, Debt Simplification, AI Assistant (Aoede), Gamification, and UPI integration.
- Configured Firebase Authentication, Firestore, and Storage with baseline security rules.
- Designed comprehensive UI layout using Shadcn and Tailwind CSS.
