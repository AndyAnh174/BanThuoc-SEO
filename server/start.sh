#!/bin/bash
set -e

# Run Migrations
echo "Running migrations..."
python manage.py migrate

# Collect Static Files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting production server..."
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
