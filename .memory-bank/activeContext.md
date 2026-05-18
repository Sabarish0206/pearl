## Active Context (2026-05-02)

We are setting up AWS free-tier deployment for Project Pearl:
- Backend: Express + Prisma + Postgres via Docker Compose on a single Ubuntu EC2.
- Frontend: Vite/React static build to S3 behind CloudFront (HTTPS + SPA routing).
- CI/CD: GitHub Actions deploy on pushes to `main`.

Current repo state:
- Two new workflow files exist and are currently untracked (not committed yet):
  - `.github/workflows/deploy-backend.yml` (SSH to EC2, git pull main, `docker compose up -d --build`)
  - `.github/workflows/deploy-frontend.yml` (pnpm install, build `@pearl/web`, `aws s3 sync`, CloudFront invalidation)

Known upcoming work:
- Commit/push the new workflows.
- Add required GitHub Secrets for SSH + AWS.
- Ensure EC2 has repo cloned at expected `DEPLOY_PATH` and server `.env` present.
- Confirm CloudFront SPA error mapping (403/404 -> `/index.html`) and CORS/cookie auth compatibility for cross-site frontend->API.
