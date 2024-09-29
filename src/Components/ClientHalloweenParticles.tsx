"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import Image from "next/image";

import witchImg from "../public/images/halloween/witch.png";
import bat2Img from "../public/images/halloween/bat2.png";
import pumImg from "../public/images/halloween/pum.png";
import ghostImg from "../public/images/halloween/cartoonghost.png";

const ClientHalloweenParticles = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log("Initializing tsParticles");
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: true,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 20,
            },
            opacity: {
              value: 0.8,
            },
            shape: {
              type: "image",
              image: [
                { src: witchImg.src, width: 32, height: 32 },
                { src: bat2Img.src, width: 32, height: 32 },
                { src: pumImg.src, width: 24, height: 24 },
                { src: ghostImg.src, width: 32, height: 32 },
              ],
            },
            size: {
              value: { min: 20, max: 40 },
            },
          },
          detectRetina: true,
          zIndex: {
            value: 10,
          },
          fullScreen: {
            enable: false,
            zIndex: 0
          },
          style: {
            position: "absolute",
            width: "100%",
            height: "100%",
          },
        }}
      />
      {/* Estas imágenes son necesarias para que Next.js las optimice */}
      <div style={{ display: "none" }}>
        <Image src={witchImg} alt="witch" />
        <Image src={bat2Img} alt="bat2" />
        <Image src={pumImg} alt="pum" />
        <Image src={ghostImg} alt="ghost" />
      </div>
    </>
  );
};

export default ClientHalloweenParticles;
