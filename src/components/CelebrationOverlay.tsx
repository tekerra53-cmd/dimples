import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function CelebrationOverlay() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const BLUE_PALETTE = ['#00d4ff', '#0066ff', '#7b9fff', '#ffffff', '#a0c4ff', '#4499ff'];
    const GOLD_PALETTE = ['#ffd700', '#ffcc00', '#ffe066', '#ffffff'];

    const fire = (opts: confetti.Options) => {
      confetti({
        origin: { y: 0.75 },
        particleCount: 80,
        ...opts,
      });
    };

    const burst = () => {
      // Blue & white burst
      fire({ spread: 30, startVelocity: 60, colors: BLUE_PALETTE });
      fire({ spread: 70, startVelocity: 45, colors: [...BLUE_PALETTE, ...GOLD_PALETTE] });
      fire({ spread: 120, startVelocity: 30, decay: 0.9, colors: BLUE_PALETTE });

      // Left cannon
      confetti({
        angle: 60, spread: 55, startVelocity: 65,
        origin: { x: 0, y: 0.75 },
        colors: BLUE_PALETTE,
        particleCount: 60,
      });

      // Right cannon
      confetti({
        angle: 120, spread: 55, startVelocity: 65,
        origin: { x: 1, y: 0.75 },
        colors: BLUE_PALETTE,
        particleCount: 60,
      });
    };

    burst();
    const t1 = setTimeout(burst, 1200);
    const t2 = setTimeout(burst, 2400);
    const t3 = setTimeout(() => {
      // Grand finale
      confetti({
        particleCount: 200, spread: 200,
        origin: { y: 0.4, x: 0.5 },
        colors: [...BLUE_PALETTE, ...GOLD_PALETTE],
        startVelocity: 40,
        gravity: 0.8,
      });
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Screen flash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 60%)',
        animation: 'pulse-glow 1s ease-in-out 3',
      }} />

      {/* Floating hearts */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${8 + (i * 6.2) % 86}%`,
          top: `${15 + (i * 9.3) % 65}%`,
          fontSize: `${1.2 + (i % 3) * 0.6}rem`,
          animation: `float ${1.8 + i * 0.25}s ease-in-out infinite ${i * 0.15}s`,
          filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.7))',
          pointerEvents: 'none',
        }}>
          {['💙', '✨', '💫', '⭐', '🌟'][i % 5]}
        </div>
      ))}

      {/* Message */}
      <div style={{
        animation: 'bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        padding: '28px 40px',
        background: 'rgba(5, 13, 31, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(0, 212, 255, 0.35)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,102,255,0.2)',
        textAlign: 'center',
        maxWidth: '90vw',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '14px', animation: 'heartbeat 1s ease-in-out infinite' }}>
          🥹💙
        </div>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.2rem, 4vw, 2rem)',
          color: '#00d4ff',
          textShadow: '0 0 30px rgba(0,212,255,0.6)',
          margin: 0, lineHeight: 1.4,
        }}>
          You just made me the happiest<br />guy alive 💙
        </p>
      </div>
    </div>
  );
}
