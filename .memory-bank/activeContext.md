# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- **Web**: React 19 + Vite + TypeScript + Material UI v7 (dark theme) — runs on Port 3000
- **API**: Express.js + TypeScript + Prisma ORM + PostgreSQL — runs on Port 3001
- **AI Integration**: Google Gemini (`gemini-2.5-flash`) for resume and job-description parsing
- **Build System**: Turborepo
- **Package Manager**: pnpm

### Workspace Structure
```
pearl/
├── apps/
│   ├── api/           (@pearl/api)      - Express REST API
│   └── web/           (@pearl/web)      - React Vite SPA
├── packages/
│   ├── common/        (@pearl/common)   - Shared Zod schemas & TS interfaces
│   ├── config/        (@pearl/config)   - Centralized env-var validation (Zod)
│   └── database/      (@pearl/database) - Prisma schema & client singleton
├── docker-compose.yml                   - PostgreSQL on port 5432
├── turbo.json
├── pnpm-workspace.yaml
└── .memory-bank/
    ├── systemPatterns.md
    ├── progress.md
    └── activeContext.md  ← this file
```

### Naming Conventions
All packages follow the `@pearl/` namespace:
- `@pearl/web` — Frontend React app
- `@pearl/api` — Backend Express API
- `@pearl/database` — Prisma ORM layer
- `@pearl/common` — Shared Zod schemas & TypeScript interfaces
- `@pearl/config` — Environment variable schemas (Zod)

---

## Registered API Routes

| Method | Path                    | Module  | Auth Required      |
|--------|-------------------------|---------|-------------------|
| GET    | /health                 | health  | None              |
| POST   | /api/auth/signup        | auth    | None              |
| POST   | /api/auth/login         | auth    | None              |
| GET    | /api/auth/me            | auth    | verifySession     |
| POST   | /api/auth/logout        | auth    | None              |
| POST   | /api/student/resume/parse | resume | STUDENT           |
| PUT    | /api/student/resume/commit | resume | STUDENT          |
| GET    | /api/student/resume     | resume  | STUDENT           |
| POST   | /api/admin/jobs/parse   | job     | ADMIN             |
| GET    | /api/admin/jobs/:id     | job     | ADMIN             |
| PUT    | /api/admin/jobs/:id/publish | job | ADMIN            |

---

## Database Schema (Current)

PostgreSQL via Prisma v6.x. Full production schema:

- **User** — UUID PK, email (unique), passwordHash, Role enum, createdAt
  - Relations: Student (1-1), Faculty (1-1), Job[] (created jobs)
- **Student** — UUID PK, FK→User, firstName, lastName, registerNumber, department, batchYear, cgpa, activeArrears, historyOfArrears, tenthMark, twelfthMark
  - Relations: Resume (1-1), StudentSkill[], Application[]
- **Faculty** — UUID PK, FK→User, fullName, designation, department
- **Skill** — UUID PK, name (unique), createdAt
  - Relations: StudentSkill[], JobSkill[]
- **StudentSkill** — Composite PK (studentId + skillId), source (default "RESUME")
- **Resume** — UUID PK, FK→Student (unique), filePath, atsScore?, parsedData (JSON)?, isVerified (default false)
- **Job** — UUID PK, FK→User (createdBy), companyName, jobRole, ctc?, description (Text), minCgpa (Decimal?), maxActiveArrears (Int?), maxHistoryOfArrears (Int?), allowedDepartments (String[]), parsedData (JSON)?, applicationDeadline?, status (JobStatus, default DRAFT), createdAt, updatedAt
  - Relations: JobSkill[], Application[]
- **JobSkill** — Composite PK (jobId + skillId), isMandatory (default true)
- **Application** — UUID PK, studentId, jobId, status (ApplicationStatus, default APPLIED), createdAt, updatedAt
  - Unique: (studentId, jobId)

**Enums**: `Role` (STUDENT, FACULTY, ADMIN), `JobStatus` (DRAFT, ACTIVE, CLOSED, COMPLETED, CANCELLED), `ApplicationStatus` (APPLIED, SHORTLISTED, OFFERED, REJECTED)

---

## Module Details

### IAM Module (`/api/auth`)
- JWT stored in `HttpOnly + Secure + SameSite=Strict` cookie (`auth_token`)
- `bcrypt` with 12 salt rounds for password hashing
- Middleware: `verifySession.middleware.ts` (reads cookie, verifies JWT, attaches `req.user`), `requireRole.middleware.ts` (factory accepting `allowedRoles[]`)
- Rate limiting: 20 req/15min for signup/login, 60 req/min for /me
- College email domain enforced: `@psnacet.edu.in`
- Frontend: `authStore.ts` (Zustand), `LoginPage.tsx`, `SignupPage.tsx`, `ProtectedRoute.tsx`

### Resume Module (`/api/student/resume`)
- **Two-Phase Pattern**: POST `/parse` → Gemini parse → save as DRAFT; PUT `/commit` → Prisma transaction → mark `isVerified=true`
- AI Model: `gemini-2.5-flash`
- PDF uploaded via `multer` (5 MB limit) to `uploads/resumes/`; file deleted on Gemini failure
- Skills deduped via case-insensitive upsert; student profile fields (cgpa, arrears, marks) updated in commit transaction
- Rate limits: 60 req/min general, 10 req/hr for parse
- Frontend (`apps/web/src/features/resume/`): MUI v7 dark-theme `ResumePage.tsx` with reusable sub-components: `PageHeader`, `DropzoneState`, `ParsingState`, `DraftForm`, `VerifiedDashboard`, `Section`, `Metric`, `SkeletonLoader`

### Job Module (`/api/admin/jobs`) — Admin only
- **Two-Phase Pattern**: POST `/parse` → Gemini parse JD → save Job as DRAFT; PUT `/:id/publish` → validate final data → set status ACTIVE
- Accepts PDF upload (`multer`, 5 MB, `uploads/jds/`) **or** `rawText` JSON body
- AI Model: `gemini-2.5-flash`
- `ParsedJobDataSchema` in `@pearl/common` validates Gemini response
- Rate limits: 60 req/min general, 10 req/hr for parse
- Frontend (`apps/web/src/features/jobs/`): `JobParsePage.tsx` (FileUploadBox / TextInputBox tabs), `JobVerifyPage.tsx` with reusable sub-components: `FileUploadBox`, `TextInputBox`, `JobParsingState`, `JobDraftSuccess`

---

## API Setup Details
- Entry point: `apps/api/src/index.ts`
- Port: 3001 (env `PORT`, default 3001)
- Build: `tsup` with `noExternal: ['@pearl/config']` → outputs `dist/index.js`
- CORS: `credentials: true`, origin from `CORS_ORIGIN` env
- Global error handler: returns `{success: false, error, message}` JSON

## Web Client Setup Details
- Port: 3000 (`VITE_API_URL` env for API base URL, default `http://localhost:3001`)
- State: Zustand (`authStore.ts`)
- Data fetching: TanStack Query v5
- Routing: react-router-dom v7
- UI: Material UI v7 dark ThemeProvider; Box+CSS Grid for layouts (no MUI Grid component — breaking API in v7)
- Auth bootstrap on mount in `App.tsx` via `GET /api/auth/me`
- `ProtectedRoute.tsx` returns `null` while `authStore.isLoading=true` to avoid redirect race condition

## Recent Work

- Fixed public-route auth redirect: `/login` and `/signup` now redirect to `/dashboard` when already authenticated; `AppRoutes` waits for auth bootstrap to finish before rendering routes to prevent login-page flash on refresh/navigation.
- Implemented Issue #54 Profile Dashboards:
  - Added student profile page (`/student/profile`) with identity hub, dynamic placement-status chip, and 3 responsive metric panels (student details, academic performance, prior academic scores).
  - Added admin/faculty profile page (`/admin/profile`) with identity block, designation badge, department card, and jobs-created impact metric.
  - Added typed frontend profile API client (`apps/web/src/api/profile.api.ts`) consuming existing backend endpoints (`/api/student/profile`, `/api/admin/profile`).
  - Added shared profile schemas/types in `packages/common/src/schemas/profile.schema.ts` and exported from common index.
  - Added dashboard navigation cards linking roles to the new profile routes.
  - Restored wildcard `*` route in `App.tsx` for 404-safe navigation fallback.

## Development Scripts (root level)
- `pnpm dev` — Start all dev servers via Turbo
- `pnpm build` — Build all packages
- `pnpm lint` — Lint all packages (`pnpm --filter @pearl/web lint`)
- `pnpm db:generate` — Generate Prisma client
- `pnpm db:push` — Push schema to database
- API build: `pnpm --filter @pearl/api build` (tsup → dist/index.js)

## Recent Changes (last 20 commits)
1. **IAM Module**: JWT auth (`/api/auth`), RBAC middleware, Zustand auth store, login/signup pages
2. **Security hardening**: Rate limiting on all auth & resume routes; bcrypt 12 rounds; HttpOnly cookies
3. **Resume UI (initial)**: `ResumeUpload.tsx` component + `ResumeUploadDemo.tsx` feature page
4. **Resume module (Two-Phase Draft/Commit)**: Gemini PDF parsing → DRAFT save → commit transaction
5. **Resume fixes**: Code review (camelCase types, MulterError status codes, async file read, Gemini validation, skill dedup, dropzone a11y), CodeQL findings, PDF file cleanup on failure, MUI/testing-lib deps, Gemini model updates (2.0-flash → 2.5-flash)
6. **ResumePage refactor**: MUI v7 dark ThemeProvider, full component decomposition (`DraftForm`, `VerifiedDashboard`, etc.), responsive CSS Grid layout with mobile-first breakpoints (480px, 768px, 1024px)
7. **Database schema (Jobs & ATS)**: Added Job, JobSkill, Application, ApplicationStatus; extended Student with academic fields
8. **Job module Phase 1**: PDF/text JD parsing via Gemini → DRAFT Job saved; `ParsedJobDataSchema` in common
9. **Job module Phase 2**: Publish transaction — validate, upsert skills, set status ACTIVE; `JobVerifyPage.tsx` frontend
