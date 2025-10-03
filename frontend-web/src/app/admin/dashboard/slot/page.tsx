"use client";

import { useState, useEffect, useMemo, useCallback } from "react"; // Thêm useMemo và useCallback
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Search } from 'lucide-react'; // Thêm Search
import { Pagination } from 'antd';
import { searchSlots } from "@/services/slotServices";
import CreateSlot from "@/components/admin/slot/CreateSlot";
import EditSlot from "@/components/admin/slot/EditSlot";
import DeleteSlot from "@/components/admin/slot/DeleteSlot";
import { Input } from "@/components/ui/input"; // Thêm Input

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
    // **CLIENT-SIDE CHANGE:** State để lưu trữ toàn bộ dữ liệu gốc
    const [initialSlots, setInitialSlots] = useState<Slot[]>([]);

    // **CLIENT-SIDE CHANGE:** Sử dụng searchTerm thay cho keyWord
    const [searchTerm, setSearchTerm] = useState("");

    // Giữ nguyên các states không liên quan đến dữ liệu/lọc
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSlotId, setEditSlotId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSlotId, setDeleteSlotId] = useState<number | null>(null);
    const [deleteSlotName, setDeleteSlotName] = useState("");

    // Phân trang
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0); // Tổng số item sau khi lọc

    // Bỏ keyWord và status, vì ta sẽ tải toàn bộ dữ liệu và lọc client-side
    // const [keyWord, setKeyWord] = useState("");
    // const [status, setStatus] = useState("");

    // 1. CẬP NHẬT HÀM FETCH: Tải toàn bộ dữ liệu (hoặc với pageSize rất lớn)
    const fetchSlots = useCallback(async () => {
        try {
            // Giả định API cho phép gọi để lấy toàn bộ hoặc dùng pageSize lớn
            const response = await searchSlots({
                pageNum: 1,
                pageSize: 9999, // Sử dụng pageSize lớn để lấy toàn bộ data
                keyWord: "",
                status: ""
            });

            // Lưu toàn bộ dữ liệu vào state gốc
            setInitialSlots(response.pageData || []);
            console.log("Slots fetched successfully (All data):", response);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setInitialSlots([]);
        }
    }, []);

    // **CẬP NHẬT useEffect:** Chỉ gọi fetchSlots khi component mount
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // 2. LOGIC LỌC VÀ PHÂN TRANG (Client-side)
    const slots = useMemo(() => {
        let filteredItems = initialSlots;

        // 1. Lọc theo Tên Slot (searchTerm)
        if (searchTerm) {
            const lowerCaseQuery = searchTerm.toLowerCase().trim();
            filteredItems = filteredItems.filter(item =>
                item.slotName.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Cập nhật tổng số lượng item sau khi lọc
        setTotalItems(filteredItems.length);

        // 2. Phân trang
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return filteredItems.slice(startIndex, endIndex);
    }, [initialSlots, searchTerm, pageNum, pageSize]);

    // **3. HANDLER TÌM KIẾM:** Reset trang về 1 khi thay đổi tìm kiếm
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNum(1); // Reset về trang 1
    }

    // `handleSuccess` gọi `fetchSlots` để refresh dữ liệu gốc
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
        if (size !== undefined) {
            setPageSize(size);
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} font-medium`}>
                {status}
            </Badge>
        );
    };

    // Tìm slot để chỉnh sửa trên dữ liệu gốc
    const selectedSlot = initialSlots.find((slot) => slot.slotId === editSlotId);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Slot Management</h1>
            </div>

            {/* 4. THÊM INPUT TÌM KIẾM VÀO GIAO DIỆN */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-[350px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search slot name..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={handleSearchChange} // Sử dụng handler mới
                    />
                </div>

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
                        {slots.length === 0 && (initialSlots.length > 0 || searchTerm.length > 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No slot found matching your search criteria.
                                </TableCell>
                            </TableRow>
                        ) : slots.length === 0 && initialSlots.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No slots have been created yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            slots.map((slot) => (
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex justify-end mt-4">
                <Pagination
                    current={pageNum}
                    pageSize={pageSize}
                    total={totalItems} // Sử dụng totalItems đã được tính toán client-side
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