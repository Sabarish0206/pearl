#!/bin/sh
set -e

echo "⏳ Applying database schema..."
# NOTE: This project uses prisma db push (schema-first / prototype workflow).
# When the project adopts prisma migrate, replace this with:
#   pnpm --filter @pearl/database exec prisma migrate deploy
pnpm --filter @pearl/database db:push:prod

echo "✅ Schema is up to date"
exec node /app/apps/api/dist/index.js
