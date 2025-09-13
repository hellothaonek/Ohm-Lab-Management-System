// app/dashboard/layout.tsx
"use client"

import React from "react"
import { Bell } from "lucide-react"
import { AppSidebar } from "../components/app-sidebar"
import { Button } from "../components/ui/button"
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar"
import { LoadingSkeleton } from "./loading-skeleton"
import { useAuth } from "@/context/AuthContext"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const breadcrumbs = useBreadcrumbs()

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!user || !user.userRoleName) {
    return <div>Error: Invalid user data or role not found</div>
  }

  const roleMap: { [key: string]: "head" | "lecturer" | "admin" | "student" } = {
    HeadOfDepartment: "head",
    Lecturer: "lecturer",
    Admin: "admin",
    Student: "student",
  }
  const role = roleMap[user.userRoleName] || null

  if (!role) {
    return <div>Error: Invalid user role</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar role={role} userFullName={user.userFullName || "Unknown User"} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex-grow pl-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {/* Mục cuối cùng là BreadcrumbPage, các mục còn lại là BreadcrumbLink */}
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {/* Thêm BreadcrumbSeparator nếu không phải là mục cuối cùng */}
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>

        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground">
              © 2025 Ohm Electronics Lab - FPT University Ho Chi Minh City
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}