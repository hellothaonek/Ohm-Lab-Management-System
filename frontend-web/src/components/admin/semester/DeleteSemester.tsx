"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { deleteSemester } from "@/services/semesterServices";
import { useState } from "react";

interface DeleteSemesterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    semesterId: number | null;
    semesterName: string;
}

export default function DeleteSemester({ open, onOpenChange, onSuccess, semesterId, semesterName }: DeleteSemesterProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        if (!semesterId) return;

        setIsSubmitting(true);
        try {
            await deleteSemester(semesterId.toString());
            onSuccess(); // Call onSuccess to refresh the semester list
            onOpenChange(false); // Close the dialog
        } catch (error) {
            console.error("Error deleting semester:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Semester</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the semester <strong>{semesterName}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
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