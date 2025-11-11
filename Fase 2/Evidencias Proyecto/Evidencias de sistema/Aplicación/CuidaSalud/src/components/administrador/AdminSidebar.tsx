// src/components/admin/AdminSidebar.tsx
import { Button } from "../ui/button";
import { Shield, Users, Eye } from "lucide-react";

export type AdminSection = "overview" | "users" | "analytics" | "audit";

export default function AdminSidebar({
  current,
  onSelect,
}: {
  current: AdminSection;
  onSelect: (s: AdminSection) => void;
}) {
  const Item = ({ k, icon: Icon, label }: { k: AdminSection; icon: any; label: string }) => (
    <Button
      variant={current === k ? "default" : "ghost"}
      className="w-full justify-start"
      onClick={() => onSelect(k)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <nav className="space-y-2">
      <Item k="overview"  icon={Shield}  label="Visualización de sistema" />
      <Item k="users"     icon={Users}   label="Usuarios" />
      <Item k="audit"     icon={Eye}     label="Auditoria de logs" />
      <Item k="analytics" icon={Shield}  label="Analítica de sistema" />
    </nav>
  );
}
