"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteSlot } from "@/services/slotServices";

interface DeleteSlotProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    slotId: number | null;
    slotName: string;
}

export default function DeleteSlot({ open, onOpenChange, onSuccess, slotId, slotName }: DeleteSlotProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        if (!slotId) return;

        setIsSubmitting(true);
        try {
            await deleteSlot(slotId.toString());
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting slot:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Slot</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the slot <span className="font-semibold">{slotName}</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}