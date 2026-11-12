# @repo/marketing (TallyBakery Marketing Website)

The public marketing website and landing pages for TallyBakery.

## Overview

This application serves as the public web presence and marketing portal for TallyBakery:

- **Landing & Feature Showcases**: Highlighting offline-first shift reconciliation, inventory control, and bakery production tracking.
- **Pricing & Subscription Plans**: Presenting tier comparisons and billing options powered by the subscription engine.
- **Customer Acquisition & Onboarding**: Directing bakery owners and managers to signup and business onboarding flows.
- **Brand & Product Documentation**: Public knowledge resources, customer stories, and feature previews.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Optimization**: [React Compiler](https://react.dev/learn/react-compiler) via Babel plugin
- **Linter**: [Oxlint](https://oxc.rs/)
- **Shared Contracts**: `@repo/shared` workspace dependency

## Getting Started

### Development

Run from the monorepo root:

```bash
pnpm dev:marketing
```

Or from this directory:

```bash
pnpm dev
```

### Production Build

Run from the monorepo root:

```bash
pnpm build:marketing
```

Or from this directory:

```bash
pnpm build
```

### Preview

To preview the production build locally:

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Architectural Guidelines & Boundaries

- **Separation of Concerns**: Kept distinct from the internal operational application (`apps/app`) to allow independent release lifecycles, SEO optimization, and lightweight public assets.
- **Shared Types**: Leverages `@repo/shared` for public contracts, subscription plan structures, and error codes where applicable.
