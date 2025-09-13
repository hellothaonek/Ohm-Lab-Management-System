import type React from "react";
import DashboardLayout from "../../components/dashboard-layout";
import ProtectedLayout from "@/components/hoc/ProtectedLayout";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout allowedRoles={["Student"]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedLayout>
    );
}