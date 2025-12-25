import { Zap, Key, Bell, Users, Shield } from "lucide-react";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export type Endpoint = {
    method: HttpMethod;
    path: string;
    description: string;
    auth?: boolean;
    admin?: boolean;
    body?: string[];
    response?: string;
    note?: string;
};

export type Section = {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    endpoints: Endpoint[];
};

export type ApiDoc = {
    id: string;
    title: string;
    subtitle: string;
    baseUrl: string;
    localUrl: string;
    sections: Section[];
};

export const tengraApi: ApiDoc = {
    id: "tengra",
    title: "Tengra Core API",
    subtitle: "Auth ve kullanıcı yönetimi",
    baseUrl: "https://api.tengra.studio",
    localUrl: "http://localhost:5000",
    sections: [
        {
            id: "health",
            title: "Health",
            icon: <Zap className="w-5 h-5" />,
            description: "Sistem durumu kontrolü",
            endpoints: [
                { method: "GET", path: "/health", description: "Sistem durumu", response: "{ status, service, version, timestamp }" },
            ],
        },
        {
            id: "auth",
            title: "Authentication",
            icon: <Key className="w-5 h-5" />,
            description: "Oturum yönetimi",
            endpoints: [
                { method: "POST", path: "/auth/login", description: "Giriş yap", body: ["email | username", "password"], response: "{ token, user }" },
                { method: "POST", path: "/auth/register", description: "Kayıt ol", body: ["username", "email", "password", "displayName", "phone?"] },
            ],
        },
        {
            id: "notifications",
            title: "Notifications",
            icon: <Bell className="w-5 h-5" />,
            description: "Bildirim yönetimi",
            endpoints: [
                { method: "GET", path: "/notifications", description: "Bildirimleri listele", auth: true },
                { method: "POST", path: "/notifications/:id/read", description: "Okundu işaretle", auth: true },
            ],
        },
    ],
};

export const lovaApi: ApiDoc = {
    id: "lova",
    title: "Lova API",
    subtitle: "Mobil/web için auth, profil, partner ve notification uçları",
    baseUrl: "https://api.lova.tengra.studio",
    localUrl: "http://localhost:4001",
    sections: [
        {
            id: "lova-auth",
            title: "Authentication",
            icon: <Key className="w-5 h-5" />,
            description: "Kullanıcı kimlik doğrulama",
            endpoints: [
                { method: "POST", path: "/auth/register", description: "Kayıt ol", body: ["email", "password", "firstName", "lastName", "username", "...profil alanları"] },
                { method: "POST", path: "/auth/login", description: "Giriş yap", body: ["email", "password"] },
                { method: "GET", path: "/auth/me", description: "Mevcut kullanıcı bilgisi", auth: true },
                { method: "POST", path: "/auth/logout", description: "Çıkış yap", auth: true },
            ],
        },
        {
            id: "lova-profile",
            title: "Profile & Preferences",
            icon: <Users className="w-5 h-5" />,
            description: "Profil ve tercih yönetimi",
            endpoints: [
                { method: "GET", path: "/account/profile", description: "Profil bilgilerini getir", auth: true },
                { method: "POST", path: "/account/profile", description: "Profil güncelle", auth: true, body: ["displayName", "bio", "avatar", "locationLabel", "tags", "hobbies", "orientation", "lookingFor", "musicTastes"] },
                { method: "GET", path: "/account/preferences", description: "Tercihleri getir", auth: true, response: "{ privacy, notifications }" },
                { method: "POST", path: "/account/preferences", description: "Tercihleri güncelle", auth: true, body: ["privacy", "notifications"] },
            ],
        },
        {
            id: "lova-partner",
            title: "Partner Links",
            icon: <Shield className="w-5 h-5" />,
            description: "Partner bağlantı yönetimi",
            endpoints: [
                { method: "GET", path: "/account/partner-links", description: "Partner bağlantılarını listele", auth: true },
                { method: "POST", path: "/account/partner-links/:id/status", description: "Bağlantı durumunu güncelle", auth: true, body: ["status: Accepted | Rejected"] },
            ],
        },
        {
            id: "lova-notifications",
            title: "Notifications",
            icon: <Bell className="w-5 h-5" />,
            description: "Bildirim yönetimi",
            endpoints: [
                { method: "GET", path: "/notifications", description: "Bildirimleri listele", auth: true },
                { method: "POST", path: "/notifications/:id/read", description: "Okundu işaretle", auth: true },
            ],
        },
    ],
};
