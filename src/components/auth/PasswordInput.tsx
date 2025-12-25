"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function PasswordInput(props: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Lock className="w-4 h-4" />
            </div>
            <Input
                {...props}
                type={show ? "text" : "password"}
                className={`pl-11 pr-11 ${props.className || ""}`}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                tabIndex={-1}
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}
