"use client"

import { useState, useEffect, useMemo } from "react" // <-- Thêm useMemo
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu"
import {
    Users,
    Search as SearchIcon,
    MoreHorizontal,
    Edit,
    Trash2,
    UserX,
    Mail,
    Filter
} from "lucide-react"
import { Pagination } from 'antd';
import EditUser from "@/components/admin/users/EditUser"
import BlockUser from "@/components/admin/users/BlockUser"
import DeleteUser from "@/components/admin/users/DeleteUser"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { searchUsers } from "@/services/userServices"

interface User {
    id: string
    name: string
    email: string
    role: "Admin" | "Student" | "Lecturer" | "HeadOfDepartment"
    status: "IsActive" | "delete"
}

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // State mới: lưu toàn bộ dữ liệu fetch từ API
    const [fullUsers, setFullUsers] = useState<User[]>([])

    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    // totalItems sẽ là tổng số lượng users đã lọc (trước khi phân trang)
    const [totalItems, setTotalItems] = useState(0)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedUserName, setSelectedUserName] = useState<string>("")

    // Fetch ALL Users một lần khi component mount
    useEffect(() => {
        const fetchAllUsers = async () => {
            setLoading(true)
            setError(null)
            try {
                // Gọi API với keyWord, role, status rỗng và pageSize lớn để lấy tất cả
                const response = await searchUsers({
                    keyWord: "",
                    role: "",
                    status: "",
                    pageNum: 1,
                    pageSize: 9999
                })

                if (response && response.pageData) {
                    const mappedUsers: User[] = response.pageData.map((user: any) => ({
                        id: user.userId,
                        name: user.userFullName,
                        email: user.userEmail,
                        role: user.userRoleName as "Admin" | "Student" | "Lecturer" | "HeadOfDepartment",
                        status: user.status as "IsActive" | "delete"
                    }))

                    setFullUsers(mappedUsers)
                    setTotalItems(mappedUsers.length)
                } else {
                    setError(response?.message || "Failed to fetch users")
                    setFullUsers([])
                    setTotalItems(0)
                }
            } catch (err) {
                setError("An error occurred while fetching users")
                setFullUsers([])
                setTotalItems(0)
            } finally {
                setLoading(false)
            }
        }

        fetchAllUsers()
    }, []) // Chỉ chạy một lần khi component mount

    // Logic Lọc và Phân trang Client-Side
    const displayedUsers = useMemo(() => {
        let filteredItems = fullUsers

        // 1. Lọc theo Role
        if (roleFilter !== "all") {
            filteredItems = filteredItems.filter(user => user.role === roleFilter)
        }

        // 2. Lọc theo Status
        if (statusFilter !== "all") {
            filteredItems = filteredItems.filter(user => user.status === statusFilter)
        }

        // 3. Lọc theo Search Term (Name hoặc Email)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()
            filteredItems = filteredItems.filter(user =>
                user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.email.toLowerCase().includes(lowerCaseSearchTerm)
            )
        }

        // Cập nhật tổng số item đã lọc (trước khi phân trang)
        // Đảm bảo totalItems được cập nhật đúng để phân trang hoạt động
        setTotalItems(filteredItems.length)

        // 4. Áp dụng Phân trang
        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize

        return filteredItems.slice(startIndex, endIndex)
    }, [fullUsers, searchTerm, roleFilter, statusFilter, pageNum, pageSize])

    const getRoleColor = (role: string) => {
        switch (role) {
            case "Admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            case "HeadOfDepartment": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            case "Lecturer": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "Student": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "IsActive": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case "delete": return "bg-red-100 text-red-800 dark:bg-gray-900 dark:text-gray-300"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        }
    }

    const handlePaginationChange = (page: number, pageSize?: number) => {
        setPageNum(page)
        if (pageSize) setPageSize(pageSize)
    }

    const handleEditUser = (user: User) => {
        setSelectedUserId(user.id)
        setSelectedUserName(user.name)
        setIsEditModalOpen(true)
    }

    const handleBlockUser = (user: User) => {
        setSelectedUserId(user.id)
        setSelectedUserName(user.name)
        setIsBlockModalOpen(true)
    }

    const handleDeleteUser = (user: User) => {
        setSelectedUserId(user.id)
        setSelectedUserName(user.name)
        setIsDeleteModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPageNum(1) // Reset trang khi tìm kiếm
                                }}
                                className="pl-8 w-full sm:w-80"
                            />
                        </div>
                    </div>
                    <Select value={roleFilter} onValueChange={(value) => {
                        setRoleFilter(value)
                        setPageNum(1) // Reset trang khi lọc Role
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="HeadOfDepartment">Head of Department</SelectItem>
                            <SelectItem value="Lecturer">Lecturer</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value)
                        setPageNum(1) // Reset trang khi lọc Status
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="IsActive">IsActive</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <p>Loading users...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center py-8 text-red-600">
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-blue-50">
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* SỬ DỤNG displayedUsers */}
                                {displayedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRoleColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(user.status)}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleBlockUser(user)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-2" />
                                                        Block
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* Hiển thị thông báo khi không có người dùng nào khớp với bộ lọc */}
                                {displayedUsers.length === 0 && fullUsers.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                            No users match the current filter criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Sử dụng fullUsers.length để kiểm tra khi không có dữ liệu ban đầu */}
                {!loading && !error && fullUsers.length === 0 && (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No users found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                )}

                {/* Phân trang: Dùng totalItems đã được cập nhật bởi useMemo */}
                {!loading && !error && totalItems > 0 && (
                    <div className="flex justify-end mt-5">
                        <Pagination
                            current={pageNum}
                            pageSize={pageSize}
                            total={totalItems}
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                            onChange={handlePaginationChange}
                            showSizeChanger
                            onShowSizeChange={(current, size) => {
                                setPageSize(size)
                                setPageNum(1)
                            }}
                        />
                    </div>
                )}

                <EditUser
                    userId={selectedUserId}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setSelectedUserId(null)
                        setSelectedUserName("")
                    }}
                    onUpdate={() => {
                        // Khi update thành công, reset page và re-fetch data (nếu cần)
                        // Trong trường hợp này, vì useEffect chỉ chạy 1 lần, bạn có thể cần re-fetch lại data.
                        // Hoặc bạn có thể tự cập nhật state `fullUsers` nếu API trả về data mới.
                        // Để đơn giản, tôi sẽ giữ nguyên pageNum. Nếu bạn muốn data update ngay,
                        // hãy thêm logic re-fetch vào đây.
                    }}
                />
                <BlockUser
                    userId={selectedUserId}
                    userName={selectedUserName}
                    isOpen={isBlockModalOpen}
                    onClose={() => {
                        setIsBlockModalOpen(false)
                        setSelectedUserId(null)
                        setSelectedUserName("")
                    }}
                    onBlock={() => {
                        // Xử lý cập nhật state `fullUsers` sau khi block thành công
                        // Nếu logic BlockUser tự gọi API update và không cần re-fetch toàn bộ:
                        setFullUsers(prev => prev.map(user =>
                            user.id === selectedUserId ? { ...user, status: user.status === "IsActive" ? "delete" : "IsActive" } : user
                        ));
                        // Nếu cần re-fetch toàn bộ (để đảm bảo data mới nhất), hãy gọi fetchAllUsers ở đây.
                    }}
                />
                <DeleteUser
                    userId={selectedUserId}
                    userName={selectedUserName}
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false)
                        setSelectedUserId(null)
                        setSelectedUserName("")
                    }}
                    onDelete={() => {
                        // Cập nhật state `fullUsers` sau khi delete thành công
                        setFullUsers(prev => prev.filter(user => user.id !== selectedUserId));
                        setPageNum(1) // Reset về trang 1 sau khi xóa
                    }}
                />
            </CardContent>
        </div>
    )
}