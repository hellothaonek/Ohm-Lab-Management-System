"use client"

import type * as React from "react"
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: "head" | "lecturer" | "admin" | "student"
  userFullName: string
}

export function AppSidebar({ role, userFullName, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()

  const roleTitle =
    role === "head"
      ? "Head of Department"
      : role === "lecturer"
      ? "Lecturer"
      : role === "admin"
      ? "System Administrator"
      : "Student"

  const navItems = [
    {
      title: "Dashboard",
      href: `/${role}/dashboard`,
      icon: BarChart3,
      roles: ["head", "lecturer", "admin", "student"] as const,
    },
    {
      title: "Semester",
      href: `/${role}/dashboard/semester`,
      icon: Calendar,
      roles: ["admin"] as const,
    },
    {
      title: "Slot",
      href: `/${role}/dashboard/slot`,
      icon: Clock,
      roles: ["admin"] as const,
    },
    {
      title: "Schedule",
      href: role === "student" ? `/${role}/schedule` : `/${role}/dashboard/schedule`,
      icon: Calendar,
      roles: ["head", "lecturer", "student", "admin"] as const,
    },
    {
      title: "Lab Booking",
      href: `/${role}/dashboard/lab-booking`,
      icon: Calendar,
      roles: ["head", "lecturer"] as const,
    },
    {
      title: "Classes",
      href: role === "student" ? `/${role}/classes` : `/${role}/dashboard/classes`,
      icon: Users,
      // Hợp nhất: giữ quyền head từ main và cho admin từ minhne
      roles: ["head", "admin"] as const,
    },
    {
      title: "My Classes",
      href: `/${role}/dashboard/my-classes`,
      icon: Users,
      roles: ["student", "lecturer"] as const,
    },
    {
      title: "Labs",
      href: role === "student" ? `/${role}/labs` : `/${role}/dashboard/labs`,
      icon: Database,
      roles: ["student"] as const,
    },
    {
      title: "Equipment",
      href: `/${role}/dashboard/equipment`,
      icon: Database,
      roles: ["head", "lecturer"] as const,
    },
    {
      title: "Equipment Handover",
      href: `/${role}/dashboard/equipment-handover`,
      icon: ClipboardList,
      roles: ["lecturer"] as const,
    },
    {
      title: "Courses",
      href: `/${role}/dashboard/courses`,
      icon: Database,
      roles: ["head"] as const,
    },
    {
      title: "My Courses",
      href: role === "student" ? `/${role}/courses` : `/${role}/dashboard/courses`,
      icon: Database,
      roles: ["student"] as const,
    },
    {
      title: "Kit",
      href: `/${role}/dashboard/kit`,
      icon: Plug,
      roles: ["head"] as const,
    },
    {
      title: "Reports",
      href: role === "student" ? `/${role}/report` : `/${role}/dashboard/reports`,
      icon: BarChart3,
      roles: ["head", "lecturer", "admin", "student"] as const,
    },
    {
      title: "User Management",
      href: `/${role}/dashboard/users`,
      icon: Users,
      roles: ["admin"] as const,
    },
  ] as const

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role as any))

  return (
    <Sidebar collapsible="icon" {...props} className="bg-orange-50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={role === "student" ? `/${role}/classes` : `/${role}/dashboard`}>
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
            {state === "expanded" ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="flex-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName || "User"} />
                        <AvatarFallback className="rounded-lg">
                          {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{userFullName || "User"}</span>
                        <span className="truncate text-xs">{roleTitle}</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName || "User"} />
                          <AvatarFallback className="rounded-lg">
                            {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{userFullName || "User"}</span>
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
                <SidebarTrigger className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName || "User"} />
                        <AvatarFallback className="rounded-lg">
                          {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{userFullName || "User"}</span>
                        <span className="truncate text-xs">{roleTitle}</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userFullName || "User"} />
                          <AvatarFallback className="rounded-lg">
                            {userFullName ? userFullName.slice(0, 2).toUpperCase() : "JD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{userFullName || "User"}</span>
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
                <div className="flex justify-center">
                  <SidebarTrigger className="h-8 w-8" />
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}