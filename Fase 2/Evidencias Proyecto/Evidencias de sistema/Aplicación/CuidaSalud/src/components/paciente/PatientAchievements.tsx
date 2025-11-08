// src/components/paciente/PatientAchievements.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Award, AlertCircle } from 'lucide-react';
import { getAllInsignias, getInsigniasGanadasPorPaciente, type InsigniaOut } from '../../services/insignia';

interface Props {
  rutPaciente?: string; // Opcional, si no se proporciona se obtiene del localStorage
}

interface InsigniaDisplay extends InsigniaOut {
  earned: boolean;
  earnedDate?: string;
  icon: string;
}

export default function PatientAchievements({ rutPaciente }: Props) {
  const [insignias, setInsignias] = useState<InsigniaDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener RUT del paciente desde localStorage si no se proporciona como prop
  const getRutPaciente = (): string | null => {
    if (rutPaciente) {
      return rutPaciente;
    }
    
    // Obtener del localStorage (usuario autenticado)
    const authDataString = localStorage.getItem("auth");
    const authData = authDataString ? JSON.parse(authDataString) : null;
    return authData?.user?.id || null;
  };

  // Función para mapear código de insignia a icono
  const getInsigniaIcon = (codigo: number): string => {
    switch (codigo) {
      case 100:
        return '🎯'; // Primer Log/Medición
      case 200:
        return '🔥'; // Constante (7 días de racha)
      case 300:
        return '💪'; // Fuerza (30 días)
      case 400:
        return '👑'; // Maestro (100 días)
      case 500:
        return '⭐'; // Estrella (mediciones perfectas)
      default:
        return '🏅'; // Insignia genérica
    }
  };

  // Función para cargar insignias desde la API
  const loadInsignias = async () => {
    const rut = getRutPaciente();
    
    if (!rut) {
      console.warn('[PatientAchievements] No se pudo obtener RUT del paciente (ni como prop ni desde localStorage)');
      setError('No se pudo identificar al paciente');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🏅 [PatientAchievements] Cargando insignias para paciente ${rut}`);

      // Cargar tanto las insignias disponibles como las ganadas por el paciente
      const [insigniasResult, insigniasGanadasResult] = await Promise.all([
        getAllInsignias(),
        getInsigniasGanadasPorPaciente(rut)
      ]);

      // Verificar si ambas llamadas fueron exitosas
      if (!insigniasResult.success) {
        setError(insigniasResult.error || 'Error al cargar insignias disponibles');
        return;
      }

      if (!insigniasGanadasResult.success) {
        console.warn('[PatientAchievements] Error al cargar insignias ganadas, mostrando solo disponibles:', insigniasGanadasResult.error);
        // No es error crítico, continuar sin insignias ganadas
      }

      const todasLasInsignias = insigniasResult.data || [];
      const insigniasGanadas = insigniasGanadasResult.success ? insigniasGanadasResult.data || [] : [];

      // Crear un Set de IDs de insignias ganadas para búsqueda rápida
      const insigniasGanadasIds = new Set(insigniasGanadas.map(ig => ig.id_insignia));
      
      // Crear un mapa de fechas de otorgación
      const fechasOtorgacion = new Map(
        insigniasGanadas.map(ig => [ig.id_insignia, ig.otorgada_en])
      );

      // Combinar insignias disponibles con estado de ganadas
      const insigniasDisplay: InsigniaDisplay[] = todasLasInsignias.map(insignia => ({
        ...insignia,
        earned: insigniasGanadasIds.has(insignia.id_insignia),
        earnedDate: fechasOtorgacion.get(insignia.id_insignia),
        icon: getInsigniaIcon(insignia.codigo)
      }));

      setInsignias(insigniasDisplay);
      console.log(`✅ [PatientAchievements] Cargadas ${insigniasDisplay.length} insignias para ${rut} (${insigniasGanadas.length} ganadas)`);
    } catch (error) {
      console.error('Error cargando insignias:', error);
      setError('Error de conexión al cargar insignias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsignias();
  }, [rutPaciente]); // Re-ejecutar si cambia el RUT proporcionado como prop

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus logros</CardTitle>
          <CardDescription>Desbloquea insignias manteniendo hábitos saludables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando insignias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus logros</CardTitle>
          <CardDescription>Desbloquea insignias manteniendo hábitos saludables</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Tus logros
        </CardTitle>
        <CardDescription>
          Desbloquea insignias manteniendo hábitos saludables ({insignias.filter(i => i.earned).length} de {insignias.length} ganadas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insignias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay insignias disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insignias.map((achievement) => (
              <div
                key={achievement.id_insignia}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  achievement.earned 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${achievement.earned ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.earned ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.nombre_insignia}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {achievement.descipcion}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Código: {achievement.codigo}
                    </p>
                    {achievement.earned && achievement.earnedDate && (
                      <p className="text-xs text-green-600 mt-1">
                        Ganado: {new Date(achievement.earnedDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Ganado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
