# Contributing to Spendr

First off, thank you for considering contributing to Spendr! It's people like you that make open-source tools better for everyone.

## Where to Start

- **Bug Reports:** If you find a bug, please open an issue. Include as much detail as possible (OS, browser, steps to reproduce).
- **Feature Requests:** Have an idea to make Spendr better? Open an issue with the tag `enhancement` and describe your idea.
- **Pull Requests:** We welcome PRs for bug fixes, new features, and documentation improvements.

## Development Setup

1. Fork the repository.
2. Clone your fork locally.
3. Install dependencies: `npm install` or `pnpm install`
4. Copy `.env.example` to `.env.local` and add your Firebase/Gemini keys.
5. Create a new branch: `git checkout -b feature/your-feature-name`
6. Run the dev server: `npm run dev`

## Coding Guidelines

- **TypeScript:** We use TypeScript. Please ensure your code is properly typed.
- **Components:** Use functional components and React Hooks.
- **Styling:** We use Tailwind CSS and Shadcn UI. Try to utilize existing utility classes and components before writing custom CSS.
- **State:** Use Zustand for global UI state and React Query for server data fetching.
- **Linting:** Run `npm run lint` before committing to ensure your code matches our style guide.

## Pull Request Process

1. Ensure any new dependencies added are actually required.
2. Update the README.md or docs if you change any interface, add new environment variables, or update the architecture.
3. Keep your PR scope as tight as possible. Create separate PRs for unrelated changes.
4. Once your PR is submitted, it will be reviewed by a maintainer. We may request changes before it can be merged.

Thank you for contributing!
