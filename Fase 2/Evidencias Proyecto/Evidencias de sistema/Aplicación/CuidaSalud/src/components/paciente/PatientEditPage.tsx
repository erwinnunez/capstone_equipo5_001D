import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getPacienteByRut, updatePaciente } from "../../services/paciente";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import MultiEnfermedadesSelect from "./MultiEnfermedadesSelect";

// Campos principales para edición
const initialForm = {
  primer_nombre_paciente: "",
  segundo_nombre_paciente: "",
  primer_apellido_paciente: "",
  segundo_apellido_paciente: "",
  telefono: "",
  email: "",
  contrasena: "",
  enfermedades: "",
  nombre_contacto: "",
  telefono_contacto: "",
  contrasena_actual: "",
  contrasena_nueva: "",
};

export default function PatientEditPage({ rutPaciente }: { rutPaciente: string }) {
  const [form, setForm] = useState(initialForm);
  const [originalData, setOriginalData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cargar datos actuales del paciente al montar
  useEffect(() => {
    if (!rutPaciente) return;
    setLoadingData(true);
    getPacienteByRut(rutPaciente).then((res) => {
      if (res.ok && res.data) {
        setForm((prev) => ({
          ...prev,
          primer_nombre_paciente: res.data.primer_nombre_paciente ?? "",
          segundo_nombre_paciente: res.data.segundo_nombre_paciente ?? "",
          primer_apellido_paciente: res.data.primer_apellido_paciente ?? "",
          segundo_apellido_paciente: res.data.segundo_apellido_paciente ?? "",
          telefono: res.data.telefono?.toString() ?? "",
          email: res.data.email ?? "",
          enfermedades: res.data.enfermedades ?? "",
          nombre_contacto: res.data.nombre_contacto ?? "",
          telefono_contacto: res.data.telefono_contacto?.toString() ?? "",
        }));
        setOriginalData({
          primer_nombre_paciente: res.data.primer_nombre_paciente ?? "",
          segundo_nombre_paciente: res.data.segundo_nombre_paciente ?? "",
          primer_apellido_paciente: res.data.primer_apellido_paciente ?? "",
          segundo_apellido_paciente: res.data.segundo_apellido_paciente ?? "",
          telefono: res.data.telefono?.toString() ?? "",
          email: res.data.email ?? "",
          enfermedades: res.data.enfermedades ?? "",
          nombre_contacto: res.data.nombre_contacto ?? "",
          telefono_contacto: res.data.telefono_contacto?.toString() ?? "",
        });
      }
    }).finally(() => setLoadingData(false));
  }, [rutPaciente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleEnfermedadesChange = (arr: string[]) => {
    setForm({ ...form, enfermedades: arr.join(",") });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Solo enviar los datos modificados, incluyendo contraseña si corresponde
    try {
      // Solo enviar los campos que han cambiado
      const payload: any = {};
      Object.keys(originalData).forEach((key) => {
        if ((form as any)[key] !== (originalData as any)[key]) {
          payload[key] = (form as any)[key];
        }
      });
      // Siempre enviar las contraseñas si el usuario las ingresa, usando los nombres correctos
      if (form.contrasena_nueva) {
        payload.new_password = form.contrasena_nueva;
        payload.current_password = form.contrasena_actual;
      }
      console.log('Payload enviado a la API:', payload);
      // Si solo se está cambiando la contraseña, permitir el envío
      if (Object.keys(payload).length === 0 && !form.contrasena_nueva) {
        setError('No se han realizado cambios.');
        setLoading(false);
        return;
      }
      await updatePaciente(rutPaciente, payload);
      setShowSuccessModal(true);
      setSuccess(true);
    } catch (err: any) {
      // Si el error es 'Failed to fetch', no mostrarlo en el modal
      if (err.message === 'Failed to fetch') {
        setError('');
      } else {
        setError(err.message);
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección de bienvenida y ayuda */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-2">Editar datos personales</h2>
        <p className="text-blue-100">Actualiza tu información personal y de contacto. Recuerda mantener tus datos al día para una mejor atención.</p>
      </div>

      {/* Card de edición de datos */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Formulario de edición</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center text-blue-600">Cargando datos...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="primer_nombre_paciente" className="mb-1 font-medium text-gray-700">Primer nombre</label>
                  <Input name="primer_nombre_paciente" id="primer_nombre_paciente" value={form.primer_nombre_paciente} onChange={handleChange} placeholder="Primer nombre" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="segundo_nombre_paciente" className="mb-1 font-medium text-gray-700">Segundo nombre</label>
                  <Input name="segundo_nombre_paciente" id="segundo_nombre_paciente" value={form.segundo_nombre_paciente} onChange={handleChange} placeholder="Segundo nombre" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="primer_apellido_paciente" className="mb-1 font-medium text-gray-700">Primer apellido</label>
                  <Input name="primer_apellido_paciente" id="primer_apellido_paciente" value={form.primer_apellido_paciente} onChange={handleChange} placeholder="Primer apellido" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="segundo_apellido_paciente" className="mb-1 font-medium text-gray-700">Segundo apellido</label>
                  <Input name="segundo_apellido_paciente" id="segundo_apellido_paciente" value={form.segundo_apellido_paciente} onChange={handleChange} placeholder="Segundo apellido" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="telefono" className="mb-1 font-medium text-gray-700">Teléfono</label>
                  <Input name="telefono" id="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="mb-1 font-medium text-gray-700">Correo electrónico</label>
                  <Input name="email" id="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="nombre_contacto" className="mb-1 font-medium text-gray-700">Nombre contacto</label>
                  <Input name="nombre_contacto" id="nombre_contacto" value={form.nombre_contacto} onChange={handleChange} placeholder="Nombre contacto" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="telefono_contacto" className="mb-1 font-medium text-gray-700">Teléfono contacto</label>
                  <Input name="telefono_contacto" id="telefono_contacto" value={form.telefono_contacto} onChange={handleChange} placeholder="Teléfono contacto" />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="enfermedades" className="mb-1 font-medium text-gray-700">Enfermedades (puede seleccionar varias)</label>
                <MultiEnfermedadesSelect
                  value={form.enfermedades ? form.enfermedades.split(",") : []}
                  onChange={handleEnfermedadesChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="contrasena_actual" className="mb-1 font-medium text-gray-700">Contraseña actual</label>
                  <Input name="contrasena_actual" id="contrasena_actual" type="password" value={form.contrasena_actual} onChange={handleChange} placeholder="Contraseña actual" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="contrasena_nueva" className="mb-1 font-medium text-gray-700">Nueva contraseña</label>
                  <Input name="contrasena_nueva" id="contrasena_nueva" type="password" value={form.contrasena_nueva} onChange={handleChange} placeholder="Nueva contraseña" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-2 px-4 rounded border border-gray-900 shadow"
                style={{ backgroundColor: '#000' }}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
              {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
              {success && <div className="text-green-600 mt-2 text-center">Datos actualizados correctamente</div>}
            </form>
          )}
        </CardContent>
      </Card>
      {/* Modal de error de contraseña */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña incorrecta</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 text-center py-4">La contraseña actual ingresada es incorrecta. No se pudo cambiar la contraseña.</div>
          <Button onClick={() => setShowErrorModal(false)} className="w-full mt-2">Cerrar</Button>
        </DialogContent>
      </Dialog>
      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambios guardados</DialogTitle>
          </DialogHeader>
          <div className="text-green-600 text-center py-4">Tus datos se han actualizado correctamente.</div>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full mt-2">Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
