"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { useState, useEffect } from "react";
import { getEquipmentById } from "@/src/services/equipmentServices";
import { useToast } from "@/src/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface Equipment {
    equipmentId: number;
    equipmentName: string;
    equipmentCode: string;
    equipmentNumberSerial: string;
    equipmentStatus: string;
}

interface EditEquipmentProps {
    open: boolean;
    onClose: () => void;
    onEdit: () => void;
    equipmentId: string;
}

export default function EditEquipment({ open, onClose, onEdit, equipmentId }: EditEquipmentProps) {
    const [formData, setFormData] = useState<Equipment>({
        equipmentId: 0,
        equipmentName: "",
        equipmentCode: "",
        equipmentNumberSerial: "",
        equipmentStatus: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const statusOptions = [
        { value: "available", label: "Available" },
        { value: "in-use", label: "In Use" },
        { value: "maintenance", label: "Maintenance" },
        { value: "out-of-order", label: "Out of Order" },
    ];

    useEffect(() => {
        if (open && equipmentId) {
            const fetchEquipmentData = async () => {
                setIsLoading(true);
                try {
                    const data = await getEquipmentById(equipmentId);
                    setFormData(data);
                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch equipment details",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEquipmentData();
        }
    }, [open, equipmentId, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            toast({
                title: "Success",
                description: "Equipment updated successfully",
            });
            onEdit();
            onClose();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update equipment",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, equipmentStatus: value }));
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Equipment</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div>Loading equipment details...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="equipmentName">Equipment Name</Label>
                            <Input
                                id="equipmentName"
                                name="equipmentName"
                                value={formData.equipmentName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="equipmentCode">Equipment Code</Label>
                            <Input
                                id="equipmentCode"
                                name="equipmentCode"
                                value={formData.equipmentCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="equipmentNumberSerial">Serial Number</Label>
                            <Input
                                id="equipmentNumberSerial"
                                name="equipmentNumberSerial"
                                value={formData.equipmentNumberSerial}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="equipmentStatus">Status</Label>
                            <Select
                                value={formData.equipmentStatus}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger id="equipmentStatus">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}