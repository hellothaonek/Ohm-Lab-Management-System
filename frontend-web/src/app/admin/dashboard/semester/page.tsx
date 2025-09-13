"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from 'lucide-react';
import { format } from "date-fns";
import { Pagination } from 'antd';
import { getSemesters } from "@/services/semesterServices";
import CreateSemester from "@/components/admin/semester/CreateSemester";
import EditSemester from "@/components/admin/semester/EditSemester";
import DeleteSemester from "@/components/admin/semester/DeleteSemester";

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
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSemesterId, setEditSemesterId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSemesterId, setDeleteSemesterId] = useState<number | null>(null);
    const [deleteSemesterName, setDeleteSemesterName] = useState("");
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchSemesters = async () => {
        try {
            const response = await getSemesters();
            setSemesters(response.pageData);
            setTotalItems(response.pageInfo.totalItem);
            console.log("Semesters fetched successfully:", response);
        } catch (error) {
            console.error("Error fetching semesters:", error);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

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
        setPageSize(size || 10);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy");
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} font-medium`}>
                {status}
            </Badge>
        );
    };

    const selectedSemester = semesters.find((semester) => semester.semesterId === editSemesterId);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Semester Management</h1>
            </div>

            <div className="flex items-center justify-end gap-4">
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
                        {semesters.map((semester) => (
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