"""
Main entry point for the application.
Serves both the FastAPI backend and React frontend.
"""
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
import os

# Import the main app from app.py
from app import app

# Mount static files if they exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
print(f"Looking for static directory at: {static_dir}")
print(f"Static directory exists: {os.path.exists(static_dir)}")

if os.path.exists(static_dir):
    print(f"✓ Static directory found: {static_dir}")
    # List contents for debugging
    try:
        contents = os.listdir(static_dir)
        print(f"  Contents: {contents}")
    except Exception as e:
        print(f"  Error listing contents: {e}")
    
    # Mount static files for assets (JS, CSS, images, etc.)
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        print(f"✓ Assets mounted at /assets")
    else:
        print(f"⚠ Assets directory not found at: {assets_dir}")
    
    # Check for index.html
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        print(f"✓ index.html found")
    else:
        print(f"⚠ index.html NOT found at: {index_path}")
    
    # Serve React app for root and all non-API routes
    # This must be added AFTER all API routes
    @app.get("/")
    async def serve_root():
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend not found - index.html missing"}
    
    # Catch-all route for SPA - must be last to not interfere with API routes
    # FastAPI matches routes in order, so API routes defined in app.py will take precedence
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        # Check if this is an API route that should be handled by app.py
        # These routes are already defined in app.py, so they won't reach here
        # But we check anyway as a safety measure
        api_routes = ["predict", "dataset", "model_info", "health", "docs", "redoc", "openapi.json"]
        if any(full_path.startswith(route) for route in api_routes):
            # This shouldn't happen, but if it does, return 404
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")
        
        # Check if it's a file request (like favicon.ico, robots.txt, etc.)
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Serve index.html for SPA routing (React Router handles client-side routing)
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"detail": "Frontend not found"}
else:
    print(f"Warning: Static directory not found at {static_dir}")
    print("Frontend will not be served. Only API endpoints available.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

