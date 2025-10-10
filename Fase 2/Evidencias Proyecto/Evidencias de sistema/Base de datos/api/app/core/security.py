# app/core/security.py
from __future__ import annotations
from passlib.context import CryptContext
import bcrypt, hashlib

# Config passlib (bcrypt "2b", rounds fijos)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__ident="2b",
    bcrypt__rounds=12,
)

def _truncate72(s: str) -> str:
    # límite de 72 bytes de bcrypt (passlib ya lo maneja, pero mantenemos simetría)
    return (s or "")[:72]

def _legacy_prehash_bytes(plain: str) -> bytes:
    # esquema legacy: SHA-256(utf-8) -> bcrypt
    return hashlib.sha256((plain or "").encode("utf-8")).digest()

def hash_password(plain: str) -> str:
    """Nuevo estándar: passlib/bcrypt SÓLO con truncado a 72 bytes (SIN prehash)."""
    return pwd_context.hash(_truncate72(plain))

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifica con el esquema nuevo; si falla, intenta el legacy (sha256+bcrypt).
    """
    if not hashed:
        return False
    # 1) Intento esquema nuevo (passlib/bcrypt sin prehash)
    try:
        if pwd_context.verify(_truncate72(plain), hashed):
            return True
    except Exception:
        pass
    # 2) Intento esquema legacy (sha256+bcrypt)
    try:
        pre = _legacy_prehash_bytes(plain)
        return bcrypt.checkpw(pre, hashed.encode("utf-8"))
    except Exception:
        return False

def verify_with_variant(plain: str, hashed: str) -> tuple[bool, str | None]:
    """
    Igual a verify_password pero indica con qué variante coincidió:
    - "new"     => passlib/bcrypt sin prehash
    - "legacy"  => sha256+bcrypt
    - None      => no coincide
    """
    if not hashed:
        return (False, None)
    try:
        if pwd_context.verify(_truncate72(plain), hashed):
            return (True, "new")
    except Exception:
        pass
    try:
        pre = _legacy_prehash_bytes(plain)
        if bcrypt.checkpw(pre, hashed.encode("utf-8")):
            return (True, "legacy")
    except Exception:
        pass
    return (False, None)

def needs_rehash(hashed: str) -> bool:
    """Indica si conviene rehashear al formato actual (rounds, ident, etc.)."""
    try:
        return pwd_context.needs_update(hashed)
    except Exception:
        # si no lo reconoce, probablemente legacy: conviene rehashear
        return True
