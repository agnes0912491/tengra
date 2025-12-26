"use client";

import { useEffect, useRef } from "react";

/**
 * AuroraOrb - A lightweight, performant alternative to the 3D globe.
 * Uses pure CSS for animations with minimal JavaScript for mouse interaction.
 * 
 * Visual: Glowing orb with aurora borealis-like flowing gradients
 * Performance: ~0ms TBT, no WebGL, no heavy libraries
 */
export default function AuroraOrb() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Optional: subtle mouse parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / 50;
            const deltaY = (e.clientY - centerY) / 50;

            container.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="aurora-orb-container"
            style={{
                width: "100%",
                maxWidth: 600,
                aspectRatio: "1",
                margin: "auto",
                position: "relative",
                transition: "transform 0.3s ease-out",
            }}
        >
            {/* Main orb */}
            <div className="aurora-orb" />

            {/* Glow layers */}
            <div className="aurora-glow aurora-glow-1" />
            <div className="aurora-glow aurora-glow-2" />
            <div className="aurora-glow aurora-glow-3" />

            {/* Center highlight */}
            <div className="aurora-core" />

            <style jsx>{`
        .aurora-orb-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .aurora-orb {
          position: absolute;
          width: 60%;
          height: 60%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(110, 211, 225, 0.4) 0%,
            rgba(0, 167, 197, 0.3) 30%,
            rgba(6, 20, 27, 0.8) 70%,
            rgba(6, 20, 27, 1) 100%
          );
          box-shadow: 
            0 0 60px rgba(110, 211, 225, 0.3),
            0 0 120px rgba(0, 167, 197, 0.2),
            inset 0 0 60px rgba(110, 211, 225, 0.1);
          animation: orb-pulse 4s ease-in-out infinite;
        }

        .aurora-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.6;
        }

        .aurora-glow-1 {
          width: 80%;
          height: 80%;
          background: linear-gradient(
            135deg,
            rgba(110, 211, 225, 0.4) 0%,
            transparent 50%,
            rgba(168, 85, 247, 0.3) 100%
          );
          animation: aurora-rotate 8s linear infinite;
        }

        .aurora-glow-2 {
          width: 70%;
          height: 70%;
          background: linear-gradient(
            225deg,
            rgba(0, 167, 197, 0.5) 0%,
            transparent 50%,
            rgba(110, 211, 225, 0.4) 100%
          );
          animation: aurora-rotate 12s linear infinite reverse;
        }

        .aurora-glow-3 {
          width: 90%;
          height: 90%;
          background: radial-gradient(
            ellipse at center,
            rgba(110, 211, 225, 0.2) 0%,
            transparent 70%
          );
          animation: orb-breathe 6s ease-in-out infinite;
        }

        .aurora-core {
          position: absolute;
          width: 20%;
          height: 20%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(110, 211, 225, 0.6) 30%,
            transparent 70%
          );
          filter: blur(10px);
          animation: core-pulse 3s ease-in-out infinite;
        }

        @keyframes aurora-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes orb-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 0 60px rgba(110, 211, 225, 0.3),
              0 0 120px rgba(0, 167, 197, 0.2),
              inset 0 0 60px rgba(110, 211, 225, 0.1);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 
              0 0 80px rgba(110, 211, 225, 0.4),
              0 0 160px rgba(0, 167, 197, 0.3),
              inset 0 0 80px rgba(110, 211, 225, 0.15);
          }
        }

        @keyframes orb-breathe {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes core-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }
      `}</style>
        </div>
    );
}
