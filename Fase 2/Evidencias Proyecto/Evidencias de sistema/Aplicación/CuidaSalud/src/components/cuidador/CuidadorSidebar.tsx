// src/components/cuidador/CuidadorSidebar.tsx
import { Button } from "../ui/button";
import { Users, Plus, Bell, Settings, UserCog, Calendar } from "lucide-react";

export type CareSection =
  | "patients"
  | "dataEntry"
  | "notifications"
  | "management"
  | "checklist"
  | "preferences";

export default function CuidadorSidebar({
  current,
  onSelect,
}: {
  current: CareSection;
  onSelect: (s: CareSection) => void;
}) {
  return (
    <nav className="space-y-2">
      <Button variant={current === "patients" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("patients")}>
        <Users className="h-4 w-4 mr-2" />
        My Patients
      </Button>

      <Button variant={current === "dataEntry" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("dataEntry")}>
        <Plus className="h-4 w-4 mr-2" />
        Add Data
      </Button>

      <Button variant={current === "notifications" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("notifications")}>
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </Button>

      <Button variant={current === "management" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("management")}>
        <UserCog className="h-4 w-4 mr-2" />
        Patient Management
      </Button>

      <Button variant={current === "checklist" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("checklist")}>
        <Calendar className="h-4 w-4 mr-2" />
        Daily Checklist
      </Button>

      <Button variant={current === "preferences" ? "default" : "ghost"} className="w-full justify-start" onClick={() => onSelect("preferences")}>
        <Settings className="h-4 w-4 mr-2" />
        Preferences
      </Button>
    </nav>
  );
}
