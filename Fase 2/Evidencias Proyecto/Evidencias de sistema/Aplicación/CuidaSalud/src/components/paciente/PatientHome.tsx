// src/components/paciente/PatientHome.tsx
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Heart, Thermometer, Droplets, Star, Target } from 'lucide-react';

import {
  listMediciones,
  listMedicionDetalles,
  type MedicionOut,
  type MedicionDetalleOut,
} from '../../services/paciente';

import {
  listParametrosClinicos,
  type ParametroClinicoOut,
} from '../../services/parametroClinico';

type UserLike = {
  name: string;
  rutPaciente?: number;
};

export default function PatientHome({
  user,
  totalPoints,
  currentStreak,
}: {
  user: UserLike;
  totalPoints: number;
  currentStreak: number;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [params, setParams] = useState<ParametroClinicoOut[]>([]);
  const [lastMed, setLastMed] = useState<MedicionOut | null>(null);

  // -------- 1) Cargar parámetros UNA VEZ --------
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const p = await listParametrosClinicos({ page_size: 100 });
        if (!ignore) setParams(p.items ?? []);
      } catch {
        // si falla, seguimos; luego habrá fallbacks
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // índice por código (memo sobre params)
  const P = useMemo(() => {
    const byCode: Record<string, ParametroClinicoOut> = {};
    for (const it of params) if (it?.codigo) byCode[it.codigo.toUpperCase()] = it;
    return {
      byCode,
      GLUCOSA: byCode['GLUCOSA'],
      PRESION_SIS: byCode['PRESION'],
      PRESION_DIA: byCode['PRESION_DIAST'],
      OXIGENO: byCode['OXIGENO'],
      TEMP: byCode['TEMP'],
    };
  }, [params]);

  const paramsReady = params.length > 0;

  const [view, setView] = useState({
    glucosa: '--',
    presion: '--/--',
    spo2: '--%',
    temp: '-- °C',
  });

  // -------- 2) Cargar la ÚLTIMA medición (cuando hay rut y params listos) --------
  useEffect(() => {
    if (!user?.rutPaciente || !paramsReady) return;

    let ignore = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // última medición del paciente
        const meds = await listMediciones({
          rut_paciente: user.rutPaciente ? String(user.rutPaciente) : undefined,
          page: 1,
          page_size: 1,
        });

        const last = meds.items?.[0] ?? null;
        if (ignore) return;

        setLastMed(last);

        if (!last) {
          setView({ glucosa: '--', presion: '--/--', spo2: '--%', temp: '-- °C' });
          return;
        }

        // detalles de esa medición
        const detRes = await listMedicionDetalles({
          id_medicion: last.id_medicion,
          page: 1,
          page_size: 100,
        });
        if (ignore) return;

        const rows = detRes.items ?? [];
        const byParam: Record<number, MedicionDetalleOut> = {};
        for (const d of rows) byParam[d.id_parametro] = d;

        const getTxt = (d?: MedicionDetalleOut, fallbackUnit = '') => {
          if (!d) return null;
          const txt = (d.valor_texto ?? '').trim();
          if (txt) return txt;
          return `${d.valor_num ?? '-'} ${fallbackUnit}`.trim();
        };

        const glucTxt = getTxt(P.GLUCOSA ? byParam[P.GLUCOSA.id_parametro] : undefined, 'mg/dL') ?? '--';

        const sysTxt = getTxt(P.PRESION_SIS ? byParam[P.PRESION_SIS.id_parametro] : undefined, 'mmHg') ?? '--';
        const diaTxt = getTxt(P.PRESION_DIA ? byParam[P.PRESION_DIA.id_parametro] : undefined, 'mmHg') ?? '--';

        const onlyNum = (s: string) => String(s).replace(/[^\d.,-]/g, '');
        const sysNum = sysTxt !== '--' ? onlyNum(sysTxt) : '--';
        const diaNum = diaTxt !== '--' ? onlyNum(diaTxt) : '--';
        const presionTxt =
          sysNum !== '--' && diaNum !== '--' ? `${sysNum}/${diaNum}` : `${sysTxt}/${diaTxt}`;

        const spo2Txt = getTxt(P.OXIGENO ? byParam[P.OXIGENO.id_parametro] : undefined, '%') ?? '--%';
        const tempTxt = getTxt(P.TEMP ? byParam[P.TEMP.id_parametro] : undefined, '°C') ?? '-- °C';

        if (!ignore) {
          setView({
            glucosa: glucTxt,
            presion: presionTxt,
            spo2: spo2Txt,
            temp: tempTxt,
          });
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message ?? 'No se pudo cargar la última medición');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [user?.rutPaciente, paramsReady]); // << solo depende del rut y de que los params estén listos

  const renderSub = () => {
    if (loading) return 'Cargando…';
    if (err) return err;
    if (lastMed) return new Date(lastMed.fecha_registro).toLocaleString('es-CL');
    return 'Sin registros';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Bienvenido de nuevo, {user.name}!</h2>
        <p className="text-blue-100">Continúe con el excelente trabajo de monitoreo de su salud.</p>
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            <span>{totalPoints} Puntos</span>
          </div>
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            <span>{currentStreak} Racha de días</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Glucemia</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : view.glucosa}</div>
            <p className="text-xs text-muted-foreground">{renderSub()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presión arterial</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-/-' : view.presion}</div>
            <p className="text-xs text-muted-foreground">{renderSub()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel de oxígeno</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-%' : view.spo2}</div>
            <p className="text-xs text-muted-foreground">{renderSub()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '- °C' : view.temp}</div>
            <p className="text-xs text-muted-foreground">{renderSub()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
