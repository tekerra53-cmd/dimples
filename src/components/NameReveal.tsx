import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function NameReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { ref, visible } = useScrollReveal(0.25);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!visible || startedRef.current) return;
    startedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = Math.min(window.innerWidth - 40, 900);
    const H = 240;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const LINE1 = 'OKECHUKWU MARVELLOUS';
    const LINE2 = 'CHINAZAMUEKPERE';

    const COLORS = ['#00d4ff', '#0066ff', '#7b9fff', '#ffffff', '#a0c4ff', '#4488ff'];

    const samplePositions = (text1: string, text2: string): Array<{ x: number; y: number }> => {
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const offCtx = off.getContext('2d')!;
      offCtx.clearRect(0, 0, W, H);

      const fs1 = Math.min(W / text1.length * 1.6, 38);
      const fs2 = Math.min(W / text2.length * 1.6, 34);

      offCtx.fillStyle = 'white';
      offCtx.textAlign = 'center';

      offCtx.font = `700 ${fs1}px "Playfair Display", Georgia, serif`;
      offCtx.fillText(text1, W / 2, H / 2 - 20);

      offCtx.font = `700 ${fs2}px "Playfair Display", Georgia, serif`;
      offCtx.fillText(text2, W / 2, H / 2 + fs2 + 4);

      const imgData = offCtx.getImageData(0, 0, W, H);
      const positions: Array<{ x: number; y: number }> = [];
      const step = 4;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (y * W + x) * 4;
          if (imgData.data[idx + 3] > 80) {
            positions.push({ x: x + (Math.random() - 0.5) * 2, y: y + (Math.random() - 0.5) * 2 });
          }
        }
      }
      return positions;
    };

    const makeHeartPos = (n: number) => {
      const out: Array<{ x: number; y: number }> = [];
      const scale = Math.min(W, H) * 0.22;
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        out.push({ x: cx + (hx / 17) * scale, y: cy + (hy / 17) * scale * 0.9 + 10 });
      }
      return out;
    };

    const textPos = samplePositions(LINE1, LINE2);
    const N = Math.min(textPos.length, 600);

    interface NP {
      x: number; y: number; tx: number; ty: number;
      vx: number; vy: number; color: string; size: number;
    }

    const particles: NP[] = [];
    const heartTargets = makeHeartPos(N);

    for (let i = 0; i < N; i++) {
      const tp = textPos[Math.floor((i / N) * textPos.length)];
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        tx: tp.x, ty: tp.y,
        vx: 0, vy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 2 + 0.8,
      });
    }

    let t = 0;
    type Phase = 'forming' | 'heart' | 'scatter';
    let phase: Phase = 'forming';
    const PHASE_DURATIONS = { forming: 180, heart: 200, scatter: 120 };

    const setTargets = (targets: Array<{ x: number; y: number }>) => {
      particles.forEach((p, i) => {
        const tp = targets[i % targets.length];
        p.tx = tp.x; p.ty = tp.y;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Phase transitions
      if (phase === 'forming' && t >= PHASE_DURATIONS.forming) {
        phase = 'heart';
        t = 0;
        setTargets(heartTargets);
      } else if (phase === 'heart' && t >= PHASE_DURATIONS.heart) {
        phase = 'scatter';
        t = 0;
        const scatterPos = textPos.map(p => ({
          x: p.x + (Math.random() - 0.5) * 80,
          y: p.y + (Math.random() - 0.5) * 80,
        }));
        setTargets(scatterPos);
      } else if (phase === 'scatter' && t >= PHASE_DURATIONS.scatter) {
        phase = 'forming';
        t = 0;
        setTargets(textPos);
      }

      particles.forEach(p => {
        p.vx += (p.tx - p.x) * 0.045;
        p.vy += (p.ty - p.y) * 0.045;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.04 + p.tx * 0.015));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulse * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Glow
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      g.addColorStop(0, `rgba(0,100,255,${0.03 + 0.02 * Math.sin(t * 0.03)})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      t++;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [visible]);

  return (
    <div
      className="section-container"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        padding: '80px 20px',
        background: 'linear-gradient(180deg, rgba(0,10,40,0.4), rgba(5,13,31,0.7), rgba(0,10,40,0.4))',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1rem', color: 'rgba(0,212,255,0.55)',
          letterSpacing: '2px', textTransform: 'uppercase',
          opacity: visible ? 1 : 0, transition: 'all 0.7s ease',
        }}>
          Written in light
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          color: 'rgba(0, 212, 255, 0.8)',
          textShadow: '0 0 30px rgba(0,212,255,0.3)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.1s',
        }}>
          Her Name, In A Thousand Stars 💙
        </h2>
      </div>

      {/* Particle canvas */}
      <div style={{
        position: 'relative', zIndex: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 1s ease 0.3s',
        width: '100%', maxWidth: '900px',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block', width: '100%',
            filter: 'drop-shadow(0 0 25px rgba(0,212,255,0.25))',
          }}
        />
      </div>

      {/* Name text */}
      <div style={{
        marginTop: '30px', textAlign: 'center',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s ease 0.6s',
      }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
          background: 'linear-gradient(135deg, #ffffff, #00d4ff, #7b9fff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 15px rgba(0,212,255,0.3))',
          animation: 'heartbeat 2s ease-in-out infinite',
        }}>
          Okechukwu Marvellous Chinazamuekpere 💙
        </p>
        <p style={{
          color: 'rgba(200,220,255,0.4)',
          fontSize: '0.8rem',
          marginTop: '8px',
          fontStyle: 'italic',
        }}>
          Watch it transform from text → heart → stars ✨
        </p>
      </div>
    </div>
  );
}
