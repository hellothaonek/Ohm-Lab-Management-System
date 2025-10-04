"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { createKit } from "@/services/kitServices"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import { useToast } from "@/components/ui/use-toast"

interface CreateKitProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

interface KitTemplate {
    kitTemplateId: string
    kitTemplateName: string
}

export default function CreateKit({ open, onOpenChange, onSuccess }: CreateKitProps) {
    const [kitTemplateId, setKitTemplateId] = useState("")
    const [kitName, setKitName] = useState("")
    const [kitDescription, setKitDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [kitTemplates, setKitTemplates] = useState<KitTemplate[]>([])
    const [templateLoading, setTemplateLoading] = useState(false)
    const { toast } = useToast()

    const isProcessing = loading || templateLoading

    useEffect(() => {
        if (open) {
            const fetchKitTemplates = async () => {
                setTemplateLoading(true)
                try {
                    const response = await searchKitTemplate({
                        pageNum: 1,
                        pageSize: 100,
                        keyWord: "",
                        status: ""
                    })
                    setKitTemplates(response.pageData)
                } catch (error) {
                    console.error("Failed to fetch kit templates:", error)
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to load kit templates. Please try again.",
                    })
                } finally {
                    setTemplateLoading(false)
                }
            }
            fetchKitTemplates()
        }
    }, [open, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)
        try {
            await createKit({
                kitTemplateId,
                kitName,
                kitDescription,
            })

            // Reset states
            setKitTemplateId("")
            setKitName("")
            setKitDescription("")

            onOpenChange(false)
            onSuccess()

        } catch (error: any) {
            console.error("Failed to create kit:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create kit. Please try again.",
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
                            <Label htmlFor="kitTemplateId">Kit Template</Label>
                            <Select
                                value={kitTemplateId}
                                onValueChange={setKitTemplateId}
                                disabled={isProcessing}
                                required
                            >
                                <SelectTrigger id="kitTemplateId">
                                    <SelectValue placeholder={templateLoading ? "Loading templates..." : "Select a kit template"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {kitTemplates.map((template) => (
                                        <SelectItem key={template.kitTemplateId} value={template.kitTemplateId}>
                                            {template.kitTemplateName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kitName">Kit Name</Label>
                            <Input
                                id="kitName"
                                value={kitName}
                                onChange={(e) => setKitName(e.target.value)}
                                placeholder="Enter kit name"
                                required
                                disabled={isProcessing}
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
                                disabled={isProcessing}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}