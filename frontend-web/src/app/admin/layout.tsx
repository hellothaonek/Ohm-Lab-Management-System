import ProtectedLayout from "@/components/hoc/ProtectedLayout";
import DashboardLayout from "../../components/dashboard-layout";
import type React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout allowedRoles={["Admin"]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedLayout>
    );
}