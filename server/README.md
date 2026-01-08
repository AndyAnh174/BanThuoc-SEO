# BanThuoc Backend Server

This directory contains the Django backend for the BanThuoc e-commerce platform. It is designed to run in a Dockerized environment but can be set up locally for development.

## Project Structure

The project follows a modular structure to separate configuration, third-party libraries, and local applications.

```text
server/
├── apps/                 # Directory for local Django apps (e.g., users, products)
│   └── __init__.py       # Makes 'apps' a namespace, added to sys.path
├── core/                 # Main project configuration
│   ├── settings/         # Split settings for different environments
│   │   ├── base.py       # Common settings (Apps, Database, Redis, MinIO)
│   │   ├── dev.py        # Development settings (DEBUG=True, Console Email)
│   │   └── prod.py       # Production settings (Security headers, DEBUG=False)
│   ├── asgi.py           # ASGI entry point for Async/WebSockets
│   ├── urls.py           # Root URL configuration
│   └── wsgi.py           # WSGI entry point for synchronous deployment
├── manage.py             # Django command-line utility
└── requirements.txt      # Python dependencies
```

## Setup & Installation

### 1. Prerequisites
Ensure you have the virtual environment activated as described in the root README.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
The server reads configuration from the `.env` file in the **project root** (`../.env`).
Ensure your `.env` contains:
*   `DATABASE_URL` or standard Postgres vars (`POSTGRES_DB`, etc.)
*   `REDIS_URL` or (`REDIS_HOST`, etc.)
*   `MINIO_` configuration.
*   `DJANGO_SECRET_KEY` and `DJANGO_DEBUG`.

## Running the Server

### Development
The `manage.py` file is configured to use `core.settings.dev` by default.

```bash
python manage.py migrate
python manage.py runserver
```

### Production
In production, you should specify the production settings module and use a production server like Gunicorn.

```bash
export DJANGO_SETTINGS_MODULE=core.settings.prod
gunicorn core.wsgi:application
```

## Developing New Apps
All new local applications should be created inside the `apps/` directory to keep the root clean.
Because `apps/` is added to `sys.path`, you can import them directly.

**To create a new app:**
```bash
cd apps
django-admin startapp my_app_name
```

**To use the app:**
In `core/settings/base.py`, add it simply as:
```python
INSTALLED_APPS = [
    ...
    "my_app_name",
]
```
*(Do not use "apps.my_app_name")*
