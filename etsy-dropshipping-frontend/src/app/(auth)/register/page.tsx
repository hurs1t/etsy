"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { registerUser } from "@/services/auth.service"
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

const formSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegisterPage() {
    const router = useRouter()
    const { login } = useAuthStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = await registerUser(values)
            login(data.user, data.access_token)
            toast.success("Registration successful")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <Button type="submit" className="w-full">Create Account</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </CardFooter>
        </Card>
    )
}
