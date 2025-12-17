"use client"

import { useEffect, useRef } from "react"

interface GoogleButtonProps {
    onSuccess: (credential: string) => void
    onError?: () => void
}

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Check if script is loaded
        if (typeof window === "undefined" || !window.google) return

        const initGoogle = () => {
            try {
                window.google!.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
                    callback: (response: any) => {
                        if (response.credential) {
                            onSuccess(response.credential)
                        } else {
                            onError?.()
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                })

                if (buttonRef.current) {
                    // Get width from parent
                    const width = buttonRef.current.parentElement?.offsetWidth || 350;

                    window.google!.accounts.id.renderButton(buttonRef.current, {
                        theme: "outline",
                        size: "large",
                        width: width, // Dynamic pixel width
                        text: "continue_with",
                        shape: "rectangular",
                        logo_alignment: "left",
                    })
                }
            } catch (e) {
                console.error("Google Auth Init Failed", e)
                onError?.()
            }
        };

        // If width is 0 (hidden), wait? No, just run.
        initGoogle();

        // Handle resize slightly? (Optional, but good for responsiveness)
        const handleResize = () => initGoogle();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [onSuccess, onError])

    return (
        <div className="w-full flex justify-center h-[40px]">
            <div ref={buttonRef} className="w-full" />
        </div>
    )
}

// Add global type for window.google
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void
                    renderButton: (parent: HTMLElement, options: any) => void
                    prompt: () => void
                }
            }
        }
    }
}
