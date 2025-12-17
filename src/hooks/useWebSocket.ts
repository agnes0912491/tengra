"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://api.tengra.studio/ws";
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketMessage {
  event: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: (reason?: string) => void;
  onForceLogout?: (reason: string) => void;
  autoConnect?: boolean;
}

export function useWebSocket(token: string | null, options: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountingRef = useRef(false);

  const { onMessage, onConnect, onDisconnect, onForceLogout, autoConnect = true } = options;

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, "manual_disconnect");
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, [clearTimers]);

  const connect = useCallback(() => {
    if (!token || isUnmountingRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    clearTimers();
    setStatus("connecting");

    try {
      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[ws] connected");
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "heartbeat" }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(data);
          
          // Handle special events
          if (data.event === "force_disconnect") {
            console.warn("[ws] force disconnect received:", data.reason);
            onForceLogout?.(data.reason);
            disconnect();
            return;
          }

          if (data.event === "pong" || data.event === "heartbeat_ack") {
            return; // Silent handling
          }

          onMessage?.(data);
        } catch (err) {
          console.error("[ws] message parse error", err);
        }
      };

      ws.onclose = (event) => {
        console.log("[ws] disconnected", { code: event.code, reason: event.reason });
        clearTimers();
        setStatus("disconnected");
        onDisconnect?.(event.reason);

        // Don't reconnect on certain close codes
        const noReconnectCodes = [4001, 4004]; // unauthorized, force_disconnect
        if (noReconnectCodes.includes(event.code)) {
          return;
        }

        // Auto-reconnect with exponential backoff
        if (!isUnmountingRef.current && token) {
          const delay = Math.min(
            RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            RECONNECT_MAX_DELAY
          );
          reconnectAttemptsRef.current++;
          console.log(`[ws] reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("[ws] error", error);
        setStatus("error");
      };

    } catch (err) {
      console.error("[ws] connection error", err);
      setStatus("error");
    }
  }, [token, clearTimers, disconnect, onConnect, onDisconnect, onMessage, onForceLogout]);

  // Send message helper
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Auto-connect on mount if token available
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      isUnmountingRef.current = true;
      disconnect();
    };
  }, [token, autoConnect, connect, disconnect]);

  return {
    status,
    isConnected: status === "connected",
    lastMessage,
    connect,
    disconnect,
    send,
  };
}
