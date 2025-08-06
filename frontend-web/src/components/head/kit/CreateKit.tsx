"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createKit } from "@/services/kitServices"
import { useToast } from "@/components/ui/use-toast"

interface CreateKitProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function CreateKit({ open, onOpenChange, onSuccess }: CreateKitProps) {
    const [kitTemplateId, setKitTemplateId] = useState("")
    const [kitName, setKitName] = useState("")
    const [kitDescription, setKitDescription] = useState("")
    const [kitUrlImg, setKitUrlImg] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createKit({
                kitTemplateId,
                kitName,
                kitDescription,
                kitUrlImg,
            })
            toast({
                title: "Success",
                description: "Kit created successfully!",
            })
            setKitTemplateId("")
            setKitName("")
            setKitDescription("")
            setKitUrlImg("")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create kit:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create kit. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Kit</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new kit.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateId">Kit Template ID</Label>
                            <Input
                                id="kitTemplateId"
                                value={kitTemplateId}
                                onChange={(e) => setKitTemplateId(e.target.value)}
                                placeholder="Enter kit template ID"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitName">Kit Name</Label>
                            <Input
                                id="kitName"
                                value={kitName}
                                onChange={(e) => setKitName(e.target.value)}
                                placeholder="Enter kit name"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitDescription">Description</Label>
                            <Textarea
                                id="kitDescription"
                                value={kitDescription}
                                onChange={(e) => setKitDescription(e.target.value)}
                                placeholder="Enter kit description"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitUrlImg">Image URL</Label>
                            <Input
                                id="kitUrlImg"
                                value={kitUrlImg}
                                onChange={(e) => setKitUrlImg(e.target.value)}
                                placeholder="Enter image URL (optional)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}