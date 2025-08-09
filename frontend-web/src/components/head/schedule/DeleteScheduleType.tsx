"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { deleteScheduleType } from "@/services/scheduleTypeServices";
import { useState } from "react";

interface DeleteScheduleTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleTypeId: number | null;
    scheduleTypeName: string;
    onSuccess: () => void;
}

export default function DeleteScheduleType({
    open,
    onOpenChange,
    scheduleTypeId,
    scheduleTypeName,
    onSuccess,
}: DeleteScheduleTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!scheduleTypeId) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await deleteScheduleType(scheduleTypeId.toString());
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete schedule type");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Schedule Type</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the schedule type "{scheduleTypeName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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