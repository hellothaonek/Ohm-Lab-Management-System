"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTeamUser } from "@/services/teamUserServices"
import { getClassUserByClassId } from "@/services/classUserServices"

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
    const [userId, setUserId] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<ClassUser[]>([])
    const [usersLoading, setUsersLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsersLoading(true)
                const response = await getClassUserByClassId(classId)
                console.log(">>", response)
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
    }, [isOpen, classId, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) {
            toast({
                title: "Error",
                description: "Please select a user",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            await addTeamUser(teamId.toString(), userId)
            toast({
                title: "Success",
                description: "User added to team successfully",
            })
            setUserId("")
            setIsOpen(false)
            onMemberAdded()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add user to team",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-secondary hover:bg-blue-200 text-black">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Select
                            value={userId}
                            onValueChange={setUserId}
                            disabled={usersLoading || isLoading}
                        >
                            <SelectTrigger id="userId">
                                <SelectValue placeholder={usersLoading ? "Loading users..." : "Select a student"} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.userId} value={user.userId}>
                                        {user.userName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        <Button type="submit" disabled={isLoading || usersLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}