import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

const LINK_DIST = 130;

export default function AnimatedBackground({ variant }: { variant: "particles" | "grid" | "none" }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (variant !== "particles") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let parts: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(100, Math.floor((W * H) / 16000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 0.6 + Math.random() * 1.3,
        a: 0.15 + Math.random() * 0.35,
      }));
    }

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function tick() {
      if (!document.hidden) {
        ctx!.clearRect(0, 0, W, H);

        for (const p of parts) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const md = Math.hypot(dx, dy);
          if (md < 110 && md > 0.01) {
            const f = ((110 - md) / 110) * 0.045;
            p.vx += (dx / md) * f;
            p.vy += (dy / md) * f;
          }
          p.vx = Math.max(-0.5, Math.min(0.5, p.vx * 0.995));
          p.vy = Math.max(-0.5, Math.min(0.5, p.vy * 0.995));
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20;
          if (p.y > H + 20) p.y = -20;
        }

        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j < parts.length; j++) {
            const dx = parts[i].x - parts[j].x;
            const dy = parts[i].y - parts[j].y;
            const d = Math.hypot(dx, dy);
            if (d < LINK_DIST) {
              ctx!.strokeStyle = `rgba(255,255,255,${(1 - d / LINK_DIST) * 0.07})`;
              ctx!.lineWidth = 1;
              ctx!.beginPath();
              ctx!.moveTo(parts[i].x, parts[i].y);
              ctx!.lineTo(parts[j].x, parts[j].y);
              ctx!.stroke();
            }
          }
        }

        for (const p of parts) {
          ctx!.fillStyle = `rgba(255,255,255,${p.a})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [variant]);

  if (variant === "none") return null;
  if (variant === "grid") {
    return <div className="bg-grid" aria-hidden="true" />;
  }
  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />;
}
