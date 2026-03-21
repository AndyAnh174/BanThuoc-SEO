# Use an official Python runtime as a parent image
FROM python:3.13-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Install Playwright browsers to a fixed path accessible by all users
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
RUN playwright install --with-deps chromium && rm -rf /var/lib/apt/lists/*



# Copy project
COPY . /app/

# Copy entrypoint and start scripts and make them executable
# Copy entrypoint and start scripts and make them executable
COPY entrypoint.sh /app/
COPY start.sh /app/
RUN dos2unix /app/entrypoint.sh /app/start.sh
RUN chmod +x /app/entrypoint.sh /app/start.sh

# Create static and media directories and set permissions for non-root user
RUN mkdir -p /app/staticfiles /app/media && \
    adduser --disabled-password --gecos '' django_user && \
    chown -R django_user:django_user /app/staticfiles /app/media

# Switch to non-root user
USER django_user

# Run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command if nothing else is specified
CMD ["/app/start.sh"]
