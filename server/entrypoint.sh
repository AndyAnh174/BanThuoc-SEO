#!/bin/bash
set -e

# Wait for database if needed (optional, depends on infra, usually Docker Compose depends_on handles startup order but not readiness)
# keeping it simple for now as per Request

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

exec "$@"
