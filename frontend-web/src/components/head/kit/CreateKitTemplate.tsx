"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createKitTemplate } from "@/services/kitTemplateServices"
import { useToast } from "@/components/ui/use-toast"

interface CreateKitTemplateProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}
export default function CreateKitTemplate({ open, onOpenChange }: CreateKitTemplateProps) {
    const [kitTemplateName, setKitTemplateName] = useState("")
    const [kitTemplateDescription, setKitTemplateDescription] = useState("")
    const [kitTemplateUrlImg, setKitTemplateUrlImg] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createKitTemplate({
                kitTemplateName,
                kitTemplateDescription,
                kitTemplateUrlImg
            })
            toast({
                title: "Success",
                description: "Kit template created successfully",
            })
            setKitTemplateName("")
            setKitTemplateDescription("")
            setKitTemplateUrlImg("")
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create kit template",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Kit Template</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new kit template.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateName">Name</Label>
                            <Input
                                id="kitTemplateName"
                                value={kitTemplateName}
                                onChange={(e) => setKitTemplateName(e.target.value)}
                                placeholder="Enter kit template name"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateDescription">Description</Label>
                            <Textarea
                                id="kitTemplateDescription"
                                value={kitTemplateDescription}
                                onChange={(e) => setKitTemplateDescription(e.target.value)}
                                placeholder="Enter kit template description"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateUrlImg">Image URL</Label>
                            <Input
                                id="kitTemplateUrlImg"
                                value={kitTemplateUrlImg}
                                onChange={(e) => setKitTemplateUrlImg(e.target.value)}
                                placeholder="Enter image URL"
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