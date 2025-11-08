from pydantic import BaseModel, EmailStr, Field
from typing import Literal

Role = Literal["admin", "doctor", "caregiver", "patient"]

class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    role: Role

class FrontUser(BaseModel):
    id: str
    name: str
    role: Role
    email: EmailStr
    rut_paciente: str | None = None

class LoginResponse(BaseModel):
    user: FrontUser
    token: str | None = None  # opcional (JWT a futuro)
