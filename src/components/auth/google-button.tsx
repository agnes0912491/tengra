"use client";

import { useEffect, useState, useRef } from "react"

interface GoogleButtonProps {
    onSuccess: (credential: string) => void
    onError?: () => void
}

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
    const [isMounted, setIsMounted] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const checkGoogle = () => {
            const google = (window as any).google;
            if (google?.accounts?.id) {
                initButton(google);
                return true;
            }
            return false;
        };

        if (!checkGoogle()) {
            const timer = setInterval(() => {
                if (checkGoogle()) {
                    clearInterval(timer);
                }
            }, 500);
            return () => clearInterval(timer);
        }

        function initButton(google: any) {
            try {
                const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
                console.log("[GoogleButton] Initializing with Client ID:", client_id ? "PRESENT" : "MISSING");

                google.accounts.id.initialize({
                    client_id: client_id,
                    callback: (response: any) => {
                        console.log("[GoogleButton] Response received:", response);
                        if (response.credential) {
                            onSuccess(response.credential);
                        } else {
                            console.error("[GoogleButton] No credential in response - possible error code:", response.error);
                            onError?.();
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    ux_mode: 'popup',
                    context: 'signin',
                    itp_support: true, // For better Safari/Mobile support
                });

                if (buttonRef.current) {
                    console.log("[GoogleButton] Rendering button...");
                    google.accounts.id.renderButton(buttonRef.current, {
                        theme: "outline",
                        size: "large",
                        width: buttonRef.current.offsetWidth || 350,
                        text: "continue_with",
                        logo_alignment: "left",
                        locale: "tr"
                    });
                }
            } catch (e) {
                console.error("[GoogleButton] Init Error:", e);
                onError?.();
            }
        }
    }, [isMounted, onSuccess, onError]);

    if (!isMounted) return <div className="w-full h-[45px] animate-pulse bg-[rgba(15,31,54,0.4)] rounded-xl" />;

    return (
        <div className="w-full flex justify-center py-2 min-h-[50px]">
            <div ref={buttonRef} className="w-full max-w-[400px]" />
        </div>
    );
}

// Add global type for window.google
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void
                    renderButton: (parent: HTMLElement, options: any) => void
                    prompt: (callback?: (notification: any) => void) => void
                }
            }
        }
    }
}
