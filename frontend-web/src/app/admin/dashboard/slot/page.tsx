"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from 'lucide-react';
import { Pagination } from 'antd';
import { searchSlots } from "@/services/slotServices";
import CreateSlot from "@/components/admin/slot/CreateSlot";
import EditSlot from "@/components/admin/slot/EditSlot";
import DeleteSlot from "@/components/admin/slot/DeleteSlot";

interface Slot {
    slotId: number;
    slotName: string;
    slotStartTime: string;
    slotEndTime: string;
    slotDescription: string;
    slotStatus: string;
}

const statusColors: { [key: string]: string } = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    Pending: "bg-blue-100 text-blue-800",
};

export default function AdminSlot() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSlotId, setEditSlotId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSlotId, setDeleteSlotId] = useState<number | null>(null);
    const [deleteSlotName, setDeleteSlotName] = useState("");
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [keyWord, setKeyWord] = useState("");
    const [status, setStatus] = useState("");

    const fetchSlots = async () => {
        try {
            const response = await searchSlots({ pageNum, pageSize, keyWord, status });
            setSlots(response.pageData);
            setTotalItems(response.pageInfo.totalItem);
            console.log("Slots fetched successfully:", response);
        } catch (error) {
            console.error("Error fetching slots:", error);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [pageNum, pageSize, keyWord, status]);

    const handleSuccess = () => {
        fetchSlots();
    };

    const handleEdit = (slot: Slot) => {
        setEditSlotId(slot.slotId);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (slot: Slot) => {
        setDeleteSlotId(slot.slotId);
        setDeleteSlotName(slot.slotName);
        setIsDeleteDialogOpen(true);
    };

    const handlePaginationChange = (page: number, size?: number) => {
        setPageNum(page);
        setPageSize(size || 10);
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} font-medium`}>
                {status}
            </Badge>
        );
    };

    const selectedSlot = slots.find((slot) => slot.slotId === editSlotId);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Slot Management</h1>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    aria-label="Create new slot"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    Create Slot
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Slot Name</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {slots.map((slot) => (
                            <TableRow key={slot.slotId}>
                                <TableCell className="font-medium">{slot.slotName}</TableCell>
                                <TableCell>{slot.slotStartTime}</TableCell>
                                <TableCell>{slot.slotEndTime}</TableCell>
                                <TableCell>{getStatusBadge(slot.slotStatus)}</TableCell>
                                <TableCell className="text-sm text-gray-600">{slot.slotDescription || "N/A"}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(slot)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(slot)}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex justify-end mt-4">
                <Pagination
                    current={pageNum}
                    pageSize={pageSize}
                    total={totalItems}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    onShowSizeChange={(current, size) => {
                        setPageSize(size);
                        setPageNum(1);
                    }}
                />
            </div>

            <CreateSlot
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleSuccess}
            />

            <EditSlot
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleSuccess}
                slot={selectedSlot || null}
            />

            <DeleteSlot
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onSuccess={handleSuccess}
                slotId={deleteSlotId}
                slotName={deleteSlotName}
            />
        </div>
    );
}