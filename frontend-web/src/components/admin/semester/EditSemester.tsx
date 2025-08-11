"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateSemester } from "@/services/semesterServices";

interface Semester {
    semesterId: number;
    semesterName: string;
    semesterStartDate: string;
    semesterEndDate: string;
    semesterDescription: string;
    semesterStatus: string;
}

interface EditSemesterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    semester: Semester | null;
}

export default function EditSemester({ open, onOpenChange, onSuccess, semester }: EditSemesterProps) {
    const [formData, setFormData] = useState({
        semesterName: "",
        semesterStartDate: "",
        semesterEndDate: "",
        semesterDescription: "",
        semesterStatus: "Valid",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-populate form with semester data when the dialog opens
    useEffect(() => {
        if (semester) {
            setFormData({
                semesterName: semester.semesterName,
                semesterStartDate: semester.semesterStartDate.split("T")[0], // Extract YYYY-MM-DD
                semesterEndDate: semester.semesterEndDate.split("T")[0], // Extract YYYY-MM-DD
                semesterDescription: semester.semesterDescription,
                semesterStatus: semester.semesterStatus,
            });
        }
    }, [semester]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, semesterStatus: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!semester) return;

        setIsSubmitting(true);
        try {
            await updateSemester(semester.semesterId.toString(), formData);
            onSuccess(); // Call onSuccess to refresh the semester list
            onOpenChange(false); // Close the dialog
        } catch (error) {
            console.error("Error updating semester:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Semester</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="semesterName">Semester Name</Label>
                            <Input
                                id="semesterName"
                                name="semesterName"
                                value={formData.semesterName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="semesterStartDate">Start Date</Label>
                                <Input
                                    id="semesterStartDate"
                                    name="semesterStartDate"
                                    type="date"
                                    value={formData.semesterStartDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="semesterEndDate">End Date</Label>
                                <Input
                                    id="semesterEndDate"
                                    name="semesterEndDate"
                                    type="date"
                                    value={formData.semesterEndDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="semesterDescription">Description</Label>
                            <Input
                                id="semesterDescription"
                                name="semesterDescription"
                                value={formData.semesterDescription}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="semesterStatus">Status</Label>
                            <Select
                                name="semesterStatus"
                                value={formData.semesterStatus}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Valid">Valid</SelectItem>
                                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Invalid">Invalid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}