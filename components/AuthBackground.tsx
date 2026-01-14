"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface GridLine {
  x: number;
  y: number;
  length: number;
  angle: number;
  progress: number;
  speed: number;
  opacity: number;
}

export default function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let gridLines: GridLine[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initElements();
    };

    const initElements = () => {
      // Initialize floating particles
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          hue: Math.random() * 60 + 250, // Purple to blue
        });
      }

      // Initialize grid lines (futuristic effect)
      gridLines = [];
    };

    const spawnGridLine = () => {
      if (gridLines.length < 5 && Math.random() < 0.02) {
        const isHorizontal = Math.random() > 0.5;
        gridLines.push({
          x: isHorizontal ? 0 : Math.random() * canvas.width,
          y: isHorizontal ? Math.random() * canvas.height : 0,
          length: isHorizontal ? canvas.width : canvas.height,
          angle: isHorizontal ? 0 : Math.PI / 2,
          progress: 0,
          speed: Math.random() * 4 + 2,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const animate = () => {
      // Create fade effect
      ctx.fillStyle = "rgba(3, 7, 18, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient orbs in background
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Purple orb
      const gradient1 = ctx.createRadialGradient(
        centerX - 200,
        centerY - 100,
        0,
        centerX - 200,
        centerY - 100,
        400
      );
      gradient1.addColorStop(0, "rgba(147, 51, 234, 0.15)");
      gradient1.addColorStop(0.5, "rgba(147, 51, 234, 0.05)");
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue orb
      const gradient2 = ctx.createRadialGradient(
        centerX + 200,
        centerY + 100,
        0,
        centerX + 200,
        centerY + 100,
        400
      );
      gradient2.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      gradient2.addColorStop(0.5, "rgba(59, 130, 246, 0.05)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particles.forEach((particle) => {
        // Particle glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Slowly shift hue
        particle.hue += 0.1;
        if (particle.hue > 310) particle.hue = 250;
      });

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15;
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Spawn and draw grid lines
      spawnGridLine();

      gridLines = gridLines.filter((line) => {
        const dx = Math.cos(line.angle);
        const dy = Math.sin(line.angle);
        const currentLength = line.progress;

        if (currentLength > 0) {
          const gradient = ctx.createLinearGradient(
            line.x,
            line.y,
            line.x + dx * currentLength,
            line.y + dy * currentLength
          );
          gradient.addColorStop(0, "transparent");
          gradient.addColorStop(0.5, `rgba(168, 85, 247, ${line.opacity})`);
          gradient.addColorStop(1, "transparent");

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + dx * currentLength, line.y + dy * currentLength);
          ctx.stroke();
        }

        line.progress += line.speed * 3;
        line.opacity -= 0.003;

        return line.progress < line.length && line.opacity > 0;
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
