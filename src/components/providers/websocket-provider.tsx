"use client";

import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { useWebSocket, ConnectionStatus, WebSocketMessage } from "@/hooks/useWebSocket";
import { useAuth } from "./auth-provider";

interface WebSocketContextValue {
    status: ConnectionStatus;
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    send: (message: WebSocketMessage) => boolean;
    connect: () => void;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const { user, logout, token } = useAuth();

    const handleForceLogout = (reason: string) => {
        console.warn("[ws-provider] Force logout:", reason);
        logout();
    };

    const handleMessage = (message: WebSocketMessage) => {
        // Handle different event types here
        switch (message.event) {
            case "notification":
                // Could dispatch to a notification system
                console.log("[ws-provider] Notification received:", message);
                break;
            case "presence_update":
                // Could update a presence store
                console.log("[ws-provider] Presence update:", message);
                break;
            default:
                console.log("[ws-provider] Message:", message);
        }
    };

    const ws = useWebSocket(user ? token : null, {
        onForceLogout: handleForceLogout,
        onMessage: handleMessage,
        onConnect: () => {
            console.log("[ws-provider] Connected to WebSocket");
        },
        onDisconnect: (reason) => {
            console.log("[ws-provider] Disconnected:", reason);
        },
    });

    const value = useMemo(() => ({
        status: ws.status,
        isConnected: ws.isConnected,
        lastMessage: ws.lastMessage,
        send: ws.send,
        connect: ws.connect,
        disconnect: ws.disconnect,
    }), [ws.status, ws.isConnected, ws.lastMessage, ws.send, ws.connect, ws.disconnect]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocketContext must be used within a WebSocketProvider");
    }
    return context;
}
