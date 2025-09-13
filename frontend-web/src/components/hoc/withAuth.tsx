"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-toastify";

// Định nghĩa kiểu dữ liệu cho user
interface User {
    userRoleName: string;
    // ... các trường khác
}

// Định nghĩa các vai trò hợp lệ
type UserRole = "Admin" | "HeadOfDepartment" | "Lecturer" | "Student";

// Sử dụng generic type <P> để withAuth có thể bọc component có props
const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles?: UserRole[]
) => {
    const AuthWrapper = (props: P) => {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            // 1. Nếu đang loading, không làm gì cả
            if (loading) {
                return;
            }

            // 2. Nếu không có người dùng, chuyển hướng đến trang đăng nhập
            if (!user) {
                toast.error("Vui lòng đăng nhập để truy cập trang này.");
                router.push("/");
                return;
            }

            // 3. Nếu có danh sách vai trò cho phép, kiểm tra vai trò của người dùng
            if (allowedRoles) {
                const currentUserRole = (user as User).userRoleName;
                if (!allowedRoles.includes(currentUserRole as UserRole)) {
                    toast.error("Bạn không có quyền truy cập trang này.");
                    // Chuyển hướng đến trang dashboard phù hợp hoặc trang lỗi
                    router.push("/dashboard");
                }
            }
        }, [user, loading, router, allowedRoles]);

        // Hiển thị trạng thái loading trong khi chờ
        if (loading) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <Spinner />
                </div>
            );
        }

        // Nếu có user và không có vai trò cho phép hoặc vai trò hợp lệ, render component
        if (user && (!allowedRoles || allowedRoles.includes((user as User).userRoleName as UserRole))) {
            return <WrappedComponent {...props} />;
        }

        // Trường hợp không có quyền, render component rỗng hoặc thông báo lỗi
        return null;
    };

    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    AuthWrapper.displayName = `withAuth(${wrappedComponentName})`;

    return AuthWrapper;
};

export default withAuth;