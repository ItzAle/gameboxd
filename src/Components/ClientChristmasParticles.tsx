"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import Image from "next/image";

import santaImg from "../public/images/christmas/santa2.png";
import snowflakeImg from "../public/images/christmas/snowflake.png";
import giftImg from "../public/images/christmas/gift.png";
import christmasTreeImg from "../public/images/christmas/christmastree.png";

const ClientChristmasParticles = () => {
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
              direction: "bottom",
              enable: true,
              outModes: {
                default: "out",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: "image",
              image: [
                { src: santaImg.src, width: 32, height: 32 },
                { src: snowflakeImg.src, width: 32, height: 32 },
                { src: giftImg.src, width: 32, height: 32 },
                { src: christmasTreeImg.src, width: 32, height: 32 },
              ],
            },
            size: {
              value: { min: 10, max: 30 },
            },
          },
          detectRetina: true,
          zIndex: {
            value: 10,
          },
          fullScreen: {
            enable: false,
            zIndex: 0,
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
        <Image src={santaImg} alt="santa" />
        <Image src={snowflakeImg} alt="snowflake" />
        <Image src={giftImg} alt="gift" />
        <Image src={christmasTreeImg} alt="christmas-tree" />
      </div>
    </>
  );
};

export default ClientChristmasParticles;
