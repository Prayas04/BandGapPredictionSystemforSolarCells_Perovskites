# Docker Setup Guide

This guide explains how to containerize and run the Solar Band Gap Prediction System using Docker.

## Prerequisites

- Docker Desktop installed: https://www.docker.com/products/docker-desktop/
- Docker Compose (included with Docker Desktop)

## Project Structure

The Docker setup uses a **multi-stage build**:
1. **Stage 1**: Builds the React frontend into static files
2. **Stage 2**: Sets up Python backend and serves both API and frontend

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Build and run everything:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the containers:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Option 2: Using Dockerfile Directly

1. **Build the image:**
   ```bash
   docker build -t solar-bandgap-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 solar-bandgap-app
   ```

3. **Run with volume mounts (to update models without rebuild):**
   ```bash
   docker run -p 8000:8000 \
     -v ./Backend/SolarB_Gap_Pred.pkl:/app/Backend/SolarB_Gap_Pred.pkl:ro \
     -v ./Backend/Features.pkl:/app/Backend/Features.pkl:ro \
     -v ./Backend/materials_info.pkl:/app/Backend/materials_info.pkl:ro \
     solar-bandgap-app
   ```

## Accessing the Application

Once running, access:
- **Frontend & API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Important Notes

### Model Files

The Dockerfile will copy `.pkl` files if they exist. Make sure your model files are in the `Backend/` directory:
- `SolarB_Gap_Pred.pkl`
- `Features.pkl`
- `materials_info.pkl` or `materials_info.csv`

### Frontend API Calls

The React app is configured to call `http://localhost:8000` for API requests. In production, you might want to:
1. Use environment variables for API URL
2. Configure a reverse proxy (nginx)
3. Update the frontend to use relative paths

### Environment Variables

You can add environment variables in `docker-compose.yml`:

```yaml
environment:
  - PYTHONUNBUFFERED=1
  - API_URL=http://localhost:8000
```

## Development vs Production

### Development
- Use separate containers for frontend and backend
- Enable hot-reload
- Mount source code as volumes

### Production
- Single container with built frontend (current setup)
- Optimized build
- Health checks enabled

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check if port 8000 is already in use
netstat -ano | findstr :8000
```

### Model files not found
```bash
# Verify files exist
ls Backend/*.pkl

# Check container filesystem
docker exec -it solar-bandgap-prediction ls -la /app/Backend/
```

### Frontend not loading
- Check if frontend was built: `docker exec -it solar-bandgap-prediction ls -la /app/Backend/static`
- Verify API is working: `curl http://localhost:8000/health`

### Rebuild after changes
```bash
# Force rebuild without cache
docker-compose build --no-cache
docker-compose up
```

## Production Deployment

For production, consider:

1. **Use a reverse proxy (nginx)**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:8000;
       }
       
       location / {
           proxy_pass http://localhost:8000;
       }
   }
   ```

2. **Use environment-specific builds**:
   - Create `Dockerfile.prod` for production
   - Use multi-stage builds efficiently
   - Minimize image size

3. **Security**:
   - Don't expose sensitive data in images
   - Use secrets management
   - Enable HTTPS

4. **Scaling**:
   - Use Docker Swarm or Kubernetes
   - Load balance multiple instances

## Docker Commands Reference

```bash
# Build image
docker build -t solar-bandgap-app .

# Run container
docker run -p 8000:8000 solar-bandgap-app

# View running containers
docker ps

# View logs
docker logs solar-bandgap-prediction

# Execute command in container
docker exec -it solar-bandgap-prediction bash

# Stop container
docker stop solar-bandgap-prediction

# Remove container
docker rm solar-bandgap-prediction

# Remove image
docker rmi solar-bandgap-app

# Clean up unused resources
docker system prune -a
```

## Alternative: Separate Frontend/Backend Containers

If you prefer separate containers, create:

### `Dockerfile.backend`
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY Backend/requirements.txt .
RUN pip install -r requirements.txt
COPY Backend/ .
CMD ["python", "app.py"]
```

### `Dockerfile.frontend`
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY Fend/package*.json ./
RUN npm install
COPY Fend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

Then update `docker-compose.yml` to run both services.

