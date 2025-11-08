// src/components/common/MedicionValidationModal.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, XCircle } from 'lucide-react';
import type { ErrorValidacion } from '../../services/validacionMediciones';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errores: ErrorValidacion[];
  onContinue?: () => void;
  onCancel: () => void;
  titulo?: string;
  mensaje?: string;
  puedeGuardar?: boolean;
  tipoAlerta?: 'error' | 'warning';
}

export default function MedicionValidationModal({
  open,
  onOpenChange,
  errores,
  onContinue,
  onCancel,
  titulo = 'Validación de Mediciones',
  mensaje = '',
  puedeGuardar = false,
  tipoAlerta = 'warning'
}: Props) {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  const handleContinue = () => {
    onOpenChange(false);
    if (onContinue) {
      onContinue();
    }
  };

  if (errores.length === 0) {
    return null;
  }

  const IconComponent = tipoAlerta === 'error' ? XCircle : AlertTriangle;
  const iconColor = tipoAlerta === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{
          position: 'fixed !important',
          top: '50% !important',
          left: '50% !important',
          transform: 'translate(-50%, -50%) !important',
          zIndex: '9999 !important',
          maxWidth: '90vw',
          maxHeight: '90vh',
          margin: '0 !important'
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${iconColor}`} />
            {titulo}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {mensaje && (
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {mensaje}
                </div>
              )}
              
              {/* Lista detallada de errores */}
              <div className="space-y-3">
                {errores.map((error, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      error.tipo === 'fuera_rango_posible' 
                        ? 'bg-red-50 border-red-400' 
                        : error.tipo === 'critico'
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-yellow-50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          error.tipo === 'fuera_rango_posible' 
                            ? 'text-red-700' 
                            : error.tipo === 'critico'
                            ? 'text-orange-700'
                            : 'text-yellow-700'
                        }`}>
                          {error.rango.emoji} {error.rango.nombre}: {error.valor} {error.rango.unidad}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {error.tipo === 'fuera_rango_posible' && (
                            <>Rango aceptado: {error.rango.min_posible} - {error.rango.max_posible} {error.rango.unidad}</>
                          )}
                          {error.tipo === 'critico' && (
                            <>
                              Rango normal: {error.rango.min_normal} - {error.rango.max_normal} {error.rango.unidad}<br/>
                              <span className="text-orange-600">Rango crítico: por debajo de {error.rango.min_critico} o por encima de {error.rango.max_critico} {error.rango.unidad}</span>
                            </>
                          )}
                          {error.tipo === 'warning' && (
                            <>Rango normal: {error.rango.min_normal} - {error.rango.max_normal} {error.rango.unidad}</>
                          )}
                        </div>
                        <div className="text-xs mt-1 text-gray-700">
                          {error.tipo === 'fuera_rango_posible' && '⚠️ Valor fuera del rango válido - verificar entrada'}
                          {error.tipo === 'critico' && '🚨 Valor en rango crítico - requiere atención médica inmediata'}
                          {error.tipo === 'warning' && '💡 Valor fuera del rango normal - considerar consulta médica'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div className="text-xs text-gray-500 border-t pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>📊 Rangos de referencia:</strong>
                    <div className="ml-2 space-y-1">
                      <div>• Normal: Valores dentro del rango estándar</div>
                      <div>• Crítico: Requiere atención médica</div>
                      <div>• Fuera de rango: Valores imposibles o erróneos</div>
                    </div>
                  </div>
                  <div>
                    <strong>⚕️ Recomendación:</strong>
                    <div className="ml-2">
                      {errores.some(e => e.tipo === 'fuera_rango_posible') && 
                        'Corrija los valores antes de continuar'
                      }
                      {errores.some(e => e.tipo === 'critico') && !errores.some(e => e.tipo === 'fuera_rango_posible') && 
                        'Consulte con un médico por los valores críticos'
                      }
                      {errores.every(e => e.tipo === 'warning') && 
                        'Monitoree estos valores y consulte si persisten'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {puedeGuardar ? 'Cancelar' : 'Entendido'}
          </AlertDialogCancel>
          
          {puedeGuardar && onContinue && (
            <AlertDialogAction 
              onClick={handleContinue}
              className={
                tipoAlerta === 'error' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }
            >
              Guardar de todas formas
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}