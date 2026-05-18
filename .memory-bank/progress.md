## Progress (2026-05-02)

- Backend containerization and EC2 Docker Compose setup: done previously.
- Frontend S3 + CloudFront hosting and SPA routing guidance: done previously.
- CI/CD workflows:
  - Created `.github/workflows/deploy-backend.yml`: pending commit.
  - Created `.github/workflows/deploy-frontend.yml`: pending commit.

Next:
1) Commit + push the workflows to `main`.
2) Configure GitHub Secrets (SSH + AWS + S3 bucket + CloudFront distribution).
3) Prepare EC2 deploy directory and ensure `docker compose up -d --build` works non-interactively.
4) Address cross-site auth (CORS + cookies or switch auth strategy) if sessions fail from CloudFront domain.
