"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbNavProps {
    items: { title: string; href?: string; icon?: React.ComponentType<{ className?: string }> }[]
    showHome?: boolean
    className?: string
}

export function BreadcrumbNav({ items, showHome = true, className }: BreadcrumbNavProps) {
    return (
        <div className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
            {showHome && (
                <>
                    <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                        <Home className="h-4 w-4 mr-1" />
                        Home
                    </Link>
                    {items.length > 0 && <ChevronRight className="h-4 w-4" />}
                </>
            )}

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.href ? (
                        <Link href={item.href} className="flex items-center hover:text-foreground transition-colors">
                            {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                            {item.title}
                        </Link>
                    ) : (
                        <span className="flex items-center text-foreground font-medium">
                            {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                            {item.title}
                        </span>
                    )}
                    {index < items.length - 1 && <ChevronRight className="h-4 w-4" />}
                </React.Fragment>
            ))}
        </div>
    )
}

// Alternative using shadcn/ui Breadcrumb components
export function ShadcnBreadcrumbNav({ items, showHome = true, className }: BreadcrumbNavProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                {showHome && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="flex items-center">
                                <Home className="h-4 w-4 mr-1" />
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {items.length > 0 && <BreadcrumbSeparator />}
                    </>
                )}

                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink href={item.href} className="flex items-center">
                                    {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                                    {item.title}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="flex items-center">
                                    {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                                    {item.title}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < items.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
