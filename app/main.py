from fastapi import FastAPI
from sqlalchemy import desc
from app.router import auth


app = FastAPI(
    title="devlinks API",
    description="URL Shortener with Analytics",   
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"  
)



@app.get("/")
async def root():
    return {
        "message": "Welcome to devlinks API",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }