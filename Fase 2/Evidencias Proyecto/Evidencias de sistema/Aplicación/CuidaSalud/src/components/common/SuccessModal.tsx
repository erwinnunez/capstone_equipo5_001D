import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export interface SuccessModalProps {
    open: boolean;
    title?: string;
    message?: string | any;
    onClose: () => void;
}

export function SuccessModal({
    open,
    title = "¡Operación exitosa!",
    message = "La acción se realizó correctamente.",
    onClose,
}: SuccessModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
            <DialogContent 
                className="max-w-md"
                style={{
                    position: 'fixed !important',
                    top: '50% !important',
                    left: '50% !important',
                    transform: 'translate(-50%, -50%) !important',
                    zIndex: '9999 !important',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    margin: '0 !important'
                }}
            >
                <DialogHeader className="items-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {typeof message === 'string' ? message : JSON.stringify(message)}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-center">
                    <Button onClick={onClose} className="bg-green-600 text-white">Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default SuccessModal;
