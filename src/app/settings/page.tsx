"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import SiteShell from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Settings, Camera, LogOut, Link2 } from "lucide-react";
import { updateMe } from "@/lib/db";
import { uploadAvatar } from "@/lib/cdn";
import { toast } from "react-toastify"; // Assuming react-toastify is setup
import TwoFactorSettings from "@/components/settings/TwoFactorSettings";
// Note: If existing toast is different, I will adapt. components/ui/global-toast-container exists.

const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Güvenlik", icon: Shield },
    { id: "accounts", label: "Bağlı Hesaplar", icon: Link2 },
    { id: "general", label: "Genel", icon: Settings },
];
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SettingsPage() {
    const { user, logout, refreshAuth } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Dosya 2MB'dan büyük olamaz.");
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Oturum açmanız gerekiyor.");

            const result = await uploadAvatar(file, token);
            if (result && result.url) {
                await updateMe({ avatar: result.url }, token);
                toast.success("Profil fotoğrafı güncellendi.");
                await refreshAuth();
            } else {
                toast.error("Yükleme başarısız.");
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Oturum açmanız gerekiyor.");

            const success = await updateMe({ displayName, username, email }, token);

            if (success) {
                toast.success("Profil bilgileri güncellendi.");
                await refreshAuth();
            } else {
                toast.error("Profil güncellenemedi.");
            }
        } catch {
            toast.error("Profil güncellenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_API_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Şifre başarıyla değiştirildi.");
                setNewPassword("");
                setCurrentPassword("");
            } else {
                toast.error(data.error || "Şifre değiştirilemedi.");
            }
        } catch {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkLova = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_API_URL}/api/auth/link-lova`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Lova hesabınız başarıyla bağlandı!");
                await refreshAuth(); // Refresh user data
            } else {
                toast.error(data.error || "Bağlantı başarısız.");
            }
        } catch (error) {
            console.error("Link Lova error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlinkLova = async () => {
        if (!confirm("Lova bağlantısını kaldırmak istediğinize emin misiniz?")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_API_URL}/api/auth/unlink-lova`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Lova bağlantısı kaldırıldı.");
                await refreshAuth();
            } else {
                toast.error(data.error || "Bağlantı kaldırılamadı.");
            }
        } catch (error) {
            console.error("Unlink Lova error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup2FA = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_API_URL}/api/account/2fa/setup`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (data.secret) {
                setTwoFactorSecret(data.secret);
                toast.info("Authenticator uygulamanıza gizli anahtarı ekleyin.");
            } else {
                toast.error(data.message || "2FA kurulumu başlatılamadı.");
            }
        } catch {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
            toast.error("Lütfen 6 haneli kodu girin.");
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_API_URL}/api/account/2fa/verify`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ code: twoFactorCode })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("2FA başarıyla etkinleştirildi!");
                setTwoFactorSecret(null);
                setTwoFactorCode("");
            } else {
                toast.error(data.message || "Kod doğrulanamadı.");
            }
        } catch {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleNotifications = () => {
        const newValue = !emailNotifications;
        setEmailNotifications(newValue);
        toast.success(newValue ? "E-posta bildirimleri açıldı." : "E-posta bildirimleri kapatıldı.");
    };

    if (!user) {
        return (
            <SiteShell>
                <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-secondary)]">
                    Lütfen önce giriş yapın.
                </div>
            </SiteShell>
        );
    }

    return (
        <SiteShell>
            <div className="min-h-screen container mx-auto px-4 py-24 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                        <div className="mb-6 px-2">
                            <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                            <p className="text-sm text-[var(--text-secondary)]">Hesabınızı yönetin</p>
                        </div>

                        <div className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? "text-white bg-[rgba(30,184,255,0.1)]"
                                        : "text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="relative z-10">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-4"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "profile" && (
                                    <div className="space-y-6">
                                        {/* Avatar Section */}
                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardHeader>
                                                <CardTitle>Profil Fotoğrafı</CardTitle>
                                                <CardDescription>Kendinizi tanıtın.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex items-center gap-6">
                                                <div className="relative group">
                                                    {user.avatar ? (
                                                        <Image
                                                            src={user.avatar || ""}
                                                            alt={user.displayName || user.username || "User"}
                                                            width={96}
                                                            height={96}
                                                            unoptimized
                                                            className="w-24 h-24 rounded-full object-cover shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                                            {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <Camera className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <input
                                                        type="file"
                                                        ref={avatarInputRef}
                                                        onChange={handleAvatarUpload}
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        className="text-xs"
                                                        disabled={isLoading}
                                                        onClick={() => avatarInputRef.current?.click()}
                                                    >
                                                        {isLoading ? "Yükleniyor..." : "Fotoğraf Yükle"}
                                                    </Button>
                                                    <p className="text-xs text-[var(--text-muted)]">JPG, GIF veya PNG. Max 2MB.</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Info Section */}
                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardHeader>
                                                <CardTitle>Kişisel Bilgiler</CardTitle>
                                                <CardDescription>Görünen adınız ve iletişim bilgileriniz.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                                    <div className="grid gap-2">
                                                        <label className="text-sm font-medium text-[var(--text-secondary)]">Görünen Ad</label>
                                                        <Input
                                                            value={displayName}
                                                            onChange={(e) => setDisplayName(e.target.value)}
                                                            placeholder="Adınız"
                                                            className="bg-[rgba(0,0,0,0.2)] border-[var(--glass-border)]"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <label className="text-sm font-medium text-[var(--text-secondary)]">E-posta</label>
                                                        <Input
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="E-posta Adresiniz"
                                                            disabled={isLoading}
                                                            className="bg-[rgba(0,0,0,0.2)] border-[var(--glass-border)]"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <label className="text-sm font-medium text-[var(--text-secondary)]">Kullanıcı Adı</label>
                                                        <Input
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            placeholder="Kullanıcı Adınız"
                                                            disabled={isLoading}
                                                            className="bg-[rgba(0,0,0,0.2)] border-[var(--glass-border)]"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <Button disabled={isLoading} type="submit" className="bg-[var(--color-turkish-blue-500)] hover:bg-[var(--color-turkish-blue-600)] text-white">
                                                            {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "security" && (
                                    <div className="space-y-6">
                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardHeader>
                                                <CardTitle>Şifre</CardTitle>
                                                <CardDescription>Hesabınızın güvenliği için güçlü bir şifre kullanın.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                                    <div className="grid gap-2">
                                                        <label className="text-sm font-medium text-[var(--text-secondary)]">Mevcut Şifre</label>
                                                        <Input
                                                            type="password"
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="bg-[rgba(0,0,0,0.2)] border-[var(--glass-border)]"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <label className="text-sm font-medium text-[var(--text-secondary)]">Yeni Şifre</label>
                                                        <Input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="bg-[rgba(0,0,0,0.2)] border-[var(--glass-border)]"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <Button disabled={isLoading} type="submit" className="bg-[var(--color-turkish-blue-500)] hover:bg-[var(--color-turkish-blue-600)] text-white">
                                                            {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardContent className="pt-6">
                                                <TwoFactorSettings token={localStorage.getItem("authToken") || ""} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "accounts" && (
                                    <div className="space-y-6">
                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardHeader>
                                                <CardTitle>Bağlı Hesaplar</CardTitle>
                                                <CardDescription>Tengra ve Lova hesap bağlantılarınızı yönetin.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Tengra Connection */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(30,184,255,0.05)] border border-[rgba(72,213,255,0.2)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-turkish-blue-500)] flex items-center justify-center text-white font-bold">
                                                            T
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">Tengra</div>
                                                            <div className="text-xs text-[var(--text-muted)]">Ana hesap</div>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                        BAĞLI
                                                    </div>
                                                </div>

                                                {/* Lova Connection */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                            L
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">Lova</div>
                                                            <div className="text-xs text-[var(--text-muted)]">Sosyal bağlantı platformu</div>
                                                        </div>
                                                    </div>
                                                    {user.source === "lova" || user.source === "both" ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                                BAĞLI
                                                            </div>
                                                            {user.source === "both" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={isLoading}
                                                                    onClick={handleUnlinkLova}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                                                                >
                                                                    {isLoading ? "..." : "Çıkar"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isLoading}
                                                            onClick={handleLinkLova}
                                                            className="border-[var(--glass-border)] hover:bg-[rgba(30,184,255,0.1)] text-xs"
                                                        >
                                                            {isLoading ? "Bağlanıyor..." : "Lova'ya Bağlan"}
                                                        </Button>
                                                    )}
                                                </div>

                                                <p className="text-xs text-[var(--text-muted)] pt-2">
                                                    Lova hesabınızı bağlayarak her iki platformda da aynı kimlik bilgilerinizle giriş yapabilirsiniz.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "general" && (
                                    <div className="space-y-6">
                                        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
                                            <CardHeader>
                                                <CardTitle>Tercihler</CardTitle>
                                                <CardDescription>Uygulama deneyiminizi kişiselleştirin.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div
                                                    className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-0 cursor-pointer"
                                                    onClick={handleToggleNotifications}
                                                >
                                                    <div className="space-y-0.5">
                                                        <div className="text-sm font-medium text-white">Bildirimler</div>
                                                        <div className="text-xs text-[var(--text-muted)]">E-posta bildirimlerini al.</div>
                                                    </div>
                                                    <div className={`h-5 w-9 rounded-full transition-colors ${emailNotifications ? 'bg-[var(--color-turkish-blue-500)]' : 'bg-gray-600'} relative`}>
                                                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between py-4">
                                                    <div className="space-y-0.5">
                                                        <div className="text-sm font-medium text-white">Dil</div>
                                                        <div className="text-xs text-[var(--text-muted)]">Uygulama dilini değiştirin.</div>
                                                    </div>
                                                    <div className="text-sm text-[var(--text-secondary)]">Türkçe (Varsayılan)</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
