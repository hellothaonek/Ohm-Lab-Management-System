"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { addStudentList } from "@/services/classUserServices"

interface AddStudentProps {
    open: boolean
    onClose: () => void
    onAddStudents: (classId: number, file: File) => void
    classId: number
    className: string
}

export default function AddStudent({ open, onClose, onAddStudents, classId, className }: AddStudentProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type.includes("spreadsheetml") || selectedFile.name.endsWith(".xlsx")) {
                setFile(selectedFile)
            } else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an Excel (.xlsx) file",
                    variant: "destructive",
                })
            }
        }
    }

    const handleSubmit = async () => {
        if (!file) {
            toast({
                title: "No file selected",
                description: "Please select an Excel file to upload",
                variant: "destructive",
            })
            return
        }

        try {
            setUploading(true)
            await addStudentList({ classId, excelFile: file })
            onAddStudents(classId, file)
            setFile(null)
            onClose()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload student list. Please try again.",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Students to {className}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                                disabled={uploading}
                            />
                        </div>
                        {file && (
                            <p className="text-sm text-gray-500">Selected file: {file.name}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}