# System Patterns & Architecture

## Domain Context
- **Core Product** : Context of the product to be added.

## Core Tech Stack
- **Monorepo**: Turborepo with `pnpm` workspaces.
- **Frontend (`apps/web`)**: React (Vite), Zustand, TanStack Query. Runs on Port 3000.
- **Backend (`apps/api`)**: Node.js, Express, Prisma ORM, PostgreSQL. Runs on Port 3001.
- **Validation**: Zod (Shared in `packages/common`).

## Architecture Rules
1. **Vertical Slices**: Code is organized by feature (e.g., `apps/api/src/modules/quizzes`).
2. **Shared Logic**: Validation schemas and core interfaces must live in `packages/common/src/schemas`.
3. **Database Rules**: All DB logic lives in `packages/database/prisma/schema.prisma`. 
4. **Type Isolation**: `apps/web` must NEVER import `PrismaClient`.

## Directory Structure Blueprint
The agent must strictly adhere to this monorepo file structure when generating new features:

```text
/
├── apps/
│   ├── api/                        # Node.js/Express Backend (Port 3001)
│   │   ├── src/
│   │   │   ├── config/             # Environment validation
│   │   │   ├── middleware/         # Express middlewares
│   │   │   └── modules/            # Domain-driven slices (e.g., /auth, /jobs)
│   │   └── package.json
│   │
│   └── web/                        # React/Vite Frontend (Port 3000)
│       ├── src/
│       │   ├── components/         # Shared UI elements
│       │   ├── features/           # Feature-driven UI (e.g., /login)
│       │   └── stores/             # Zustand state management
│       └── package.json
│
├── packages/
│   ├── common/                     # Shared Zod schemas & TS Interfaces
│   │   ├── src/index.ts
│   │   └── package.json
│   │
│   └── database/                   # Prisma ORM Source of Truth
│       ├── prisma/schema.prisma
│       ├── index.ts
│       └── package.json
│
├── .memory-bank/                   # AI Context & Checklists
├── opencode.json                   # CLI Agent Config
├── pnpm-workspace.yaml             # pnpm strict linking
└── turbo.json                      # Build orchestration
```

## Strict Coding Standards
1. **Zero `any` Policy:** You are strictly forbidden from using the `any` type. Every variable, function return, and component prop must be explicitly typed.
2. **API Type Safety:** Every API request and response MUST be backed by a Zod schema located in `packages/common`. 
3. **Component Reusability:** Before generating a new React component, you MUST search `apps/web/src/components` to see if a similar component already exists. Reuse and extend existing components rather than duplicating code.

## Variable Naming & Vocabulary Standards
To maintain enterprise-grade readability, you MUST adhere to these naming conventions:
1. **Casing:** Use `camelCase` for variables/functions, `PascalCase` for Components/Interfaces/Classes, and `UPPER_SNAKE_CASE` for global constants.
2. **Booleans:** Must be prefixed with `is`, `has`, `should`, or `can` (e.g., `isCorrect`, `hasAnswered`).
3. **Arrays:** Must be explicitly pluralized (e.g., `questions`, `students` — NEVER `questionList`).
4. **Functions:** Must begin with an actionable verb (e.g., `fetchQuiz()`, `calculateScore()`, `renderLeaderboard()`).