"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { loginUser } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { GoogleLoginButton } from "@/components/auth/google-login-button"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuthStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = await loginUser(values)
            login(data.user, data.access_token)
            toast.success("Login successful")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="m@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Login</Button>
                    </form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <GoogleLoginButton />
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-gray-600">
                    Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
            </CardFooter>
        </Card>
    )
}
