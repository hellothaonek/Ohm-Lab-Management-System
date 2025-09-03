"use client"

import DashboardLayout from "@/components/dashboard-layout"
import KitTab from "@/components/head/kit/KitTab"
import KitTemplateTab from "@/components/head/kit/KitTemplateTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function KitPage() {
    const [showBorrowDialog, setShowBorrowDialog] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="kit-template" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="kit-template">Kit Template</TabsTrigger>
                    <TabsTrigger value="kit">Kit</TabsTrigger>
                </TabsList>

                <TabsContent value="kit-template">
                    <KitTemplateTab setShowReportDialog={setShowReportDialog} />
                </TabsContent>
                <TabsContent value="kit">
                    <KitTab setShowReportDialog={setShowReportDialog} />
                </TabsContent>
            </Tabs>
        </div>

    )
}