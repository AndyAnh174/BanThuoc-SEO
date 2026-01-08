# BanThuoc Project

## Overview
This project is a comprehensive e-commerce platform for selling pharmaceutical products ("Bán Thuốc"). It utilizes a modern tech stack with a Django backend, Next.js frontend, and a robust Dockerized infrastructure.

## Prerequisites

-   **Docker Desktop**: Ensure Docker Engine is running.
-   **Python 3.13+**: For backend scripts and tooling.
-   **Node.js 22+**: For the frontend application.

## Getting Started

### 1. Environment Configuration

The project relies on a `.env` file for configuration. A standard file has been created for you.

*   PostgreSQL Credentials
*   Redis Configuration
*   MinIO (S3) Keys and Buckets
*   Django & Next.js Settings

### 2. Infrastructure Setup (Docker)

We use Docker Compose to manage core services (PostgreSQL, Redis, MinIO).

**Start Services:**
```bash
docker compose up -d
```

This will start:
*   **Postgres**: Port `5432`
*   **Redis**: Port `6379`
*   **MinIO**: API `9000`, Console `9001`
    *   *Credential*: `minioadmin` / `minioadmin`
    *   *Buckets*: Automatically creates `banthuoc-media` with public read access.

**Stop Services:**
```bash
docker compose down
```

### 3. Backend Setup & Scripts

Always use the virtual environment for python scripts.

**Activate Virtual Environment:**

*   **Windows (PowerShell):**
    ```powershell
    .\venv\Scripts\activate
    ```
*   **Linux/Mac:**
    ```bash
    source venv/bin/activate
    ```

**Test MinIO Connection:**
After starting Docker, you can verify the storage service:
```bash
pip install minio requests
python scripts/test_minio.py
```

## Project Structure
*   `docker-compose.yml`: Definition of infrastructure services.
*   `.env`: Environment variables.
*   `scripts/`: Utility scripts (e.g., testing connections).
*   `docs/`: Project documentation.

## Troubleshooting
*   **MinIO Connection Refused**: Ensure the `createbuckets` container in Docker Compose has finished running. It waits for MinIO to be ready before creating buckets.
*   **Python Module Not Found**: Ensure you have activated the virtual environment (`venv`) and installed dependencies (`pip install ...`).
