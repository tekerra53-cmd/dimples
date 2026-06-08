import React, { useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LINES = [
  { text: "We've laughed together.", style: 'normal' },
  { text: "We've shared moments together.", style: 'normal' },
  { text: "We've created memories together.", style: 'normal' },
  { text: "And somewhere along the way...", style: 'italic' },
  { text: "You became someone I genuinely look forward to talking to. 💙", style: 'highlight' },
];

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('resize', resize);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const CX = W / 2;
    const CY = H / 2;
    const SCALE = Math.min(W, H) * 0.25;
    const N = 800;

    interface HParticle {
      x: number; y: number; tx: number; ty: number;
      vx: number; vy: number; color: string; size: number;
      startX: number; startY: number;
    }

    const COLORS = ['#00d4ff', '#0066ff', '#7b9fff', '#ffffff', '#a0c4ff', '#4499ff'];
    const particles: HParticle[] = [];

    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const tx = CX + (hx / 17) * SCALE;
      const ty = CY + (hy / 17) * SCALE * 0.95;
      const startX = (Math.random() - 0.5) * W * 2 + CX;
      const startY = (Math.random() - 0.5) * H * 2 + CY;

      particles.push({
        x: startX, y: startY,
        tx, ty, vx: 0, vy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 2 + 0.5,
        startX, startY,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);

        if (distMouse < 90 && frame > 60) {
          p.vx -= (dx / distMouse) * 1.5;
          p.vy -= (dy / distMouse) * 1.5;
        }

        // Spring to target
        p.vx += (p.tx - p.x) * 0.03;
        p.vy += (p.ty - p.y) * 0.03;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        // Glow for some particles
        const glow = 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.03 + p.tx * 0.01));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = glow * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Heart glow
      const glowIntensity = 0.04 + 0.02 * Math.sin(frame * 0.04);
      const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, SCALE * 1.5);
      grad.addColorStop(0, `rgba(0, 100, 255, ${glowIntensity})`);
      grad.addColorStop(0.5, `rgba(0, 212, 255, ${glowIntensity * 0.5})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      frame++;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="section-container" style={{ padding: '60px 20px 80px', flexDirection: 'column', gap: '40px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1.1rem', color: 'rgba(0,212,255,0.6)',
          letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Because of you
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          color: '#e0f0ff',
          textShadow: '0 0 30px rgba(0,212,255,0.3)',
        }}>
          A Heart Full of You 💙
        </h2>
      </div>

      {/* Interactive Heart */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%', maxWidth: '480px',
          height: '380px',
          display: 'block',
          cursor: 'crosshair',
          filter: 'drop-shadow(0 0 30px rgba(0,102,255,0.2))',
        }}
      />

      {/* Text lines */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{ textAlign: 'center', maxWidth: '700px' }}
      >
        {LINES.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: line.style === 'highlight' ? "'Playfair Display', serif" : "'Crimson Text', serif",
              fontSize: line.style === 'highlight'
                ? 'clamp(1.1rem, 2.5vw, 1.5rem)'
                : 'clamp(1rem, 2vw, 1.3rem)',
              color: line.style === 'highlight' ? '#00d4ff' : 'rgba(200, 220, 255, 0.8)',
              marginBottom: '12px',
              lineHeight: 1.8,
              fontStyle: line.style === 'italic' ? 'italic' : 'normal',
              fontWeight: line.style === 'highlight' ? '700' : '400',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.15 + 0.1}s`,
              textShadow: line.style === 'highlight' ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
            }}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
