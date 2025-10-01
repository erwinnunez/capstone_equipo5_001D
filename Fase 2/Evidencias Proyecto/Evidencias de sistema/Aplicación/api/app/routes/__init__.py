from .region import router as region_router
from .comuna import router as comuna_router
from .cesfam import router as cesfam_router

from .paciente import router as paciente_router
from .paciente_cesfam import router as paciente_cesfam_router
from .paciente_cuidador import router as paciente_cuidador_router
from .paciente_historial import router as paciente_historial_router

from .cuidador import router as cuidador_router
from .cuidador_historial import router as cuidador_historial_router

from .equipo_medico import router as equipo_medico_router
from .medico_historial import router as medico_historial_router

from .unidad_medida import router as unidad_medida_router
from .parametro_clinico import router as parametro_clinico_router

from .medicion import router as medicion_router
from .medicion_detalle import router as medicion_detalle_router
from .rango_paciente import router as rango_paciente_router

from .nota_clinica import router as nota_clinica_router

from .gamificacion_perfil import router as gamificacion_perfil_router
from .evento_gamificacion import router as evento_gamificacion_router

from .insignia import router as insignia_router
from .usuario_insignia import router as usuario_insignia_router

from .solicitud_reporte import router as solicitud_reporte_router
from .descarga_reporte import router as descarga_reporte_router

ALL_ROUTERS = [
    region_router,
    comuna_router,
    cesfam_router,
    paciente_router,
    paciente_cesfam_router,
    paciente_cuidador_router,
    paciente_historial_router,
    cuidador_router,
    cuidador_historial_router,
    equipo_medico_router,
    medico_historial_router,
    unidad_medida_router,
    parametro_clinico_router,
    medicion_router,
    medicion_detalle_router,
    rango_paciente_router,
    nota_clinica_router,
    gamificacion_perfil_router,
    evento_gamificacion_router,
    insignia_router,
    usuario_insignia_router,
    solicitud_reporte_router,
    descarga_reporte_router,
]
