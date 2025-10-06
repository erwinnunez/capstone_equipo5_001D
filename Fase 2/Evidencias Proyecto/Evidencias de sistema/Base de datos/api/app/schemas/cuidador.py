from pydantic import BaseModel, Field, EmailStr, field_validator

# -------- Create / Update / Out --------
class CuidadorCreate(BaseModel):
    rut_cuidador: int = Field(..., example="212511374")
    primer_nombre_cuidador: str = Field(..., min_length=3, max_length=60)
    segundo_nombre_cuidador: str = Field(..., min_length=3, max_length=60)
    primer_apellido_cuidador: str = Field(..., min_length=3, max_length=60)
    segundo_apellido_cuidador: str = Field(..., min_length=3, max_length=60)
    sexo: bool
    direccion: str = Field(..., min_length=5, max_length=150)
    telefono: int = Field(..., example="999998888")
    email: EmailStr
    contrasena: str = Field(..., min_length=8, max_length=64)
    estado: bool

# --- VALIDAR RUT ---
    @field_validator("rut_cuidador")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # --- VALIDAR NOMBRES Y APELLIDOS ---
    @field_validator(
        "primer_nombre_cuidador", "segundo_nombre_cuidador",
        "primer_apellido_cuidador", "segundo_apellido_cuidador"
    )
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    # --- VALIDAR TELÉFONO ---
    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        numero = str(v)
        # Validar que tenga exactamente 9 dígitos
        if not numero.isdigit() or len(numero) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    # --- VALIDAR DIRECCIÓN ---
    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, v):
        caracteres_permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in caracteres_permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y los caracteres ., #-")
        return v.strip().title()

    # --- VALIDAR CONTRASEÑA ---
    @field_validator("contrasena")
    @classmethod
    def validar_contrasena(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos un número")
        return v

class CuidadorUpdate(BaseModel):
    primer_nombre_cuidador: str | None = Field(..., min_length=3, max_length=50)
    segundo_nombre_cuidador: str | None = Field(..., min_length=3, max_length=50)
    primer_apellido_cuidador: str | None = Field(..., min_length=3, max_length=50)
    segundo_apellido_cuidador: str | None = Field(..., min_length=3, max_length=50)
    sexo: bool | None = None
    direccion: str | None = Field(..., min_length=5, max_length=150)
    telefono: int | None = Field(..., example="999998888")
    email: str | None = None
    contrasena: EmailStr | None = None
    estado: bool | None = None


    # --- VALIDAR NOMBRES Y APELLIDOS ---
    @field_validator(
        "primer_nombre_cuidador", "segundo_nombre_cuidador",
        "primer_apellido_cuidador", "segundo_apellido_cuidador"
    )
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    # --- VALIDAR TELÉFONO ---
    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        numero = str(v)
        # Validar que tenga exactamente 9 dígitos
        if not numero.isdigit() or len(numero) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    # --- VALIDAR DIRECCIÓN ---
    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, v):
        caracteres_permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in caracteres_permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y los caracteres ., #-")
        return v.strip().title()

    # --- VALIDAR CONTRASEÑA ---
    @field_validator("contrasena")
    @classmethod
    def validar_contrasena(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos un número")
        return v

class CuidadorOut(BaseModel):
    rut_cuidador: int
    primer_nombre_cuidador: str
    segundo_nombre_cuidador: str
    primer_apellido_cuidador: str
    segundo_apellido_cuidador: str
    sexo: bool
    direccion: str
    telefono: int
    email: str
    contrasena: str
    estado: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación + búsqueda) --------
class CuidadorListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class CuidadorSetEstado(BaseModel):
    habilitar: bool
