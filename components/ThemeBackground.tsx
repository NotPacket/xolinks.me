"use client";

import { useEffect, useRef } from "react";

interface ThemeBackgroundProps {
  themeId: string;
}

export default function ThemeBackground({ themeId }: ThemeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation based on theme
    let animationId: number;

    switch (themeId) {
      case "space":
        animationId = spaceAnimation(ctx, canvas);
        break;
      case "midnight":
        animationId = midnightAnimation(ctx, canvas);
        break;
      case "sunset":
        animationId = sunsetAnimation(ctx, canvas);
        break;
      case "forest":
        animationId = forestAnimation(ctx, canvas);
        break;
      case "ocean":
        animationId = oceanAnimation(ctx, canvas);
        break;
      case "noir":
        animationId = noirAnimation(ctx, canvas);
        break;
      case "lavender":
        animationId = lavenderAnimation(ctx, canvas);
        break;
      case "cherry":
        animationId = cherryAnimation(ctx, canvas);
        break;
      default:
        animationId = spaceAnimation(ctx, canvas);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [themeId]);

  const backgrounds: Record<string, string> = {
    space: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
    midnight: "linear-gradient(to bottom, #0f172a, #1e3a5f, #0f172a)",
    sunset: "linear-gradient(to bottom, #ff7e5f, #feb47b, #ff6b6b)",
    forest: "linear-gradient(to bottom, #134e5e, #71b280, #0d3b2e)",
    ocean: "linear-gradient(to bottom, #2e3192, #1bffff, #0f4c75)",
    noir: "#000000",
    lavender: "linear-gradient(to bottom, #4a0072, #7b2ff7, #2e1065)",
    cherry: "linear-gradient(to bottom, #870000, #190a05, #5c0000)",
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: backgrounds[themeId] || backgrounds.space,
          zIndex: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

// Space theme - Twinkling stars and shooting stars
function spaceAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Star {
    x: number;
    y: number;
    size: number;
    twinkle: number;
    speed: number;
  }

  interface ShootingStar {
    x: number;
    y: number;
    length: number;
    speed: number;
    angle: number;
    opacity: number;
  }

  const stars: Star[] = [];
  const shootingStars: ShootingStar[] = [];

  // Create stars
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    });
  }

  function addShootingStar() {
    if (Math.random() < 0.003 && shootingStars.length < 3) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 10 + 8,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach((star) => {
      star.twinkle += star.speed;
      const opacity = 0.5 + Math.sin(star.twinkle) * 0.5;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    });

    // Draw and update shooting stars
    addShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.length,
        ss.y - Math.sin(ss.angle) * ss.length
      );
      const gradient = ctx.createLinearGradient(
        ss.x,
        ss.y,
        ss.x - Math.cos(ss.angle) * ss.length,
        ss.y - Math.sin(ss.angle) * ss.length
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.015;

      if (ss.opacity <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
        shootingStars.splice(i, 1);
      }
    }

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Midnight theme - Floating particles with subtle glow
function midnightAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }

  const particles: Particle[] = [];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 150, 255, ${p.opacity})`;
      ctx.shadowColor = "rgba(100, 150, 255, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Sunset theme - Floating embers/sparks rising
function sunsetAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Ember {
    x: number;
    y: number;
    size: number;
    speed: number;
    wobble: number;
    wobbleSpeed: number;
    opacity: number;
  }

  const embers: Ember[] = [];

  for (let i = 0; i < 40; i++) {
    embers.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.05 + 0.02,
      opacity: Math.random() * 0.8 + 0.2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    embers.forEach((e) => {
      e.wobble += e.wobbleSpeed;
      e.y -= e.speed;
      e.x += Math.sin(e.wobble) * 0.5;

      if (e.y < -10) {
        e.y = canvas.height + 10;
        e.x = Math.random() * canvas.width;
      }

      const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2);
      gradient.addColorStop(0, `rgba(255, 200, 100, ${e.opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 50, ${e.opacity * 0.5})`);
      gradient.addColorStop(1, "rgba(255, 50, 0, 0)");

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Forest theme - Fireflies
function forestAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Firefly {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    pulse: number;
    pulseSpeed: number;
  }

  const fireflies: Firefly[] = [];

  for (let i = 0; i < 30; i++) {
    fireflies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.05 + 0.02,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireflies.forEach((f) => {
      f.pulse += f.pulseSpeed;
      f.x += f.vx;
      f.y += f.vy;

      // Random direction changes
      if (Math.random() < 0.02) {
        f.vx = (Math.random() - 0.5) * 1;
        f.vy = (Math.random() - 0.5) * 1;
      }

      // Bounds
      if (f.x < 0 || f.x > canvas.width) f.vx *= -1;
      if (f.y < 0 || f.y > canvas.height) f.vy *= -1;

      const glow = (Math.sin(f.pulse) + 1) / 2;
      const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3);
      gradient.addColorStop(0, `rgba(200, 255, 100, ${0.8 * glow})`);
      gradient.addColorStop(0.5, `rgba(150, 255, 50, ${0.4 * glow})`);
      gradient.addColorStop(1, "rgba(100, 200, 50, 0)");

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Ocean theme - Bubbles and caustics
function oceanAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Bubble {
    x: number;
    y: number;
    size: number;
    speed: number;
    wobble: number;
    wobbleSpeed: number;
  }

  const bubbles: Bubble[] = [];

  for (let i = 0; i < 25; i++) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 2 + 1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.01,
    });
  }

  let time = 0;

  function animate() {
    time += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Caustic light effect
    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(time * 0.7 + i * 2) * 0.5 + 0.5) * canvas.height;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
      gradient.addColorStop(0, "rgba(100, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(100, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Bubbles
    bubbles.forEach((b) => {
      b.wobble += b.wobbleSpeed;
      b.y -= b.speed;
      b.x += Math.sin(b.wobble) * 0.8;

      if (b.y < -20) {
        b.y = canvas.height + 20;
        b.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shine
      ctx.beginPath();
      ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fill();
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Noir theme - Subtle smoke/fog
function noirAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Smoke {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
  }

  const smokes: Smoke[] = [];

  for (let i = 0; i < 15; i++) {
    smokes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 200 + 100,
      opacity: Math.random() * 0.1 + 0.02,
      speed: Math.random() * 0.3 + 0.1,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    smokes.forEach((s) => {
      s.x += s.speed;
      if (s.x > canvas.width + s.size) {
        s.x = -s.size;
        s.y = Math.random() * canvas.height;
      }

      const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Lavender theme - Floating petals
function lavenderAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface Petal {
    x: number;
    y: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }

  const petals: Petal[] = [];

  for (let i = 0; i < 20; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 15 + 10,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      speedX: (Math.random() - 0.5) * 1,
      speedY: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }

  function drawPetal(x: number, y: number, size: number, rotation: number, opacity: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.3, size, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 150, 255, ${opacity})`;
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }

      drawPetal(p.x, p.y, p.size, p.rotation, p.opacity);
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}

// Cherry theme - Sakura petals falling
function cherryAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  interface CherryPetal {
    x: number;
    y: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    speedX: number;
    speedY: number;
    sway: number;
    swaySpeed: number;
  }

  const petals: CherryPetal[] = [];

  for (let i = 0; i < 30; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 12 + 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: Math.random() * 1.5 + 0.8,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
    });
  }

  function drawCherryPetal(x: number, y: number, size: number, rotation: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.5, -size * 0.5, size * 0.5, size * 0.5, 0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, size * 0.5, -size * 0.5, -size * 0.5, 0, -size);

    const gradient = ctx.createLinearGradient(0, -size, 0, size);
    gradient.addColorStop(0, "rgba(255, 200, 210, 0.8)");
    gradient.addColorStop(1, "rgba(255, 150, 180, 0.6)");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach((p) => {
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.5;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }

      drawCherryPetal(p.x, p.y, p.size, p.rotation);
    });

    return requestAnimationFrame(animate);
  }

  return animate();
}
