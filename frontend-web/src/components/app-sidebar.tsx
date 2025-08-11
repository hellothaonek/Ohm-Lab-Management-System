"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    CircuitBoard,
    Plug,
    Calendar,
    Users,
    Database,
    ClipboardList,
    BarChart3,
    User,
    Settings,
    LogOut,
    Clock,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "../components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { getCurrentUser } from "@/services/userServices"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    role: "head" | "lecturer" | "admin" | "student"
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const [userFullName, setUserFullName] = useState<string>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const roleTitle = role === "head" ? "Head of Department" :
        role === "lecturer" ? "Lecturer" :
            role === "admin" ? "System Administrator" :
                "Student"

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser()
                setUserFullName(userData.userFullName)
            } catch (error) {
                console.error("Failed to fetch user:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    const navItems = [
        {
            title: "Dashboard",
            href: `/${role}/dashboard`,
            icon: BarChart3,
            roles: ["head", "lecturer", "admin", "student"],
        },
        {
            title: "Semester",
            href: `/${role}/dashboard/semester`,
            icon: Calendar,
            roles: ["admin"],
        },
        {
            title: "Slot",
            href: `/${role}/dashboard/slot`,
            icon: Clock,
            roles: ["admin"],
        },
        {
            title: "Schedule",
            href: `/${role}/dashboard/schedule`,
            icon: Calendar,
            roles: ["head", "lecturer", "student", "admin"],
        },
        {
            title: "Classes",
            href: `/${role}/dashboard/classes`,
            icon: Users,
            roles: ["head"],
        },
        {
            title: "My Classes",
            href: `/${role}/dashboard/my-classes`,
            icon: Users,
            roles: ["student", "lecturer"],
        },
        {
            title: "Equipment",
            href: `/${role}/dashboard/equipment`,
            icon: Database,
            roles: ["head", "lecturer"],
        },
        {
            title: "Equipment Handover",
            href: `/${role}/dashboard/equipment-handover`,
            icon: ClipboardList,
            roles: ["lecturer"],
        },
        {
            title: "Courses",
            href: `/${role}/dashboard/courses`,
            icon: Database,
            roles: ["head"],
        },
        {
            title: "My Courses",
            href: `/${role}/dashboard/courses`,
            icon: Database,
            roles: ["lecturer", "student"],
        },
        {
            title: "Kit",
            href: `/${role}/dashboard/kit`,
            icon: Plug,
            roles: ["head"],
        },
        {
            title: "Reports",
            href: `/${role}/dashboard/reports`,
            icon: BarChart3,
            roles: ["head", "lecturer", "admin"],
        },
        {
            title: "User Management",
            href: `/${role}/dashboard/users`,
            icon: Users,
            roles: ["admin"],
        },
    ]

    const filteredNavItems = navItems.filter((item) => item.roles.includes(role))

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${role}/dashboard`}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-500 text-sidebar-primary-foreground">
                                    <CircuitBoard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Ohm Electronics Lab</span>
                                    <span className="truncate text-xs">FPT University HCMC</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href} className="hover:text-orange-500">
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName} />
                                        <AvatarFallback className="rounded-lg">
                                            {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {isLoading ? "Loading..." : userFullName}
                                        </span>
                                        <span className="truncate text-xs">{roleTitle}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName} />
                                            <AvatarFallback className="rounded-lg">
                                                {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {isLoading ? "Loading..." : userFullName}
                                            </span>
                                            <span className="truncate text-xs">{roleTitle}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/${role}/profile`} className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/${role}/settings`} className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/" className="flex items-center gap-2 text-red-500">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}