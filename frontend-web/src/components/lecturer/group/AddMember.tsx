"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addTeamUser } from "@/services/teamUserServices"
import { getClassUserByClassId } from "@/services/classUserServices"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface ClassUser {
    classUserId: number
    classId: number
    userId: string
    className: string
    userName: string
    userEmail: string
    userRole: string
    userNumberCode: string
    subjectId: number
    subjectName: string
    subjectCode: string
    subjectDescription: string
    subjectStatus: string
    classUserStatus: string
}

interface AddMemberProps {
    teamId: number
    classId: string
    onMemberAdded: () => void
}

export default function AddMember({ teamId, classId, onMemberAdded }: AddMemberProps) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<ClassUser[]>([])
    const [usersLoading, setUsersLoading] = useState(false)
    const { toast } = useToast()

    // Log selected userIds to console whenever they change
    useEffect(() => {
        console.log("Selected userIds:", selectedUserIds)
    }, [selectedUserIds])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsersLoading(true)
                const response = await getClassUserByClassId(classId)
                setUsers(response)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch users",
                    variant: "destructive",
                })
            } finally {
                setUsersLoading(false)
            }
        }

        if (isOpen && classId) {
            fetchUsers()
        }

        if (!isOpen) {
            setSelectedUserIds([])
        }
    }, [isOpen, classId, toast])

    const handleUserToggle = (userId: string) => {
        setSelectedUserIds(prevIds => {
            if (prevIds.includes(userId)) {
                return prevIds.filter(id => id !== userId)
            } else {
                return [...prevIds, userId]
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedUserIds.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one user",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            // Prepare the request body
            const teamUserList = selectedUserIds.map(userId => ({
                teamId,
                userId,
            }))

            // Call addTeamUser with the updated format
            const result = await addTeamUser(teamUserList)

            console.log("add list user:", result)

            const successCount = selectedUserIds.length

            // Reset state and close dialog
            setSelectedUserIds([])
            setIsOpen(false)
            onMemberAdded()

            toast({
                title: "Success",
                description: `Successfully added ${successCount} member${successCount > 1 ? 's' : ''} to the team`,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to add one or more users to the team. Please check the console for details.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const isAddDisabled = isLoading || usersLoading || selectedUserIds.length === 0 || users.length === 0

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-secondary hover:bg-blue-200 text-black">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Add New Members</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="users-list">Select Students</Label>

                        {usersLoading && (
                            <div className="flex items-center justify-center h-24 text-gray-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading students...
                            </div>
                        )}

                        {!usersLoading && users.length === 0 && (
                            <div className="flex items-center justify-center h-24 text-gray-500">
                                No students available to add.
                            </div>
                        )}

                        {!usersLoading && users.length > 0 && (
                            <ScrollArea className="h-60 w-full rounded-md border p-4">
                                {users.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.userId)
                                    return (
                                        <div
                                            key={user.userId}
                                            className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                                        >
                                            <Checkbox
                                                id={`user-${user.userId}`}
                                                checked={isSelected}
                                                onCheckedChange={() => handleUserToggle(user.userId)}
                                            />
                                            <label
                                                htmlFor={`user-${user.userId}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                                                onClick={() => handleUserToggle(user.userId)}
                                            >
                                                {user.userName} ({user.userNumberCode})
                                            </label>
                                        </div>
                                    )
                                })}
                            </ScrollArea>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading || usersLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isAddDisabled}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding ({selectedUserIds.length})...
                                </>
                            ) : (
                                `Add (${selectedUserIds.length})`
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}