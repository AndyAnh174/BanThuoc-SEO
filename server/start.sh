#!/bin/bash
set -e

# Run Migrations
echo "Running migrations..."
python manage.py migrate

# Collect Static Files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Dump environment for debugging (filtered to avoid secrets leak if possible, but full env is needed for debug)
echo "--- ENVIRONMENT DUMP ---"
env
echo "------------------------"

export PYTHONUNBUFFERED=1

# Start Gunicorn
echo "Starting production server..."
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Start Gunicorn
echo "Starting production server..."
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
