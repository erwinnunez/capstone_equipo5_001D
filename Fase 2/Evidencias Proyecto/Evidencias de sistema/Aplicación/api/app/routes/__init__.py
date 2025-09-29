# app/routes/__init__.py

from .region import router as region_router
from .comuna import router as comuna_router
from .cesfam import router as cesfam_router

from .unidad_medida import router as unidad_medida_router
from .parametro_clinico import router as parametro_clinico_router
from .paciente import router as paciente_router
from .cuidador import router as cuidador_router
from .paciente_cuidador import router as paciente_cuidador_router
from .medicion import router as medicion_router

ALL_ROUTERS = [
    region_router,
    comuna_router,
    cesfam_router,
    unidad_medida_router,
    parametro_clinico_router,
    paciente_router,
    cuidador_router,
    paciente_cuidador_router,
    medicion_router,
]
