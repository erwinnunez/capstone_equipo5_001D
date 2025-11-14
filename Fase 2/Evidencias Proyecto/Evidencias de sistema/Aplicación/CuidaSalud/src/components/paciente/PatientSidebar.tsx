// src/components/paciente/PatientSidebar.tsx
import { Button } from "../ui/button";
import { Award, Plus, TrendingUp, Star, Pill, User } from "lucide-react";

export type SectionKey = "home" | "measurements" | "progress" | "achievements" | "medication" | "edit";

export function PatientSidebar({
  current,
  onSelect,
}: {
  current: SectionKey;
  onSelect: (s: SectionKey) => void;
}) {
  const Item = ({ k, icon: Icon, label }: { k: SectionKey; icon: any; label: string }) => (
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
      <Item k="home" icon={Star} label="Dashboard" />
      <Item k="measurements" icon={Plus} label="Agregar medición" />
      <Item k="progress" icon={TrendingUp} label="Mi Progreso" />
      <Item k="medication" icon={Pill} label="Medicaciones" />
      <Item k="achievements" icon={Award} label="Logros" />
      <Item k="edit" icon={User} label="Editar perfil" />
    </nav>
  );
}
