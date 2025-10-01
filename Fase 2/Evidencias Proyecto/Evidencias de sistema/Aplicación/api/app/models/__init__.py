# Mantén este archivo actualizado para garantizar que SQLAlchemy/Alembic
# carguen todo el grafo de modelos y sus relaciones.

from .region import Region  # noqa: F401
from .comuna import Comuna  # noqa: F401
from .cesfam import Cesfam  # noqa: F401

from .paciente import Paciente  # noqa: F401
from .paciente_cesfam import PacienteCesfam  # noqa: F401
from .paciente_cuidador import PacienteCuidador  # noqa: F401
from .paciente_historial import PacienteHistorial  # noqa: F401

from .cuidador import Cuidador  # noqa: F401
from .cuidador_historial import CuidadorHistorial  # noqa: F401

from .equipo_medico import EquipoMedico  # noqa: F401
from .medico_historial import MedicoHistorial  # noqa: F401

from .unidad_medida import UnidadMedida  # noqa: F401
from .parametro_clinico import ParametroClinico  # noqa: F401

from .medicion import Medicion  # noqa: F401
from .medicion_detalle import MedicionDetalle  # noqa: F401
from .rango_paciente import RangoPaciente  # noqa: F401

from .nota_clinica import NotaClinica  # noqa: F401

from .gamificacion_perfil import GamificacionPerfil  # noqa: F401
from .evento_gamificacion import EventoGamificacion  # noqa: F401

from .insignia import Insignia  # noqa: F401
from .usuario_insignia import UsuarioInsignia  # noqa: F401

from .solicitud_reporte import SolicitudReporte  # noqa: F401
from .descarga_reporte import DescargaReporte  # noqa: F401
