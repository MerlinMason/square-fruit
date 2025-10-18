# Square Fruit

A kawaii-styled mathematics game designed for children (ages 7+). Players match pairs of numbers on a grid to solve target equations, progressively revealing colorful reward images.

## Game Overview

Square Fruit teaches arithmetic through an engaging puzzle mechanic:
- Configure operation mode (addition, subtraction, multiplication, or mixed)
- Select board size (4×4 to 10×10) and number range (1-100)
- Match two numbers from the grid to satisfy target equations
- Complete games to unlock reward images in your collection

Built with the [T3 Stack](https://create.t3.gg/) for type-safe, full-stack development.

## Tech Stack

### Core Framework
- **Next.js 15.2.3** - React 19, App Router, Turbopack dev server
- **TypeScript 5.8.2** - Strict mode with comprehensive type safety
- **Bun** - Fast package manager and runtime

### Frontend
- **React 19** with Server Components
- **Tailwind CSS 4.0** - Utility-first styling with custom kawaii theme
- **shadcn/ui** - Accessible component primitives
- **usehooks-ts** - LocalStorage persistence for game state

### Backend (Infrastructure)
- **tRPC 11.0** - End-to-end type-safe API layer
- **Drizzle ORM 0.41** - PostgreSQL database toolkit
- **NextAuth 5.0** - Authentication (Discord provider configured)
- **Zod 3.24** - Runtime schema validation

### Tooling
- **Biome 1.9** - Unified linting and formatting (replaces ESLint/Prettier)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
