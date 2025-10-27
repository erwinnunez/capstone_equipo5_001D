// src/components/common/ErrorAlertModal.tsx
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export interface ErrorAlertModalProps {
    open: boolean;
    title?: string;
    message?: string;
    onClose: () => void;
}

export function ErrorAlertModal({
    open,
    title = "Error en el formulario",
    message = "Se produjo un error.",
    onClose,
}: ErrorAlertModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader className="items-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <div className="w-full flex justify-center">
                        <Button variant="destructive" onClick={onClose}>
                            Entendido
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}

export default ErrorAlertModal;
