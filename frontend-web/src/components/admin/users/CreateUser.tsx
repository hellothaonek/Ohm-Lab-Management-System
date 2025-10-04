import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createUser } from "@/services/userServices"
import { toast } from "react-toastify"

interface CreateUserProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (user: { id: string; name: string; email: string; role: "Admin" | "Student" | "Lecturer" | "HeadOfDepartment"; status: "IsActive" | "delete" }) => void
}

export default function CreateUser({ isOpen, onClose, onCreate }: CreateUserProps) {
    const [name, setName] = useState("")
    const [rollNumber, setRollNumber] = useState("")
    const [email, setEmail] = useState("")
    const [numberCode, setNumberCode] = useState("")
    const [role, setRole] = useState<"Admin" | "Student" | "Lecturer" | "HeadOfDepartment">("Student")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = () => {
        if (!name.trim()) return "Name is required"
        if (!email.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format"
        if (!rollNumber.trim()) return "Roll number is required"
        if (!numberCode.trim()) return "Number code is required"
        return null
    }

    const handleCloseAndReset = () => {
        setName("")
        setRollNumber("")
        setEmail("")
        setNumberCode("")
        setRole("Student")
        setError(null)
        onClose()
    }

    const handleSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await createUser({
                userFullName: name,
                userRollNumber: rollNumber,
                userEmail: email,
                userNumberCode: numberCode,
                userRoleName: role,
            })

            if (response) {
                const newUser = {
                    id: response.data.userId,
                    name: response.data.userFullName || name,
                    email: response.data.userEmail || email,
                    role: response.data.userRoleName as "Admin" | "Student" | "Lecturer" | "HeadOfDepartment",
                    status: response.data.status || "IsActive" as "IsActive" | "delete"
                }

                onCreate(newUser)
                handleCloseAndReset()
                setName("")
                setRollNumber("")
                setEmail("")
                setNumberCode("")
                setRole("Student")
            } else {
                toast.error(response?.message)
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while creating the user")
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter full name"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter email"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rollNumber" className="text-right">Roll Number</Label>
                        <Input
                            id="rollNumber"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter roll number"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="numberCode" className="text-right">Number Code</Label>
                        <Input
                            id="numberCode"
                            value={numberCode}
                            onChange={(e) => setNumberCode(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter number code"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={role} onValueChange={(value: any) => setRole(value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="HeadOfDepartment">Head of Department</SelectItem>
                                <SelectItem value="Lecturer">Lecturer</SelectItem>
                                <SelectItem value="Student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}