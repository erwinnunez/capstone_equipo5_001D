# app/models/__init__.py
from app.db import Base  # noqa: F401

from .region import Region  # noqa: F401
from .comuna import Comuna  # noqa: F401
from .cesfam import Cesfam  # noqa: F401

from .unidad_medida import UnidadMedida  # noqa: F401
from .parametro_clinico import ParametroClinico  # noqa: F401
from .paciente import Paciente  # noqa: F401
from .cuidador import Cuidador  # noqa: F401
from .paciente_cuidador import PacienteCuidador  # noqa: F401
from .rango_paciente import RangoPaciente  # noqa: F401
from .medicion import Medicion, MedicionDetalle  # noqa: F401
