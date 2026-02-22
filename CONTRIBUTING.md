# Contributing to Citronics

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to Citronics. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@nexevent.com](mailto:conduct@nexevent.com).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/citronics.git
   cd citronics
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/NexEvent/citronics.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/NexEvent/citronics/issues) to see if the problem has already been reported.

When creating a bug report, please include:

- **Clear and descriptive title**
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Console errors** or stack traces

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when filing issues.

### Suggesting Features

Feature suggestions are welcome! When suggesting a feature:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed functionality
- **Explain why this feature would be useful** to most users
- **List any alternatives** you've considered

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) when submitting.

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- **`good first issue`** — Simple issues ideal for newcomers
- **`help wanted`** — Issues where we need community help
- **`documentation`** — Help improve our docs

### Pull Requests

1. **Follow the [style guidelines](#style-guidelines)**
2. **Update documentation** if you're changing behavior
3. **Add tests** for new features when applicable
4. **Keep PRs focused** — one feature or fix per PR
5. **Write meaningful commit messages** following our [conventions](#commit-messages)

#### PR Process

1. Ensure your code passes linting: `yarn lint:check`
2. Format your code: `yarn format`
3. Update relevant documentation in `docs/`
4. Fill out the PR template completely
5. Request review from maintainers
6. Address review feedback promptly

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **yarn** (recommended)

### Local Development

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local

# Set up database
psql -U postgres -f schema.sql

# Start development server
yarn dev
```

### Environment Variables

See `.env.example` for required environment variables. Key variables:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |

## Style Guidelines

### JavaScript/React

- Use **functional components** with hooks
- Use **ES6+ syntax** (arrow functions, destructuring, etc.)
- Follow the existing patterns in `src/components/`
- Keep components **small and focused**
- Extract business logic into **custom hooks** or **services**

### File Naming

- **Components**: PascalCase (`EventCard.js`)
- **Hooks**: camelCase with `use` prefix (`useEventFilters.js`)
- **Utilities**: camelCase (`formatDate.js`)
- **Constants**: SCREAMING_SNAKE_CASE in the file

### Code Quality

```bash
# Run ESLint
yarn lint:check

# Format with Prettier
yarn format
```

### Project Conventions

Read the detailed conventions in our documentation:

- [File Structure](docs/file-structure.md)
- [Component Guidelines](docs/components.md)
- [API Conventions](docs/api-conventions.md)
- [State Management](docs/state-management.md)

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |

### Examples

```bash
feat(events): add event duplication feature
fix(calendar): correct timezone handling in date picker
docs(readme): update installation instructions
refactor(auth): simplify token refresh logic
```

## Documentation

### When to Update Docs

- Adding new features or components
- Changing existing behavior
- Adding new dependencies
- Modifying environment variables

### Where to Document

| What | Where |
|------|-------|
| Public API changes | `docs/api-conventions.md` |
| New components | `docs/components.md` |
| Database changes | `docs/database.md` & `schema.sql` |
| State management | `docs/state-management.md` |
| Setup changes | Root `README.md` |

---

## Questions?

- Check existing [issues](https://github.com/NexEvent/citronics/issues) and [discussions](https://github.com/NexEvent/citronics/discussions)
- Join our community chat (coming soon)
- Email the maintainers

## Recognition

Contributors are recognized in our README and release notes. Thank you for helping make Citronics better! 🚀
