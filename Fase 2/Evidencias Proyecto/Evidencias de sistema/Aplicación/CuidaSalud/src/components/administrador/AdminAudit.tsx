// src/components/admin/AdminAudit.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPacienteHistorial } from '../../services/paciente';
import { getMedicoHistorial } from '../../services/equipoMedico';
import { getCuidadorHistorial } from '../../services/cuidador';
import * as XLSX from 'xlsx';

type UserType = 'pacientes' | 'medicos' | 'cuidadores';

interface AuditLog {
  historial_id: number;
  fecha_cambio: string;
  cambio: string;
  resultado: boolean;
  rut_paciente?: string;
  rut_medico?: string;
  rut_cuidador?: string;
}

interface ApiResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}

export default function AdminAudit() {
  const [userType, setUserType] = useState<UserType>('pacientes');
  const [rutSearch, setRutSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  const loadLogsByUserType = useCallback(async (selectedUserType: UserType, rut?: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let response: ApiResponse;
      const searchParams = {
        page: page,
        page_size: pageSize,
        ...(rut && {
          [`rut_${selectedUserType.slice(0, -1)}`]: rut
        })
      };

      switch (selectedUserType) {
        case 'pacientes':
          response = await getPacienteHistorial(searchParams) as ApiResponse;
          break;
        case 'medicos':
          response = await getMedicoHistorial({
            ...searchParams,
            rut_medico: rut || undefined
          }) as ApiResponse;
          break;
        case 'cuidadores':
          response = await getCuidadorHistorial({
            ...searchParams,
            rut_cuidador: rut || undefined
          }) as ApiResponse;
          break;
        default:
          throw new Error('Tipo de usuario no válido');
      }

      if (response && response.items) {
        setAuditLogs(response.items);
        setTotalRecords(response.total);
        setCurrentPage(page);
      } else {
        setError('No se pudieron cargar los logs de auditoría');
      }
    } catch (err) {
      console.error('Error al buscar logs:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Cargar logs automáticamente cuando cambia el tipo de usuario
  useEffect(() => {
    loadLogsByUserType(userType, rutSearch, 1);
  }, [userType, loadLogsByUserType]);

  const handleSearch = useCallback(async () => {
    loadLogsByUserType(userType, rutSearch, 1);
  }, [userType, rutSearch, loadLogsByUserType]);

  const handleUserTypeChange = (newUserType: UserType) => {
    setUserType(newUserType);
    setRutSearch(''); // Limpiar el campo RUT al cambiar tipo de usuario
    setCurrentPage(1); // Resetear a la primera página
    // El useEffect se encargará de cargar los logs automáticamente
  };

  const handlePageChange = (newPage: number) => {
    loadLogsByUserType(userType, rutSearch, newPage);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const exportToExcel = useCallback(async () => {
    try {
      // Obtener todos los registros (sin paginación para exportar todo)
      let allResponse: ApiResponse;
      const allParams = {
        page: 1,
        page_size: totalRecords || 1000, // Obtener todos los registros
        ...(rutSearch && {
          [`rut_${userType.slice(0, -1)}`]: rutSearch
        })
      };

      switch (userType) {
        case 'pacientes':
          allResponse = await getPacienteHistorial(allParams) as ApiResponse;
          break;
        case 'medicos':
          allResponse = await getMedicoHistorial({
            ...allParams,
            rut_medico: rutSearch || undefined
          }) as ApiResponse;
          break;
        case 'cuidadores':
          allResponse = await getCuidadorHistorial({
            ...allParams,
            rut_cuidador: rutSearch || undefined
          }) as ApiResponse;
          break;
        default:
          throw new Error('Tipo de usuario no válido');
      }

      if (!allResponse || !allResponse.items) {
        alert('No hay datos para exportar');
        return;
      }

      // Preparar los datos para Excel
      const excelData = allResponse.items.map((log, index) => ({
        'N°': index + 1,
        'ID Historial': log.historial_id,
        'RUT': getRutFromLog(log),
        'Tipo Usuario': userType.slice(0, -1).charAt(0).toUpperCase() + userType.slice(1, -1),
        'Descripción del Cambio': log.cambio,
        'Resultado': log.resultado ? 'Exitoso' : 'Fallido',
        'Fecha y Hora': new Date(log.fecha_cambio).toLocaleString('es-CL')
      }));

      // Crear el libro de Excel
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      
      // Configurar el ancho de las columnas
      const colWidths = [
        { wch: 5 },   // N°
        { wch: 15 },  // ID Historial
        { wch: 15 },  // RUT
        { wch: 15 },  // Tipo Usuario
        { wch: 50 },  // Descripción
        { wch: 10 },  // Resultado
        { wch: 20 }   // Fecha
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Logs de Auditoría');

      // Generar el nombre del archivo
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `logs_auditoria_${userType}_${dateStr}_${timeStr}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al generar el archivo Excel');
    }
  }, [userType, rutSearch, totalRecords]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRutFromLog = (log: AuditLog) => {
    return log.rut_paciente || log.rut_medico || log.rut_cuidador || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Logs de Auditoría</CardTitle>
          <CardDescription>
            Al seleccionar un tipo de usuario se cargan automáticamente todos sus logs. Use el campo RUT para filtrar por un usuario específico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="userType" className="block text-sm font-medium mb-2">
                Tipo de Usuario
              </label>
              <Select value={userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pacientes">Pacientes</SelectItem>
                  <SelectItem value="medicos">Médicos</SelectItem>
                  <SelectItem value="cuidadores">Cuidadores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="rutSearch" className="block text-sm font-medium mb-2">
                RUT (Opcional)
              </label>
              <Input
                id="rutSearch"
                type="text"
                placeholder="Ej: 12345678-9"
                value={rutSearch}
                onChange={(e) => setRutSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Registro de auditoría
            <Button 
              variant="outline" 
              size="sm" 
              aria-label="Exportar registros"
              onClick={exportToExcel}
              disabled={auditLogs.length === 0 || loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar registros
            </Button>
          </CardTitle>
          <CardDescription>
            Registro de actividad del sistema y eventos de seguridad
            {totalRecords > 0 && ` - ${totalRecords} registros encontrados - Página ${currentPage} de ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {auditLogs.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron logs de auditoría para {userType}
              {rutSearch && ` con RUT: ${rutSearch}`}
            </div>
          )}
          
          {auditLogs.length > 0 && (
            <>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.historial_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">RUT: {getRutFromLog(log)}</span>
                        <span className="text-sm text-gray-600 capitalize">{userType.slice(0, -1)}</span>
                        {log.resultado && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Exitoso
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{log.cambio}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.fecha_cambio).toLocaleString('es-CL')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalRecords)} de {totalRecords} registros
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevPage || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage || loading}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Cargando logs...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
