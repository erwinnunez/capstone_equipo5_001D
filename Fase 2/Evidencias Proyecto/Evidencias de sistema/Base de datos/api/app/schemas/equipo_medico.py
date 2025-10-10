# app/schemas/equipo_medico.py
from pydantic import BaseModel, Field, EmailStr, field_validator

# -------- Create / Update / Out --------
class EquipoMedicoCreate(BaseModel):
    rut_medico: int  = Field(..., example="212511374", description="RUT del médico con dígito verificador sin guion")
    id_cesfam: int = Field(..., gt=0)
    primer_nombre_medico: str = Field(..., min_length=3, max_length=50)
    segundo_nombre_medico: str | None = Field(None, min_length=3, max_length=50)
    primer_apellido_medico: str = Field(..., min_length=3, max_length=50)
    segundo_apellido_medico: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., example="medico@salud.cl")
    contrasenia: str = Field(..., min_length=8, description="Mínimo 8 caracteres")
    telefono: int = Field(..., example="987654321")
    direccion: str = Field(..., min_length=5, max_length=100)
    rol: str = Field(..., min_length=3, max_length=50)
    especialidad: str = Field(..., min_length=3, max_length=50)
    estado: bool
    is_admin: bool = False

    # -------- VALIDACIONES --------
    @field_validator("rut_medico")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        numero = str(v)
        if not numero.isdigit() or len(numero) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator(
        "primer_nombre_medico", "segundo_nombre_medico",
        "primer_apellido_medico", "segundo_apellido_medico"
    )
    @classmethod
    def validar_nombres(cls, v):
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Solo se permiten letras y espacios")
        return v.title()

    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, v):
        caracteres_permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in caracteres_permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()
    
    @field_validator("contrasenia")
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


class EquipoMedicoUpdate(BaseModel):
    id_cesfam: int | None = Field(..., gt=0)
    primer_nombre_medico: str | None = Field(..., min_length=3, max_length=50)
    segundo_nombre_medico: str | None = Field(..., min_length=3, max_length=50)
    primer_apellido_medico: str | None = Field(..., min_length=3, max_length=50)
    segundo_apellido_medico: str | None = Field(..., min_length=3, max_length=50)
    email: EmailStr | None = Field(..., example="medico@salud.cl")
    contrasenia: str | None = Field(..., min_length=8, description="Mínimo 8 caracteres")
    telefono: int | None = Field(..., example="987654321")
    direccion: str | None = Field(..., min_length=5, max_length=100)
    rol: str | None = Field(..., min_length=3, max_length=50)
    especialidad: str | None = Field(..., min_length=3, max_length=50)
    estado: bool | None = None
    is_admin: bool | None = None

    # -------- VALIDACIONES --------
    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        numero = str(v)
        if not numero.isdigit() or len(numero) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator(
        "primer_nombre_medico", "segundo_nombre_medico",
        "primer_apellido_medico", "segundo_apellido_medico"
    )
    @classmethod
    def validar_nombres(cls, v):
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Solo se permiten letras y espacios")
        return v.title()

    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, v):
        caracteres_permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in caracteres_permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()
    
    @field_validator("contrasenia")
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


class EquipoMedicoOut(BaseModel):
    rut_medico: int
    id_cesfam: int
    primer_nombre_medico: str
    segundo_nombre_medico: str
    primer_apellido_medico: str
    segundo_apellido_medico: str
    email: str
    telefono: int
    direccion: str
    rol: str
    especialidad: str
    estado: bool
    is_admin: bool
    class Config:
        from_attributes = True


# -------- List filters (paginación + búsqueda) --------
class EquipoMedicoListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class EquipoMedicoSetEstado(BaseModel):
    habilitar: bool