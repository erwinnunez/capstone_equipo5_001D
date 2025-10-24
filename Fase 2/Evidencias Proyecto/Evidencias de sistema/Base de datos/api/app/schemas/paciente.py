from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime, date
from typing import Optional

# -------- Create / Update / Out --------
class PacienteCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    id_comuna: int

    primer_nombre_paciente: str = Field(..., min_length=3, max_length=50)
    segundo_nombre_paciente: str = Field(..., min_length=3, max_length=50)
    primer_apellido_paciente: str = Field(..., min_length=3, max_length=50)
    segundo_apellido_paciente: str = Field(..., min_length=3, max_length=50)

    fecha_nacimiento: date
    sexo: bool
    tipo_de_sangre: str = Field(pattern=r"^(A|B|AB|O)[+-]$", example="O+")
    enfermedades: str | None = None
    seguro: str | None = None

    direccion: str = Field(..., min_length=5, max_length=150)
    telefono: int = Field(..., example="961072806")
    email: EmailStr
    contrasena: str = Field(..., min_length=8, max_length=64)

    tipo_paciente: str = Field(..., example="Crónico")
    nombre_contacto: str = Field(..., min_length=3, max_length=100)
    telefono_contacto: int = Field(..., example="988887777")

    estado: bool

    id_cesfam: int
    fecha_inicio_cesfam: date 
    fecha_fin_cesfam: date | None = None
    activo_cesfam: bool

# --- VALIDAR RUT ---
    @field_validator("rut_paciente")
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
        "primer_nombre_paciente", "segundo_nombre_paciente",
        "primer_apellido_paciente", "segundo_apellido_paciente"
    )
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    # --- VALIDAR FECHA DE NACIMIENTO ---
    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha_nacimiento(cls, v):
        hoy = date.today()
        if v > hoy:
            raise ValueError("La fecha de nacimiento no puede ser futura")
        if (hoy.year - v.year) > 120:
            raise ValueError("La edad no puede superar los 120 años")
        return v

    # --- VALIDAR TELÉFONOS ---
    @field_validator("telefono", "telefono_contacto")
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
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
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


class PacienteUpdate(BaseModel):
    id_comuna: int | None = None
    primer_nombre_paciente: str | None = None
    segundo_nombre_paciente: str | None = None
    primer_apellido_paciente: str | None = None
    segundo_apellido_paciente: str | None = None
    fecha_nacimiento: datetime | None = None
    sexo: bool | None = None
    tipo_de_sangre: str | None = None
    enfermedades: str | None = None
    seguro: str | None = None
    direccion: str | None = None
    telefono: int | None = None
    email: str | None = None
    contrasena: str | None = None
    tipo_paciente: str | None = None
    nombre_contacto: str | None = None
    telefono_contacto: int | None = None
    estado: bool | None = None
    id_cesfam: int | None = None
    fecha_inicio_cesfam: datetime | None = None
    fecha_fin_cesfam: datetime | None = None
    activo_cesfam: bool | None = None



    # --- VALIDAR NOMBRES Y APELLIDOS ---
    @field_validator(
        "primer_nombre_paciente", "segundo_nombre_paciente",
        "primer_apellido_paciente", "segundo_apellido_paciente"
    )
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    # --- VALIDAR FECHA DE NACIMIENTO ---
    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha_nacimiento(cls, v):
        hoy = date.today()
        if v > hoy:
            raise ValueError("La fecha de nacimiento no puede ser futura")
        if (hoy.year - v.year) > 120:
            raise ValueError("La edad no puede superar los 120 años")
        return v

    # --- VALIDAR TELÉFONOS ---
    @field_validator("telefono", "telefono_contacto")
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
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
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


class PacienteOut(BaseModel):
    rut_paciente: int
    id_comuna: int
    primer_nombre_paciente: str
    segundo_nombre_paciente: str
    primer_apellido_paciente: str
    segundo_apellido_paciente: str
    fecha_nacimiento: datetime
    sexo: bool
    tipo_de_sangre: str
    enfermedades: str
    seguro: str
    direccion: str
    telefono: int
    email: str
    tipo_paciente: str
    nombre_contacto: str
    telefono_contacto: int
    estado: bool
    id_cesfam: int
    fecha_inicio_cesfam: datetime
    fecha_fin_cesfam: datetime | None = None
    activo_cesfam: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación + búsqueda) --------
class PacienteListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    id_comuna: int | None = None
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class PacienteSetEstado(BaseModel):
    habilitar: bool


# ---------------------------------------------------------
#  NUEVOS SCHEMAS para endpoints resumen y métricas
# ---------------------------------------------------------

class PacienteResumenOut(BaseModel):
    rut_paciente: int
    nombre_completo: str
    edad: int
    enfermedad_principal: str
    ultima_atencion: Optional[datetime]
    class Config:
        from_attributes = True


class MetricaPacienteOut(BaseModel):
    id_rango:int 
    id_parametro: int
    nombre: str
    unidad: str
    rango_min: float
    rango_max: float
    valor_actual: Optional[float]