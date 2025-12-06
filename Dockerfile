# Multi-stage Dockerfile for Solar Band Gap Prediction System
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY Fend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY Fend/ ./

# Build React app for production
RUN npm run build

# Stage 2: Python Backend with Frontend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (includes all files: .py, .pkl, .csv, etc.)
# Model files (.pkl) will be included if they exist in Backend/ directory
COPY Backend/ ./Backend/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./Backend/static

# Set working directory to Backend
WORKDIR /app/Backend

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["python", "main.py"]

