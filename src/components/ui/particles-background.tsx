"use client";

import { Particles } from "@tsparticles/react";

export default function ParticlesBackground() {
  return (
    <Particles
      id="tengra-particles"
      options={{

        fullScreen: { enable: true, zIndex: 0 },
        background: { color: "transparent" },
        fpsLimit: 30,
        particles: {
          number: { value: 20, density: { enable: true, width: 800, height: 800 } },
          color: { value: "#00A7C5" },
          opacity: { value: 0.3 },
          size: { value: { min: 0.5, max: 2.5 } },
          move: {
            enable: true,
            speed: 0.3,
            outModes: { default: "out" },
          },
        },
        interactivity: { events: { onHover: { enable: false } } },
        detectRetina: true,
      }}
    />
  );
}
