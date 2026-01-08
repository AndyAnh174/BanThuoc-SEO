# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
# gcc and others might be needed for some python packages like psycopg2 if we were building from source, 
# but we used psycopg2-binary so we might be fine. Installing basics just in case.
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Copy entrypoint and start scripts and make them executable
COPY entrypoint.sh /app/
COPY start.sh /app/
RUN chmod +x /app/entrypoint.sh /app/start.sh

# Run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command if nothing else is specified
CMD ["/app/start.sh"]
