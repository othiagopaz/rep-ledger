#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --schema=./schema.prisma

echo "Starting server..."
node dist/index.js
