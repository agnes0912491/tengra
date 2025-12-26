"use client";

import { useEffect, useRef } from "react";

/**
 * Göktürk Pattern - Turkish mythology inspired background.
 * Features Old Turkic (Göktürk) runes and celestial patterns.
 * 
 * Visual: Mystical, cultural, unique to Tengra brand
 * Performance: Pure CSS/SVG, ~0ms TBT
 */

// Göktürk alphabet characters - selected meaningful ones
const GOKTURK_RUNES = [
    "𐱅", // T (Tengri)
    "𐰭", // NG
    "𐰺", // R
    "𐰃", // I
    "𐰀", // A
    "𐰉", // B
    "𐰸", // OK/UK
    "𐰆", // O/U
    "𐰴", // K
    "𐰠", // L
    "𐰢", // M
    "𐰣", // N
];

export default function GoktürkPattern() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Subtle parallax
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / 100;
            const deltaY = (e.clientY - centerY) / 100;

            container.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="gokturk-container">
            {/* Central sacred geometry */}
            <div className="sacred-circle">
                {/* Tengri symbol - the central T */}
                <div className="tengri-symbol">𐱅</div>

                {/* Inner rotating ring */}
                <div className="rune-ring ring-inner">
                    {GOKTURK_RUNES.slice(0, 6).map((rune, i) => (
                        <span
                            key={i}
                            className="rune"
                            style={{
                                transform: `rotate(${i * 60}deg) translateY(-80px) rotate(${-i * 60}deg)`,
                            }}
                        >
                            {rune}
                        </span>
                    ))}
                </div>

                {/* Outer rotating ring (reverse) */}
                <div className="rune-ring ring-outer">
                    {GOKTURK_RUNES.slice(6, 12).map((rune, i) => (
                        <span
                            key={i}
                            className="rune"
                            style={{
                                transform: `rotate(${i * 60}deg) translateY(-130px) rotate(${-i * 60}deg)`,
                            }}
                        >
                            {rune}
                        </span>
                    ))}
                </div>
            </div>

            {/* Floating particles (stars) */}
            <div className="star-field">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`,
                        }}
                    />
                ))}
            </div>

            {/* Glow layers */}
            <div className="celestial-glow" />

            <style jsx>{`
        .gokturk-container {
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

        .sacred-circle {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tengri-symbol {
          font-family: var(--font-noto-old-turkic), 'Noto Sans Old Turkic', sans-serif;
          font-size: 80px;
          color: rgba(110, 211, 225, 0.9);
          text-shadow: 
            0 0 30px rgba(0, 167, 197, 0.8),
            0 0 60px rgba(0, 167, 197, 0.5),
            0 0 100px rgba(0, 167, 197, 0.3);
          animation: pulse-tengri 4s ease-in-out infinite;
          z-index: 10;
        }

        .rune-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ring-inner {
          animation: rotate-ring 30s linear infinite;
        }

        .ring-outer {
          animation: rotate-ring 40s linear infinite reverse;
        }

        .rune {
          position: absolute;
          font-family: var(--font-noto-old-turkic), 'Noto Sans Old Turkic', sans-serif;
          font-size: 24px;
          color: rgba(110, 211, 225, 0.6);
          text-shadow: 0 0 15px rgba(0, 167, 197, 0.5);
        }

        .star-field {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          background: rgba(110, 211, 225, 0.8);
          border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite;
        }

        .celestial-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(0, 167, 197, 0.15) 0%,
            rgba(0, 167, 197, 0.08) 30%,
            transparent 70%
          );
          filter: blur(20px);
          animation: breathe 6s ease-in-out infinite;
        }

        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-tengri {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes breathe {
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
