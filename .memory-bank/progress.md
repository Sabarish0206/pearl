# Project Pearl — Development Progress

## Completed Modules

### 1. Monorepo Foundation
- Turborepo + pnpm workspaces configured
- `@pearl/web` (React 19 + Vite + TypeScript, Port 3000)
- `@pearl/api` (Express.js + TypeScript, Port 3001, `tsup` build → `dist/index.js`)
- `@pearl/database` (Prisma v6.x, PostgreSQL via Docker on port 5432, DB name `pearl_local`)
- `@pearl/config` (Zod env schemas: `apiEnvSchema` with JWT_SECRET, JWT_EXPIRES_IN; `webEnvSchema`)
- `@pearl/common` (Shared Zod schemas + TS interfaces — barrel export from `src/index.ts`)
- Root `.env` + `.env.example` for centralized environment variables
- `docker-compose.yml` for local PostgreSQL development

### 2. IAM Module — Identity & Access Management
- **Database Schema**: Production `User`, `Student`, `Faculty` models; `Role` enum (STUDENT, FACULTY, ADMIN)
- **Auth Service** (`apps/api/src/modules/auth/`):
  - `auth.service.ts`: signup (User + profile in single Prisma transaction), login (bcrypt compare + JWT sign), getCurrentUser
  - `auth.controller.ts`: Zod validation, sets/clears `auth_token` HttpOnly+Secure+SameSite=Strict cookie
  - `auth.router.ts`: POST /signup, POST /login, GET /me, POST /logout — all rate-limited
- **RBAC Middleware** (`apps/api/src/middleware/`):
  - `verifySession.middleware.ts`: reads HttpOnly cookie, verifies JWT, attaches `req.user` (typed `JwtPayload`)
  - `requireRole.middleware.ts`: factory middleware accepting `allowedRoles[]`
- **Security**: 12-round bcrypt, JWT in HttpOnly cookies only, rate limits (20 req/15min signup/login; 60 req/min GET /me), college email domain restriction (`@psnacet.edu.in`)
- **Frontend** (`apps/web/src/`):
  - `api/auth.api.ts`: fetch wrapper with `credentials: 'include'`
  - `stores/authStore.ts`: Zustand — `currentUser`, `isAuthenticated`, `isLoading` (true initially to prevent race condition)
  - `features/auth/LoginPage.tsx`: controlled form with client-side Zod validation
  - `features/auth/SignupPage.tsx`: role-switching form (STUDENT / FACULTY)
  - `components/ProtectedRoute.tsx`: redirects unauthenticated; returns `null` while `isLoading=true`
  - `App.tsx`: react-router-dom v7, TanStack Query v5, auth bootstrap on mount

### 3. Student Resume Processing Module
- **Two-Phase Draft/Commit Pattern**:
  - Phase 1 — `POST /api/student/resume/parse`: multer PDF upload → Gemini `gemini-2.5-flash` parse → save Resume record with `isVerified=false` (DRAFT)
  - Phase 2 — `PUT /api/student/resume/commit`: client confirms parsed data → Prisma transaction (update Student academic fields, upsert Skills, mark Resume `isVerified=true`)
- **Common Schemas** (`packages/common/src/schemas/resume.schema.ts`): `ParsedResumeDataSchema`, `CommitResumeSchema`, `ResumeRow`, `GetResumeResponse`, `ParseResumeResponse`
- **Safety**: PDF deleted on Gemini failure; skills case-insensitively deduped; `MulterError` mapped to 400/413
- **Rate limits**: 60 req/min general, 10 req/hr parse endpoint
- **Frontend** (`apps/web/src/features/resume/`):
  - `ResumePage.tsx`: MUI v7 dark ThemeProvider, state-machine UI (NOT_UPLOADED → parsing → DRAFT → VERIFIED)
  - Reusable components: `PageHeader`, `DropzoneState`, `ParsingState`, `DraftForm`, `VerifiedDashboard`, `Section`, `Metric`, `SkeletonLoader`
  - Responsive design: mobile-first CSS Grid with breakpoints at 480px, 768px, 1024px
  - MUI v7 compatibility: `Box + CSS Grid` instead of `Grid` component; `slotProps.htmlInput` for TextField

### 4. Job Creation & Publishing Module (Placement Admin)
- **Database Schema**: `Job`, `JobSkill`, `Application` models; `JobStatus` enum (DRAFT, ACTIVE, CLOSED, COMPLETED, CANCELLED); `ApplicationStatus` enum; Student extended with `cgpa`, `activeArrears`, `historyOfArrears`, `tenthMark`, `twelfthMark`
- **Two-Phase Pattern**:
  - Phase 1 — `POST /api/admin/jobs/parse`: accepts PDF (`multer`, 5 MB, `uploads/jds/`) OR `rawText` JSON body → Gemini `gemini-2.5-flash` parse → save Job as DRAFT
  - Phase 2 — `PUT /api/admin/jobs/:id/publish`: validate final edited data → upsert required skills → set Job status to ACTIVE in Prisma transaction
- **Common Schemas** (`packages/common/src/schemas/job.schema.ts`): `ParsedJobDataSchema`, `UnstructuredJobDataSchema`, `JobRow`, `ParseJobResponse`
- **Rate limits**: 60 req/min general, 10 req/hr parse endpoint; ADMIN role required for all routes
- **Frontend** (`apps/web/src/features/jobs/`):
  - `JobParsePage.tsx`: tabbed UI — `FileUploadBox` (PDF drag-and-drop) or `TextInputBox` (raw paste); `JobParsingState` loader
  - `JobVerifyPage.tsx`: review/edit parsed job data with `JobDraftSuccess` confirmation
  - `api/jobs.api.ts`: typed API wrapper functions

---

## Current Status

**All core modules implemented and committed:**

| Module             | Backend | Frontend | Tests  | Status        |
|--------------------|---------|----------|--------|---------------|
| IAM / Auth         | ✅       | ✅        | Partial | Production-ready |
| Resume Processing  | ✅       | ✅        | Partial | Production-ready |
| Job Management     | ✅       | ✅        | —      | Production-ready |
| Application / ATS  | Schema ✅ | —       | —      | Pending         |

TypeScript compiles cleanly for both `@pearl/api` and `@pearl/web`. CodeQL security scan passes with zero alerts. 

---

## Next Steps
- Implement Student Application flow (ATS module — use `Application` model already in schema)
- Implement Admin dashboard: list jobs, view applications, shortlist/reject candidates
- Add Student dashboard: view job listings, apply, track application status
- Configure CI/CD pipelines
- Expand test coverage (Jest + React Testing Library already scaffolded)
- Run `pnpm db:push` in `packages/database` to apply full schema to PostgreSQL
