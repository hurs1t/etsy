
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEtsyAuthUrl, disconnectEtsy } from "@/services/product.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLangStore } from "@/stores/lang-store";
import axios from "@/lib/axios";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const { t } = useLangStore();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

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
            toast.success(t('passwordUpdateSuccess'));
            setPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('passwordUpdateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (disconnecting) return;
        setDisconnecting(true);
        try {
            await disconnectEtsy();
            toast.success(t('disconnectSuccess'));
            window.location.reload();
        } catch (e: any) {
            toast.error(e.response?.data?.message || e.message || "Bağlantı kesilemedi.");
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black italic tracking-tight uppercase">{t('settings')}</h1>
                <p className="text-slate-500 font-medium">Manage your account preferences and integrations.</p>
            </div>

            <div className="grid gap-8">
                {/* Account Settings */}
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-8">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {t('accountSettings')}
                        </CardTitle>
                        <CardDescription className="font-bold text-slate-400 italic">
                            {t('accountSettingsDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('email')}
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                value={user?.email || ''}
                                disabled
                                className="h-12 bg-slate-50 dark:bg-zinc-800 border-2 border-transparent font-bold italic text-slate-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {t('newPassword')}
                            </Label>
                            <div className="flex gap-4">
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder={t('passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 focus:border-primary transition-all font-bold"
                                />
                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={loading}
                                    className="h-12 px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black uppercase tracking-widest text-[10px] shadow-lg shrink-0"
                                >
                                    {loading ? t('saving') : t('savePassword')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* API Integrations */}
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-8">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hub</span>
                            {t('apiIntegrations')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-8 flex items-center justify-between group">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-black italic text-lg uppercase">{t('etsyShop')}</p>
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{t('etsyShopDesc')}</p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleDisconnect}
                                    variant="ghost"
                                    className="h-12 px-6 font-black uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-50 transition-all underline underline-offset-4 decoration-2"
                                    disabled={disconnecting}
                                >
                                    {disconnecting ? t('disconnecting') : t('disconnect')}
                                </Button>
                                <Button
                                    onClick={handleConnectEtsy}
                                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                >
                                    {t('connectEtsy')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
