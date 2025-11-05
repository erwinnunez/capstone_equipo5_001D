# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes import ALL_ROUTERS

app = FastAPI(title="CuidaSalud API", version="1.0.0")

# ⚠️ DEV-ONLY: DROP & CREATE en cada arranque (ojo con esto en prod)
# Base.metadata.drop_all(bind=engine)
# Base.metadata.create_all(bind=engine)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # si usas Vite:
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,   # <- NO "*"
    allow_credentials=True,          # <- porque usas credentials: "include"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],            # opcional
)

for r in ALL_ROUTERS:
    app.include_router(r)

@app.get("/health")
def health():
    return {"status": "ok"}
