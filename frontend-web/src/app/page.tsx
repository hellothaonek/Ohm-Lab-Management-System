"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { loginGoogle } from "../services/userServices"; // ✅ gọi API
import config from "../config/config"; // ✅ chứa GOOGLE_CLIENT_ID

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Xử lý login thành công từ Google
  const handleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      console.error("Google credential is undefined");
      return;
    }

    const googleId = response.credential;
    setIsLoading(true);

    try {
      const apiResponse = await loginGoogle({ googleId });

      if (!apiResponse || !apiResponse.user) {
        throw new Error("Invalid response from server");
      }

      const userRole = apiResponse.user.userRoleName;
      localStorage.setItem("googleId", googleId);

      // ✅ Điều hướng theo role
      switch (userRole) {
        case "Admin":
          router.push("/admin/dashboard");
          break;
        case "HeadOfDepartment":
          router.push("/head/dashboard");
          break;
        case "Lecturer":
          router.push("/lecturer/dashboard");
          break;
        case "Student":
          router.push("/student/dashboard");
          break;
        default:
          toast.error("Unknown user role");
          break;
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error?.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 font-bold"
        >
          <CircuitBoard className="h-6 w-6 text-orange-500" />
          <span>Ohm Electronics Lab</span>
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Sign in with your @fpt.edu.vn account to access the lab management
              system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative space-y-2">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => {
                  toast.error("Google login failed");
                  setIsLoading(false);
                }}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="center"
              />
              {isLoading && (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Logging in...
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}
