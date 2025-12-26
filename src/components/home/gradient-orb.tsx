"use client";

import { useEffect, useRef } from "react";

/**
 * Animated Gradient Orb - A minimal, modern alternative to the 3D globe.
 * Features a premium glassmorphism sphere with flowing gradients.
 * 
 * Visual: Apple/Stripe style glowing orb with mesh-like patterns
 * Performance: Pure CSS, ~0ms TBT
 */
export default function GradientOrb() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Subtle mouse parallax
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / 80;
            const deltaY = (e.clientY - centerY) / 80;

            container.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="gradient-orb-container"
        >
            {/* Main sphere with gradient mesh */}
            <div className="orb-sphere">
                {/* Gradient layers */}
                <div className="gradient-layer gradient-1" />
                <div className="gradient-layer gradient-2" />
                <div className="gradient-layer gradient-3" />

                {/* Mesh grid overlay */}
                <div className="mesh-overlay" />

                {/* Center glow */}
                <div className="center-glow" />
            </div>

            {/* Outer glow rings */}
            <div className="glow-ring ring-1" />
            <div className="glow-ring ring-2" />
            <div className="glow-ring ring-3" />

            <style jsx>{`
        .gradient-orb-container {
          width: 100%;
          max-width: 600px;
          aspect-ratio: 1;
          margin: auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .orb-sphere {
          position: relative;
          width: 70%;
          height: 70%;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(6, 20, 27, 0.9) 0%,
            rgba(15, 35, 50, 0.8) 50%,
            rgba(6, 20, 27, 0.9) 100%
          );
          box-shadow:
            0 0 80px rgba(0, 167, 197, 0.3),
            0 0 160px rgba(0, 167, 197, 0.15),
            inset 0 0 80px rgba(0, 167, 197, 0.1);
          overflow: hidden;
          animation: sphere-float 6s ease-in-out infinite;
        }

        .gradient-layer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .gradient-1 {
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(0, 167, 197, 0.4) 60deg,
            transparent 120deg,
            rgba(110, 211, 225, 0.3) 180deg,
            transparent 240deg,
            rgba(0, 167, 197, 0.4) 300deg,
            transparent 360deg
          );
          animation: rotate-gradient 20s linear infinite;
        }

        .gradient-2 {
          background: conic-gradient(
            from 180deg at 50% 50%,
            transparent 0deg,
            rgba(168, 85, 247, 0.2) 90deg,
            transparent 180deg,
            rgba(110, 211, 225, 0.25) 270deg,
            transparent 360deg
          );
          animation: rotate-gradient 15s linear infinite reverse;
        }

        .gradient-3 {
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.15) 0%,
            transparent 50%
          );
        }

        .mesh-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-image: 
            linear-gradient(rgba(0, 167, 197, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 167, 197, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.5;
          animation: mesh-shift 30s linear infinite;
        }

        .center-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(110, 211, 225, 0.6) 0%,
            rgba(0, 167, 197, 0.3) 40%,
            transparent 70%
          );
          filter: blur(10px);
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .glow-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0, 167, 197, 0.2);
          animation: ring-pulse 4s ease-in-out infinite;
        }

        .ring-1 {
          width: 80%;
          height: 80%;
          animation-delay: 0s;
        }

        .ring-2 {
          width: 90%;
          height: 90%;
          animation-delay: 0.5s;
          border-color: rgba(110, 211, 225, 0.15);
        }

        .ring-3 {
          width: 100%;
          height: 100%;
          animation-delay: 1s;
          border-color: rgba(0, 167, 197, 0.1);
        }

        @keyframes rotate-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes sphere-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes mesh-shift {
          from { transform: translate(0, 0); }
          to { transform: translate(20px, 20px); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes ring-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
      `}</style>
        </div>
    );
}
