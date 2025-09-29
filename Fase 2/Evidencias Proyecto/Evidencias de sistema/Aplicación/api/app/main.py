from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ALL_ROUTERS
from app.db import engine,Base

app = FastAPI(title="CuidaSalud API", version="1.0.0")

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

for r in ALL_ROUTERS:
    app.include_router(r)

@app.get("/health")
def health():
    return {"status": "ok"}
