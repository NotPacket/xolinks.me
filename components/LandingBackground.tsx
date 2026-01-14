"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

interface FloatingOrb {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  hue: number;
  opacity: number;
}

export default function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let orbs: FloatingOrb[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initElements();
    };

    const initElements = () => {
      // Initialize stars
      stars = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.02 + 0.01,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }

      // Initialize floating orbs (purple/blue gradient orbs)
      orbs = [];
      for (let i = 0; i < 6; i++) {
        orbs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 200 + 100,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          hue: Math.random() * 60 + 250, // Purple to blue range
          opacity: Math.random() * 0.15 + 0.05,
        });
      }
    };

    const spawnMeteor = () => {
      if (meteors.length < 3 && Math.random() < 0.005) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: -50,
          length: Math.random() * 100 + 50,
          speed: Math.random() * 8 + 4,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw floating orbs (background glow)
      orbs.forEach((orb) => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 50%, ${orb.opacity})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue}, 80%, 40%, ${orb.opacity * 0.5})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();

        // Move orbs
        orb.x += orb.speedX;
        orb.y += orb.speedY;

        // Bounce off edges
        if (orb.x < -orb.size) orb.x = canvas.width + orb.size;
        if (orb.x > canvas.width + orb.size) orb.x = -orb.size;
        if (orb.y < -orb.size) orb.y = canvas.height + orb.size;
        if (orb.y > canvas.height + orb.size) orb.y = -orb.size;

        // Slowly shift hue
        orb.hue += 0.05;
        if (orb.hue > 310) orb.hue = 250;
      });

      // Draw and update stars
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Star glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 255, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Spawn and update meteors
      spawnMeteor();

      meteors = meteors.filter((meteor) => {
        const dx = Math.cos(meteor.angle) * meteor.speed;
        const dy = Math.sin(meteor.angle) * meteor.speed;

        // Draw meteor trail
        const gradient = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - Math.cos(meteor.angle) * meteor.length,
          meteor.y - Math.sin(meteor.angle) * meteor.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
        gradient.addColorStop(0.3, `rgba(168, 85, 247, ${meteor.opacity * 0.6})`);
        gradient.addColorStop(1, "transparent");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(
          meteor.x - Math.cos(meteor.angle) * meteor.length,
          meteor.y - Math.sin(meteor.angle) * meteor.length
        );
        ctx.stroke();

        // Meteor head glow
        const headGradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 8);
        headGradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
        headGradient.addColorStop(0.5, `rgba(168, 85, 247, ${meteor.opacity * 0.5})`);
        headGradient.addColorStop(1, "transparent");

        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 8, 0, Math.PI * 2);
        ctx.fill();

        meteor.x += dx;
        meteor.y += dy;
        meteor.opacity -= 0.005;

        return meteor.y < canvas.height + 100 && meteor.opacity > 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
