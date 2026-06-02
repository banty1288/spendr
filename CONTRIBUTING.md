# Contributing to Spendr

First off, thank you for considering contributing to Spendr! It's people like you that make open-source software such a great community.

## Code of Conduct
By participating in this project, you are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs
Bugs are tracked as GitHub issues. When creating an issue, please explain the problem and include additional details to help maintainers reproduce the problem:
- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps.**

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement issue, please include:
- **A clear and descriptive title**.
- **A step-by-step description of the suggested enhancement** in as many details as possible.
- **Specific examples to demonstrate the steps.**
- **Why this enhancement would be useful** to most Spendr users.

### Pull Requests
The process described here has several goals:
- Maintain Spendr's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Spendr
- Enable a sustainable system for Spendr's maintainers to review contributions

**Please follow these steps to have your contribution considered by the maintainers:**
1. Fork the repo and create your branch from `main`.
2. Name your branch appropriately (e.g., `feature/awesome-new-thing` or `fix/annoying-bug`).
3. If you've added code that should be tested, add tests.
4. Ensure the test suite passes (`pnpm run test` if configured).
5. Ensure your code passes standard linting (`pnpm run lint`).
6. Issue that pull request!

## Styleguides

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Styleguide
- All new code must be written in TypeScript.
- Avoid the use of `any` whenever possible. Define rigorous interfaces.
- Prefer React functional components and Hooks.

## Development Setup
Please refer to the Installation & Setup guide in the [README.md](./README.md) to get a local development environment running.
