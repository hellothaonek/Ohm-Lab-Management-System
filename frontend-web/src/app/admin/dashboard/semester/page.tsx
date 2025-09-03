"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from 'lucide-react';
import { format } from "date-fns";
import { Pagination } from 'antd'; // Import Ant Design Pagination
import { getSemesters } from "@/services/semesterServices";
import CreateSemester from "@/components/admin/semester/CreateSemester";
import EditSemester from "@/components/admin/semester/EditSemester";
import DeleteSemester from "@/components/admin/semester/DeleteSemester";

// Define the Semester type based on the provided API response structure
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
            const response = await getSemesters(); // Pass page and size to API
            setSemesters(response.pageData); // Set the semesters state
            setTotalItems(response.pageInfo.totalItem); // Update total items
            console.log("Semesters fetched successfully:", response);
        } catch (error) {
            console.error("Error fetching semesters:", error);
        }
    };

    useEffect(() => {
        fetchSemesters(); // Fetch semesters when the component mounts
    }, []);

    const handleSuccess = () => {
        fetchSemesters(); // Refresh semesters after a create/edit/delete operation
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
        setPageNum(page)
        setPageSize(pageSize || 10)
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
                <h1 className="text-3xl font-bold tracking-tight">Semester</h1>
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 bg-gray-100">Semester Name</th>
                                <th className="text-left p-4 bg-gray-100">Start Date</th>
                                <th className="text-left p-4 bg-gray-100">End Date</th>
                                <th className="text-left p-4 bg-gray-100">Status</th>
                                <th className="text-left p-4 bg-gray-100">Description</th>
                                <th className="text-center p-4 bg-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesters.map((semester) => (
                                <tr key={semester.semesterId} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{semester.semesterName}</td>
                                    <td className="p-4">{formatDate(semester.semesterStartDate)}</td>
                                    <td className="p-4">{formatDate(semester.semesterEndDate)}</td>
                                    <td className="p-4">{getStatusBadge(semester.semesterStatus)}</td>
                                    <td className="p-4 text-sm text-gray-600">{semester.semesterDescription}</td>
                                    <td className="p-4 text-center">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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