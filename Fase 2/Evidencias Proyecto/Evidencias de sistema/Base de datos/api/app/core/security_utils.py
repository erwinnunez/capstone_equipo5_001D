# app/core/security_utils.py
import re
from app.core.security import hash_password

# Patrón para detectar un hash bcrypt válido ($2a$, $2b$, $2y$)
_bcrypt_pattern = re.compile(r"^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$")

def safe_hash_password(pwd: str) -> str:
    """
    Aplica hash solo si la contraseña no está ya cifrada.
    Evita el ValueError: "password cannot be longer than 72 bytes".
    """
    if not pwd:
        return pwd
    if _bcrypt_pattern.match(pwd):
        # Ya está hasheada, no hacer nada
        return pwd
    return hash_password(pwd)
