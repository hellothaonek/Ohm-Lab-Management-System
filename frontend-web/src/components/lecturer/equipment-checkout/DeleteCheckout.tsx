"use client"

import { useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteCheckoutProps {
    checkoutId: string | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (checkoutId: string) => void
}

export default function DeleteCheckout({ checkoutId, isOpen, onClose, onSuccess }: DeleteCheckoutProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!checkoutId) return

        setIsDeleting(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            onSuccess(checkoutId)
            handleClose()
        } catch (error) {
            console.error("Error deleting checkout:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleClose = () => {
        if (!isDeleting) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Xóa checkout
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa checkout này không? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">Cảnh báo</p>
                        <p>Việc xóa checkout sẽ xóa vĩnh viễn tất cả thông tin liên quan.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 