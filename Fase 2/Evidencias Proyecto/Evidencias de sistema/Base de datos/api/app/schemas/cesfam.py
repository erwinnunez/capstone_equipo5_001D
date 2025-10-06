from pydantic import BaseModel, Field, EmailStr, field_validator

# -------- Create / Update / Out --------
class CesfamCreate(BaseModel):
    id_comuna: int
    nombre_cesfam: str = Field (..., min_length=4, max_length=100, example="Cesfam Miraflores")
    telefono: int = Field(..., example= 961072806)
    direccion: str = Field(..., min_length=5, max_length=150, example="Av. Los Castaños 1450")
    email: EmailStr
    estado: bool

    # --- VALIDAR NOMBRE ---
    @field_validator("nombre_cesfam")
    @classmethod
    def validar_nombre_cesfam(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre del CESFAM solo puede contener letras y espacios")
        return v.title()  

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
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()    

class CesfamUpdate(BaseModel):
    id_comuna: int | None = None
    nombre_cesfam: str | None = Field (..., min_length=4, max_length=100, example="Cesfam Talcahuano Sur")
    telefono: int | None = Field(..., example= 961072806)
    direccion: str | None = Field(..., min_length=5, max_length=150, example="Palermo 4128")
    email: EmailStr | None = None
    estado: bool | None = None

    # --- VALIDAR NOMBRE ---
    @field_validator("nombre_cesfam")
    @classmethod
    def validar_nombre_cesfam(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre del CESFAM solo puede contener letras y espacios")
        return v.title()  

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
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title() 

class CesfamOut(BaseModel):
    id_cesfam: int
    id_comuna: int
    nombre_cesfam: str
    telefono: int
    direccion: str
    email: EmailStr
    estado: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación) --------
class CesfamListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_comuna: int | None = None
    estado: bool | None = True  # por defecto, solo activos

# -------- Habilitar / Deshabilitar --------
class CesfamSetEstado(BaseModel):
    habilitar: bool
