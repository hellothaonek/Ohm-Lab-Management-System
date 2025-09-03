"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createTeam } from "@/services/teamServices"
import { Loader2, Plus } from "lucide-react"

interface CreateGroupProps {
    classId: string
    onGroupCreated: () => void
}

export default function CreateGroup({ classId, onGroupCreated }: CreateGroupProps) {
    const [open, setOpen] = useState(false)
    const [teamName, setTeamName] = useState("")
    const [teamDescription, setTeamDescription] = useState("")
    const [teamStatus, setTeamStatus] = useState("Active")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await createTeam({
                classId: parseInt(classId),
                teamName,
                teamDescription,
                teamStatus,
            })
            setOpen(false)
            setTeamName("")
            setTeamDescription("")
            setTeamStatus("Active")
            onGroupCreated()
        } catch (err) {
            setError("Failed to create team. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    New Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teamName">Group Name</Label>
                        <Input
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter group name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="teamDescription">Description</Label>
                        <Textarea
                            id="teamDescription"
                            value={teamDescription}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            placeholder="Enter team description"
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="teamStatus">Status</Label>
                        <select
                            id="teamStatus"
                            value={teamStatus}
                            onChange={(e) => setTeamStatus(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}