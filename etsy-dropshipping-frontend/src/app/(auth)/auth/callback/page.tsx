"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Loader2 } from "lucide-react"

function CallbackHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuthStore()

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            // Decode token to get user info (or fetch profile)
            // For now, we just save token and redirect.
            //Ideally, backend should return user info in query too or we fetch it.
            // Assuming simple jwt where we can decode or just use it.

            // Let's assume we need to fetch profile or parse token.
            // Simplest integration:
            login({ email: "google-user", fullName: "Google User" } as any, token) // Placeholder user

            // Allow state to update then redirect
            setTimeout(() => {
                router.push("/dashboard")
            }, 500)
        } else {
            router.push("/login")
        }
    }, [searchParams, router, login])

    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Giriş yapılıyor...</span>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackHandler />
        </Suspense>
    )
}
