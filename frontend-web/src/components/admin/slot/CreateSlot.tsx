"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSlot } from "@/services/slotServices";

interface CreateSlotProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function CreateSlot({ open, onOpenChange, onSuccess }: CreateSlotProps) {
    const [formData, setFormData] = useState({
        slotName: "",
        slotStartTime: "",
        slotEndTime: "",
        slotDescription: "",
        slotStatus: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, slotStatus: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createSlot(formData);
            onSuccess();
            onOpenChange(false);
            setFormData({
                slotName: "",
                slotStartTime: "",
                slotEndTime: "",
                slotDescription: "",
                slotStatus: "",
            });
        } catch (error) {
            console.error("Error creating slot:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Slot</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slotName" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="slotName"
                                name="slotName"
                                value={formData.slotName}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slotStartTime" className="text-right">
                                Start Time
                            </Label>
                            <Input
                                id="slotStartTime"
                                name="slotStartTime"
                                type="time"
                                value={formData.slotStartTime}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slotEndTime" className="text-right">
                                End Time
                            </Label>
                            <Input
                                id="slotEndTime"
                                name="slotEndTime"
                                type="time"
                                value={formData.slotEndTime}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slotDescription" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="slotDescription"
                                name="slotDescription"
                                value={formData.slotDescription}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slotStatus" className="text-right">
                                Status
                            </Label>
                            <Select
                                name="slotStatus"
                                value={formData.slotStatus}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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