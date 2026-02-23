# Project Pearl

Project Pearl is a full-stack monorepo designed for building modern web applications. It leverages a powerful combination of technologies to provide a robust and scalable development environment.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Database Setup](#4-database-setup)
- [Development Scripts](#development-scripts)
- [Workspace Structure](#workspace-structure)
- [Naming Conventions](#naming-conventions)

## Project Overview

Project Pearl is a monorepo structured with the following key components:

-   **Frontend (Web):** A React 19 single-page application (SPA) built with Vite and TypeScript.
-   **Backend (API):** An Express.js REST API developed with TypeScript.
-   **Database:** PostgreSQL managed with Prisma ORM.
-   **Build System:** Turborepo for optimized monorepo development.
-   **Package Manager:** pnpm.

## Architecture

The project is organized into `apps` and `packages` workspaces:

-   **`apps/web` (`@pearl/web`):** The React Vite client application.
-   **`apps/api` (`@pearl/api`):** The Express API server.
-   **`packages/common` (`@pearl/common`):** Shared utilities and helper functions.
-   **`packages/config` (`@pearl/config`):** Centralized configuration for environment variable schemas using Zod.
-   **`packages/database` (`@pearl/database`):** Contains the Prisma schema and the Prisma Client singleton.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/en/download/) (v18 or later recommended)
-   [pnpm](https://pnpm.io/installation) (install via `npm install -g pnpm`)
-   [Docker](https://www.docker.com/get-started) (for PostgreSQL database)
-   [Git](https://git-scm.com/downloads)

## Getting Started

Follow these steps to set up and run the Project Pearl monorepo locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Sabarish0206/pearl.git
cd pearl
```

### 2. Install Dependencies

Install all project dependencies using pnpm:

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your environment variables. Ensure the `DATABASE_URL` for PostgreSQL matches the `docker-compose.yml` settings.

### 4. Database Setup

The project uses PostgreSQL with Docker.

1.  **Start the PostgreSQL and Pgweb containers:**
    ```bash
    docker-compose up -d db pgweb
    ```
    This will start both your PostgreSQL database (named `pearl-postgres`) and Pgweb (a web-based PostgreSQL client) accessible at `http://localhost:8080`.

2.  **Generate Prisma Client and Push Schema:**
    ```bash
    pnpm db:generate
    pnpm db:push
    ```
    These commands generate the Prisma Client based on your schema and apply the database schema to your PostgreSQL instance.

## Development Scripts

The following scripts are available at the root level:

-   `pnpm dev`: Starts all development servers (API and Web) via Turborepo.
-   `pnpm build`: Builds all packages in the monorepo.
-   `pnpm lint`: Lints all packages.
-   `pnpm db:generate`: Generates the Prisma client.
-   `pnpm db:push`: Pushes the Prisma schema to the database.

## Workspace Structure

```
pearl/
├── apps/
│   ├── web/          (@pearl/web) - React Vite app
│   └── api/          (@pearl/api) - Express API
├── packages/
│   ├── common/       (@pearl/common) - Shared utilities
│   ├── config/       (@pearl/config) - Configuration package (Zod schemas)
│   └── database/     (@pearl/database) - Prisma schema and Client
├── turbo.json        - Turborepo configuration
├── pnpm-workspace.yaml - pnpm workspace configuration
├── docker-compose.yml - Docker Compose for PostgreSQL and Pgweb
└── .env.example      - Example environment variables
```

## Naming Conventions

All internal packages follow the `@pearl/` namespace:

-   `@pearl/web`: Frontend application
-   `@pearl/api`: Backend API
-   `@pearl/database`: Database layer
-   `@pearl/common`: Shared code/utilities
-   `@pearl/config`: Configuration utilities (Environment Variable Types)