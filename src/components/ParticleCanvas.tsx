import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; color: string; life: number;
}

export default function ParticleCanvas({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    const particles: Particle[] = [];
    const COLORS = ['#00d4ff', '#0066ff', '#7b9fff', '#ffffff', '#a0c4ff'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: Math.random() * 100,
      });
    }

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aurora background waves
      for (let i = 0; i < 4; i++) {
        const gy = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gy.addColorStop(0, 'transparent');
        gy.addColorStop(0.3 + Math.sin(t * 0.003 + i * 0.5) * 0.15, `rgba(0, 50, 150, 0.025)`);
        gy.addColorStop(0.7, `rgba(0, 212, 255, 0.015)`);
        gy.addColorStop(1, 'transparent');
        ctx.fillStyle = gy;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      particles.forEach(p => {
        // Mouse repulsion
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100 * 0.8;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.02;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (0.5 + 0.5 * Math.sin(p.life));
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Stars (twinkle)
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.508 + 50) % canvas.width);
        const sy = ((i * 91.3 + 20) % canvas.height);
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.015 + i * 0.5));
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.globalAlpha = twinkle * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      t++;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0
      }}
    />
  );
}
