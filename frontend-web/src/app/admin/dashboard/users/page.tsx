"use client"

import { useState, useEffect } from "react"
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
    const [users, setUsers] = useState<User[]>([])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedUserName, setSelectedUserName] = useState<string>("")

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await searchUsers({
                    keyWord: searchTerm,
                    role: roleFilter === "all" ? "" : roleFilter,
                    status: statusFilter === "all" ? "" : statusFilter,
                    pageNum,
                    pageSize
                })

                if (response) {
                    const mappedUsers: User[] = response.pageData.map((user: any) => ({
                        id: user.userId,
                        name: user.userFullName,
                        email: user.userEmail,
                        role: user.userRoleName as "Admin" | "Student" | "Lecturer" | "HeadOfDepartment",
                        status: user.status as "IsActive" | "delete"
                    }))
                    setUsers(mappedUsers)
                    setTotalItems(response.pageInfo.totalItem)
                } else {
                    setError(response.message || "Failed to fetch users")
                    setUsers([])
                    setTotalItems(0)
                }
            } catch (err) {
                setError("An error occurred while fetching users")
                setUsers([])
                setTotalItems(0)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [searchTerm, roleFilter, statusFilter, pageNum, pageSize])

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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        A list of all users in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 w-full sm:w-80"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
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
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
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
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!loading && !error && users.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No users found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filter criteria.
                            </p>
                        </div>
                    )}

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
                            setPageNum(1)
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
                            setPageNum(1)
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
                            setPageNum(1)
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}