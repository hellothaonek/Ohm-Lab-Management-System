"use client"

import DashboardLayout from "@/components/dashboard-layout"
import KitHandover from "@/components/lecturer/kit/KitHandover"
import LecturerKitTab from "@/components/lecturer/kit/KitTab"
import KitTemplateTab from "@/components/lecturer/kit/KitTemplateTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function KitPage() {
    const [showBorrowDialog, setShowBorrowDialog] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Kit Management</h1>
            </div>
            <Tabs defaultValue="kit-template" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="kit-template">Kit Template</TabsTrigger>
                    <TabsTrigger value="kit">Kit</TabsTrigger>
                    <TabsTrigger value="borrow-return">Borrow/Return</TabsTrigger>
                </TabsList>

                <TabsContent value="kit-template">
                    <KitTemplateTab setShowReportDialog={setShowReportDialog} />
                </TabsContent>
                <TabsContent value="kit">
                    <LecturerKitTab setShowReportDialog={setShowReportDialog} />
                </TabsContent>
                <TabsContent value="borrow-return">
                    <KitHandover
                        setShowBorrowDialog={setShowBorrowDialog}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}