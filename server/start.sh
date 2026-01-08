#!/bin/bash
set -e

# Start Gunicorn
echo "Starting production server..."
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
