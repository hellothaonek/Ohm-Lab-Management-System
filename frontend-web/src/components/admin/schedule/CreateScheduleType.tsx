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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createScheduleType } from "@/services/scheduleTypeServices";
import { getAllSlots } from "@/services/slotServices";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Slot {
    slotId: number;
    slotName: string;
}

interface CreateScheduleTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function CreateScheduleType({
    open,
    onOpenChange,
    onSuccess,
}: CreateScheduleTypeProps) {
    const [formData, setFormData] = useState({
        slotId: "",
        scheduleTypeName: "",
        scheduleTypeDescription: "",
        scheduleTypeDow: "",
        scheduleTypeStatus: "Active",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const slotData = await getAllSlots();
                setSlots(slotData);
            } catch (err) {
                setError("Failed to fetch slots");
            }
        };
        fetchSlots();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createScheduleType({
                slotId: parseInt(formData.slotId),
                scheduleTypeName: formData.scheduleTypeName,
                scheduleTypeDescription: formData.scheduleTypeDescription,
                scheduleTypeDow: formData.scheduleTypeDow,
                scheduleTypeStatus: formData.scheduleTypeStatus,
            });
            onSuccess();
            onOpenChange(false);
            setFormData({
                slotId: "",
                scheduleTypeName: "",
                scheduleTypeDescription: "",
                scheduleTypeDow: "",
                scheduleTypeStatus: "Active",
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create schedule type");
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

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, slotId: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Schedule Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="slotId">Slot</Label>
                            <Select
                                name="slotId"
                                value={formData.slotId}
                                onValueChange={handleSelectChange}
                                required
                            >
                                <SelectTrigger id="slotId">
                                    <SelectValue placeholder="Select a slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {slots.map((slot) => (
                                        <SelectItem key={slot.slotId} value={slot.slotId.toString()}>
                                            {slot.slotName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}