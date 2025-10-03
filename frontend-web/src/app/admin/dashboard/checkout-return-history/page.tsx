"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EquipmentCheckoutHistory from "@/components/admin/checkout-return-history/EquipmentCheckoutHistory"
import KitCheckoutHistory from "@/components/admin/checkout-return-history/KitCheckoutHistory"

export default function CheckoutReturnHistory() {
    const [showBorrowDialog, setShowBorrowDialog] = useState(false)

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Checkout and Return History</h1>
            <Tabs defaultValue="equipment" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                    <TabsTrigger value="equipment">Equipment History</TabsTrigger>
                    <TabsTrigger value="kit">Kit History</TabsTrigger>
                </TabsList>
                <TabsContent value="kit">
                    <KitCheckoutHistory setShowBorrowDialog={setShowBorrowDialog} />
                </TabsContent>
                <TabsContent value="equipment">
                    <EquipmentCheckoutHistory />
                </TabsContent>
            </Tabs>
        </div>
    )
}