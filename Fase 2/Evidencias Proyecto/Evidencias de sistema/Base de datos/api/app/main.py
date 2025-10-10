# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes import ALL_ROUTERS

app = FastAPI(title="CuidaSalud API", version="1.0.0")

# ⚠️ DEV-ONLY: DROP & CREATE en cada arranque
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# CORS abierto para dev (frontend en localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # si prefieres, limita a ["http://localhost:3000", "http://127.0.0.1:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
for r in ALL_ROUTERS:
    app.include_router(r)

@app.get("/health")
def health():
    return {"status": "ok"}
