"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBackground() {
  const init = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tengra-particles"
      init={init}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
          number: { value: 30, density: { enable: true, area: 800 } },
          color: { value: "#00A7C5" },
          opacity: { value: 0.3, random: true },
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
