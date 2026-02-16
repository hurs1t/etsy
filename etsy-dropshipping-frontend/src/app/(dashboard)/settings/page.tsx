"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEtsyAuthUrl, disconnectEtsy } from "@/services/product.service";
import { toast } from "sonner";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import axios from "@/lib/axios";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    const handleConnectEtsy = async () => {
        try {
            const data = await getEtsyAuthUrl();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Failed to get Etsy Auth URL");
            }
        } catch (error) {
            toast.error("Error connecting to Etsy");
        }
    };

    const handleUpdatePassword = async () => {
        if (!password || password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            await axios.post('/auth/update-password', { password });
            toast.success("Şifreniz başarıyla güncellendi/oluşturuldu.");
            setPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Şifre güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Hesap Ayarları</CardTitle>
                    <CardDescription>
                        Google ile giriş yaptıysanız buradan kendinize bir şifre belirleyebilir ve bu şifre ile Chrome Extension'a giriş yapabilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">E-posta</Label>
                        <Input type="email" id="email" value={user?.email || ''} disabled />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="password">Yeni Şifre</Label>
                        <Input
                            type="password"
                            id="password"
                            placeholder="Yeni şifrenizi girin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={loading}>
                        {loading ? "Kaydediliyor..." : "Şifreyi Kaydet"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Entegrasyonları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div>
                            <p className="font-medium">Etsy Mağazası</p>
                            <p className="text-sm text-muted-foreground">Ürünleri yayınlamak için Etsy mağazanızı bağlayın.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={async () => {
                                console.log("Disconnect button clicked");
                                if (disconnecting) return;
                                setDisconnecting(true);
                                try {
                                    console.log("Calling disconnectEtsy...");
                                    await disconnectEtsy();
                                    console.log("Disconnect success");
                                    toast.success("Etsy bağlantısı kesildi.");
                                    window.location.reload();
                                } catch (e: any) {
                                    console.error("Disconnect error:", e);
                                    toast.error(e.response?.data?.message || e.message || "Bağlantı kesilemedi.");
                                } finally {
                                    setDisconnecting(false);
                                }
                            }} variant="destructive" size="sm" disabled={disconnecting}>
                                {disconnecting ? "Kesiliyor..." : "Bağlantıyı Kes"}
                            </Button>
                            <Button onClick={handleConnectEtsy} variant="outline">Etsy'ye Bağlan</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
