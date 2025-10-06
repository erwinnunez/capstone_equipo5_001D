// src/components/administrador/AdminUsers.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Filter, Users as UsersIcon, UserPlus, Edit, Trash2 } from "lucide-react";
import { systemUsers } from "../../data/adminMock";

type RoleVariant = "default" | "secondary" | "destructive" | "outline";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "", password: "" });

  // Helpers (colores)
  const getStatusColor = (status: string): RoleVariant => (status === "active" ? "outline" : "secondary");
  const getRoleColor = (role: string): RoleVariant => {
    switch (role) {
      case "admin":
        return "destructive";
      case "doctor":
        return "default";
      case "caregiver":
        return "secondary";
      case "patient":
        return "outline";
      default:
        return "outline";
    }
  };

  // Helpers (etiquetas visibles en español)
  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "doctor":
        return "Médico";
      case "caregiver":
        return "Cuidador";
      case "patient":
        return "Paciente";
      default:
        return role;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "blocked":
        return "Bloqueado";
      default:
        return status;
    }
  };

  const filteredUsers = systemUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    console.log("Creating user:", newUser);
    setIsCreateUserOpen(false);
    setNewUser({ name: "", email: "", role: "", password: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usuarios del sistema
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo usuario</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo usuario al sistema con los permisos de rol correspondientes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Ingresa el nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Ingresa el correo electrónico"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: string) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Médico</SelectItem>
                      <SelectItem value="caregiver">Cuidador</SelectItem>
                      <SelectItem value="patient">Paciente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña inicial</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Ingresa la contraseña inicial"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>Crear usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Administra cuentas, roles y permisos</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterRole} onValueChange={(value: string) => setFilterRole(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="doctor">Médicos</SelectItem>
              <SelectItem value="caregiver">Cuidadores</SelectItem>
              <SelectItem value="patient">Pacientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">Último acceso: {user.lastLogin}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant={getRoleColor(user.role)}>{roleLabel(user.role)}</Badge>
                <Badge variant={getStatusColor(user.status)}>{statusLabel(user.status)}</Badge>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" aria-label="Editar usuario">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Eliminar usuario">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
