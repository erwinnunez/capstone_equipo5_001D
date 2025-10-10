# app/security.py
import bcrypt
import hashlib

def _prehash(password: str) -> bytes:
    if isinstance(password, str):
        password = password.encode("utf-8")
    # SHA-256 para evitar el límite de 72 bytes de bcrypt
    return hashlib.sha256(password).digest()

def hash_password(plain_password: str) -> str:
    pre = _prehash(plain_password)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pre, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pre = _prehash(plain_password)
        return bcrypt.checkpw(pre, hashed_password.encode("utf-8"))
    except Exception:
        return False
