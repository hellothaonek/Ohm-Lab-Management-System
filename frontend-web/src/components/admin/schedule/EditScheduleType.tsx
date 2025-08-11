"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getScheduleTypeById, updateScheduleType } from "@/services/scheduleTypeServices";
import { useState, useEffect } from "react";

interface EditScheduleTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleTypeId: number | null;
    onSuccess: () => void;
}

interface ScheduleTypeData {
    slotId: number;
    scheduleTypeName: string;
    scheduleTypeDescription: string;
    scheduleTypeDow: string;
    scheduleTypeStatus: string;
}

export default function EditScheduleType({
    open,
    onOpenChange,
    scheduleTypeId,
    onSuccess,
}: EditScheduleTypeProps) {
    const [formData, setFormData] = useState<ScheduleTypeData>({
        slotId: 0,
        scheduleTypeName: "",
        scheduleTypeDescription: "",
        scheduleTypeDow: "",
        scheduleTypeStatus: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && scheduleTypeId) {
            const fetchScheduleType = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await getScheduleTypeById(scheduleTypeId.toString());
                    setFormData({
                        slotId: response.slotId || 0,
                        scheduleTypeName: response.scheduleTypeName || "",
                        scheduleTypeDescription: response.scheduleTypeDescription || "",
                        scheduleTypeDow: response.scheduleTypeDow || "",
                        scheduleTypeStatus: response.scheduleTypeStatus,
                    });
                } catch (err: any) {
                    setError(err.response?.data?.message || "Failed to fetch schedule type");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchScheduleType();
        }
    }, [open, scheduleTypeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleTypeId) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await updateScheduleType(scheduleTypeId.toString(), formData);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update schedule type");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Schedule Type</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading schedule type...</div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="slotId">Slot ID</Label>
                                <Input
                                    id="slotId"
                                    name="slotId"
                                    type="number"
                                    value={formData.slotId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="scheduleTypeName">Schedule Type Name</Label>
                                <Input
                                    id="scheduleTypeName"
                                    name="scheduleTypeName"
                                    value={formData.scheduleTypeName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="scheduleTypeDescription">Description</Label>
                                <Textarea
                                    id="scheduleTypeDescription"
                                    name="scheduleTypeDescription"
                                    value={formData.scheduleTypeDescription}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="scheduleTypeDow">Day of Week</Label>
                                <Input
                                    id="scheduleTypeDow"
                                    name="scheduleTypeDow"
                                    value={formData.scheduleTypeDow}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="scheduleTypeStatus">Status</Label>
                                <select
                                    id="scheduleTypeStatus"
                                    name="scheduleTypeStatus"
                                    value={formData.scheduleTypeStatus}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="Active">Active</option>
                                    <option value="InActive">Inactive</option>
                                </select>
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}