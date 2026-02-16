"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function GoogleLoginButton() {
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3001/auth/google"
    }

    return (
        <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full">
            <Icons.google className="mr-2 h-4 w-4" />
            Google ile Giriş Yap
        </Button>
    )
}
