// src/hooks/use-breadcrumbs.ts
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// Hàm chuyển đổi slug thành tiêu đề dễ đọc
const formatSlug = (slug: string) => {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export function useBreadcrumbs() {
    const pathname = usePathname();

    const breadcrumbs = useMemo(() => {
        // Danh sách các role để xác định role segment
        const roles = ["lecturer", "student", "admin", "head"];

        // Lấy tất cả các segment
        const pathSegments = pathname.split("/").filter(Boolean);

        // Tìm role và dashboard segment
        const role = pathSegments.find((segment) => roles.includes(segment));
        const dashboardIndex = pathSegments.findIndex(
            (segment) => segment === "dashboard"
        );

        // Nếu không có role, trả về dashboard mặc định
        if (!role) {
            return [{ label: "Dashboard", href: "/dashboard" }];
        }

        // Tạo mảng breadcrumb
        const items = pathSegments.reduce((acc, segment, index) => {
            // Bỏ qua role segment và dashboard segment trong logic này
            if (roles.includes(segment) || segment === "dashboard") {
                return acc;
            }

            // Tạo đường dẫn bằng cách nối các segment từ đầu đến segment hiện tại
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const label = formatSlug(segment);

            acc.push({ label, href });
            return acc;
        }, [] as { label: string; href: string }[]);

        // Thêm mục "Dashboard" vào đầu tiên
        items.unshift({ label: "Dashboard", href: `/${role}/dashboard` });

        return items;
    }, [pathname]);

    return breadcrumbs;
}