// /components/ui/dialog-grande.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "./utils";

/**
 * DialogGrande - Variación del DialogContent pensada para ocupar más ancho
 * y una altura controlada. No modifica el dialog original; es un componente
 * independiente que puedes usar solo donde quieras.
 *
 * Importante: exportamos solo lo necesario (DialogContentGrande) para no colapsar
 * con las exportaciones del dialog original.
 */

export type DialogContentGrandeProps = React.ComponentProps<typeof DialogPrimitive.Content>;

export function DialogContentGrande({
  className,
  children,
  ...props
}: DialogContentGrandeProps) {
const defaultClasses = [
  "bg-background",
  "fixed",
  "top-[50%]",
  "left-[50%]",
  "z-50",
  "grid",
  "translate-x-[-50%]",
  "translate-y-[-50%]",

  // 🔹 En pantallas chicas → 95% del ancho
  "w-[95vw]",
  "max-w-[95vw]",

  // 🔹 Desde tamaño md (laptops) → 80%
  "md:w-[80vw]",
  "md:max-w-[80vw]",

  // 🔹 En pantallas grandes → 70%
  "lg:w-[70vw]",
  "lg:max-w-[70vw]",

  "rounded-lg",
  "border",
  "p-6",
  "shadow-lg",
  "duration-200",
].join(" ");

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out",
        )}
      />
      <DialogPrimitive.Content
        className={cn(defaultClasses, className)}
        {...props}
      >
        {/* ✅ Contenido scrolleable */}
        <div className="flex flex-col max-h-[65vh] overflow-y-auto overflow-x-hidden pr-2">
          {children}
        </div>

        <DialogPrimitive.Close
          className={cn(
            "absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
          )}
          aria-label="Close"
        >
          <XIcon />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
