"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EquipmentTab from "@/components/head/equipment/EquipmentTab"
import EquipmentTypeTab from "@/components/head/equipment/EquipmentTypeTab"

export default function EquipmentPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Equipment Management</h1>
            <Tabs defaultValue="equipment" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="equipment-type">Equipment Type</TabsTrigger>
                </TabsList>
                <TabsContent value="equipment">
                    <EquipmentTab />
                </TabsContent>
                <TabsContent value="equipment-type">
                    <EquipmentTypeTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}