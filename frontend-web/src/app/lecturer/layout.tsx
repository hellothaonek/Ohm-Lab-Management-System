import ProtectedLayout from "@/components/hoc/ProtectedLayout";
import DashboardLayout from "../../components/dashboard-layout";
import type React from "react";

export default function LecturerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout allowedRoles={["Lecturer"]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedLayout>
    );
}