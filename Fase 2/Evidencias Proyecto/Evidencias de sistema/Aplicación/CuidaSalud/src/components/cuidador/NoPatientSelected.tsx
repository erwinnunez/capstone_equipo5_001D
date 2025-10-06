// src/components/cuidador/NoPatientSelected.tsx
import { Card, CardContent } from "../ui/card";
import { Users } from "lucide-react";

export function NoPatientSelected({ message = "Seleccione un paciente para continuar" }: { message?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default NoPatientSelected;
