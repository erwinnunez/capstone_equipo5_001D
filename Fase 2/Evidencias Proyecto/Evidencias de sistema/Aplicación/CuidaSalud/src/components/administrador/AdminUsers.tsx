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

  // Helpers (una sola definición)
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
          System Users
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate role permissions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: string) => setNewUser({ ...newUser, role: value })} // <- TIPADO AQUÍ
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Password</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter initial password"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterRole} onValueChange={(value: string) => setFilterRole(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="caregiver">Caregivers</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
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
                  <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
