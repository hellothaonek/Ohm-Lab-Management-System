"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { deleteEquipment } from "@/services/equipmentServices";

interface DeleteEquipmentProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    equipmentName: string;
    equipmentId: string;
}

export default function DeleteEquipment({ open, onClose, onDelete, equipmentName, equipmentId }: DeleteEquipmentProps) {
    const handleDelete = async () => {
        try {
            await deleteEquipment(equipmentId);
            onDelete();
            onClose();
        } catch (error) {
            console.error("Error deleting equipment:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {equipmentName}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
