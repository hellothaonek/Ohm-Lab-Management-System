"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CircuitBoard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState("lecturer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would authenticate with your backend here
    // For now, we'll just redirect based on the selected role
    if (role === "head") {
      router.push("/dashboard/head")
    } else if (role === "lecturer") {
      router.push("/dashboard/lecturer")
    } else if (role === "admin") {
      router.push("/dashboard/admin")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 font-bold">
        <CircuitBoard className="h-6 w-6 text-orange-500" />
        <span>Ohm Electronics Lab</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access the lab management system</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head">Head of Department</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m.example@fpt.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
