"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSpring } from "react-spring";

interface Visitor {
    lat: number;
    lon: number;
    ts: number;
}

const ANALYTICS_API_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "https://api.tengra.studio/analytics";

export default function LiveGlobe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

    const [{ r }, api] = useSpring(() => ({
        r: 0,
        config: {
            mass: 1,
            tension: 280,
            friction: 40,
            precision: 0.001,
        },
    }));

    const [hasError, setHasError] = useState(false);

    // Poll for recent visitors
    const fetchVisitors = useCallback(async () => {
        if (hasError) return; // Stop polling if endpoint doesn't exist
        try {
            const response = await fetch(`${ANALYTICS_API_URL}/recent-visitors`);
            if (response.ok) {
                const data = await response.json();
                setVisitors(data.visitors || []);
            } else if (response.status === 404) {
                setHasError(true); // Stop polling if endpoint doesn't exist
            }
        } catch (error) {
            // Silent fail for analytics
        }
    }, [hasError]);

    useEffect(() => {
        fetchVisitors(); // Initial fetch
        const interval = setInterval(fetchVisitors, 30000); // Poll every 30 seconds (reduced from 5s)
        return () => clearInterval(interval);
    }, [fetchVisitors]);

    useEffect(() => {
        let phi = 0;
        let width = 0;
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener("resize", onResize);
        onResize();

        // Convert visitors to cobe markers
        const now = Math.floor(Date.now() / 1000);
        const dynamicMarkers = visitors.map((v) => {
            const age = now - v.ts;
            // Newer visitors get larger markers (fade over 60 seconds)
            const size = Math.max(0.03, 0.12 - (age / 60) * 0.09);
            return {
                location: [v.lat, v.lon] as [number, number],
                size,
            };
        });

        // Static markers (always visible)
        const staticMarkers = [
            { location: [41.0082, 28.9784] as [number, number], size: 0.08 }, // Istanbul (home base)
        ];

        const allMarkers = [...staticMarkers, ...dynamicMarkers];

        const globe = createGlobe(canvasRef.current!, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.28, 0.83, 1], // Turkish Blue
            glowColor: [0.28, 0.83, 1],
            markers: allMarkers,
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    phi += 0.005;
                }
                state.phi = phi + r.get();
                state.width = width * 2;
                state.height = width * 2;
            },
        });

        globeRef.current = globe;
        setTimeout(() => (canvasRef.current!.style.opacity = "1"));

        return () => {
            globe.destroy();
            window.removeEventListener("resize", onResize);
        };
    }, [visitors, r]);

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 600,
                aspectRatio: 1,
                margin: "auto",
                position: "relative",
            }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                    canvasRef.current!.style.cursor = "grabbing";
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    canvasRef.current!.style.cursor = "grab";
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    canvasRef.current!.style.cursor = "grab";
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        api.start({
                            r: delta / 200,
                        });
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        api.start({
                            r: delta / 100,
                        });
                    }
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    cursor: "grab",
                    contain: "layout paint size",
                    opacity: 0,
                    transition: "opacity 1s ease",
                }}
            />
        </div>
    );
}

