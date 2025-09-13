"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-toastify";

type UserRole = "Admin" | "HeadOfDepartment" | "Lecturer" | "Student";

export default function ProtectedLayout({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // 1. Nếu đang tải, đợi
        if (loading) {
            return;
        }

        // 2. Nếu không có người dùng, chuyển hướng đến trang đăng nhập
        if (!user) {
            toast.error("Vui lòng đăng nhập để truy cập trang này.");
            router.push("/");
            return;
        }

        const currentUserRole = user.userRoleName;

        // 3. Nếu vai trò không được phép, chuyển hướng và thông báo lỗi
        if (!allowedRoles.includes(currentUserRole as UserRole)) {
            toast.error("Bạn không có quyền truy cập trang này.");
            router.push("/"); // Chuyển hướng đến dashboard chung
        }
    }, [user, loading, router, allowedRoles]);

    // Hiển thị loading trong khi chờ
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Nếu vai trò hợp lệ, render component
    const currentUserRole = user?.userRoleName;
    if (user && allowedRoles.includes(currentUserRole as UserRole)) {
        return <>{children}</>;
    }

    // Trường hợp không có quyền, không render gì cả
    return null;
}