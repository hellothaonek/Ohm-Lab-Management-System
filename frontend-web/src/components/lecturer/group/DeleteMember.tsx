"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { deleteTeamUser } from "@/services/teamUserServices"

interface DeleteMemberProps {
    teamUserId: number
    userName: string | null
    onMemberDeleted: () => void
}

export default function DeleteMember({ teamUserId, userName, onMemberDeleted }: DeleteMemberProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await deleteTeamUser(teamUserId.toString())
            console.log("deleteTeamUser called with:", { teamUserId })
            setIsOpen(false)
            onMemberDeleted()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove user from team",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                >
                    <X className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {userName || "this user"} from the team? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            "Remove"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}