#!/bin/sh
set -e

echo "⏳ Applying database schema..."
pnpm --filter @pearl/database db:push --skip-generate

echo "✅ Schema is up to date"
exec node /app/apps/api/dist/index.js
