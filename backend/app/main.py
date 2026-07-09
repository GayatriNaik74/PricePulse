from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine
from app.api import auth_routes, product_routes

from app.models import user, product, price_history, alert

# This creates all tables in the database if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PricePulse API")

# Allows your React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite's default dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(product_routes.router)

@app.get("/")
def root():
    return {"message": "PricePulse API is running"}