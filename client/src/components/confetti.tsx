"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ["#D4A017", "#f4d03f", "#2F6F62", "#4a9d8f", "#ffffff"];

/** Fire-once confetti burst from the top of the container. No deps - plain canvas. */
export function Confetti({ trigger }: { trigger: unknown }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? window.innerWidth;
    const height = parent?.clientHeight ?? 300;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 4,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    let frame: number;
    let ticks = 0;
    const gravity = 0.35;

    const render = () => {
      ticks++;
      ctx.clearRect(0, 0, width, height);
      let stillAlive = false;

      for (const p of particles) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < height + 20) stillAlive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (stillAlive && ticks < 180) {
        frame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-50"
    />
  );
}
