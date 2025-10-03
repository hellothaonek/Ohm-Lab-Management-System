"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Search } from 'lucide-react';
import { format } from "date-fns";
import { Pagination } from 'antd';
import { getSemesters } from "@/services/semesterServices";
import CreateSemester from "@/components/admin/semester/CreateSemester";
import EditSemester from "@/components/admin/semester/EditSemester";
import DeleteSemester from "@/components/admin/semester/DeleteSemester";
import { Input } from "@/components/ui/input";

interface Semester {
    semesterId: number;
    semesterName: string;
    semesterStartDate: string;
    semesterEndDate: string;
    semesterDescription: string;
    semesterStatus: string;
}

const statusColors: { [key: string]: string } = {
    Valid: "bg-green-100 text-green-800",
    Completed: "bg-gray-100 text-gray-800",
    Upcoming: "bg-blue-100 text-blue-800",
    Invalid: "bg-red-100 text-red-800"
};

export default function AdminSemester() {
    // State để lưu trữ toàn bộ dữ liệu gốc đã tải từ API
    const [initialSemesters, setInitialSemesters] = useState<Semester[]>([]);
    // State cho thanh tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states (giữ nguyên)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSemesterId, setEditSemesterId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSemesterId, setDeleteSemesterId] = useState<number | null>(null);
    const [deleteSemesterName, setDeleteSemesterName] = useState("");

    // Phân trang
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0); // Tổng số item sau khi lọc

    // 1. CẬP NHẬT HÀM FETCH: Không truyền tham số phân trang
    const fetchSemesters = useCallback(async () => {
        try {
            // KHÔNG truyền pageNum và pageSize vào getSemesters()
            const response = await getSemesters();
            // API trả về data với cấu trúc: { pageData: [...], pageInfo: {...} }
            setInitialSemesters(response.pageData || []);
            // setTotalItems sẽ được cập nhật trong useMemo
            console.log("Semesters fetched successfully (All data):", response);
        } catch (error) {
            console.error("Error fetching semesters:", error);
            setInitialSemesters([]);
        }
    }, []);

    useEffect(() => {
        fetchSemesters();
    }, [fetchSemesters]);

    // 2. LOGIC LỌC VÀ PHÂN TRANG (Client-side)
    const semesters = useMemo(() => {
        let filteredItems = initialSemesters;

        // 1. Lọc theo Tên Học kỳ (searchTerm)
        if (searchTerm) {
            const lowerCaseQuery = searchTerm.toLowerCase().trim();
            filteredItems = filteredItems.filter(item =>
                item.semesterName.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Cập nhật tổng số lượng item sau khi lọc
        setTotalItems(filteredItems.length);

        // 2. Phân trang
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return filteredItems.slice(startIndex, endIndex);
    }, [initialSemesters, searchTerm, pageNum, pageSize]);

    // 3. HANDLER TÌM KIẾM: Reset trang về 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNum(1); // Quan trọng: Reset về trang 1 khi thay đổi tìm kiếm
    }

    const handleSuccess = () => {
        fetchSemesters();
    };

    const handleEdit = (semester: Semester) => {
        setEditSemesterId(semester.semesterId);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (semester: Semester) => {
        setDeleteSemesterId(semester.semesterId);
        setDeleteSemesterName(semester.semesterName);
        setIsDeleteDialogOpen(true);
    };

    const handlePaginationChange = (page: number, size?: number) => {
        setPageNum(page);
        if (size !== undefined) {
            setPageSize(size);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "dd/MM/yyyy");
        } catch (e) {
            return "-";
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} font-medium`}>
                {status}
            </Badge>
        );
    };

    // Tìm học kỳ để chỉnh sửa trên dữ liệu gốc
    const selectedSemester = initialSemesters.find((semester) => semester.semesterId === editSemesterId);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Semester Management</h1>
            </div>

            {/* 4. THÊM INPUT TÌM KIẾM VÀO GIAO DIỆN */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-[350px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search semester name..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    aria-label="Create new semester"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    Create Semester
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Semester Name</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {semesters.length === 0 && (initialSemesters.length > 0 || searchTerm.length > 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No semester found matching your search criteria.
                                </TableCell>
                            </TableRow>
                        ) : semesters.length === 0 && initialSemesters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No semesters have been created yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            semesters.map((semester) => (
                                <TableRow key={semester.semesterId}>
                                    <TableCell className="font-medium">{semester.semesterName}</TableCell>
                                    <TableCell>{formatDate(semester.semesterStartDate)}</TableCell>
                                    <TableCell>{formatDate(semester.semesterEndDate)}</TableCell>
                                    <TableCell>{getStatusBadge(semester.semesterStatus)}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{semester.semesterDescription}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(semester)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(semester)}
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
                    total={totalItems} // Tổng số item đã lọc
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    onShowSizeChange={(current, size) => {
                        setPageSize(size);
                        setPageNum(1);
                    }}
                />
            </div>

            <CreateSemester
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleSuccess}
            />

            <EditSemester
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleSuccess}
                semester={selectedSemester || null}
            />

            <DeleteSemester
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onSuccess={handleSuccess}
                semesterId={deleteSemesterId}
                semesterName={deleteSemesterName}
            />
        </div>
    );
}