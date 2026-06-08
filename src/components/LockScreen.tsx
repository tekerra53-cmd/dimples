import { useState, useEffect, useRef } from 'react';
import AdminPanel from './AdminPanel';

interface Props {
  onUnlock: () => void;
  unlocked: boolean;
  welcomeShown: boolean;
}

export default function LockScreen({ onUnlock, unlocked, welcomeShown }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [burst, setBurst] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const SECRET_KEY = 'momma';
  const ADMIN_KEY = 'techerra'; // Hidden admin key

  useEffect(() => {
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

    interface LParticle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
      pulse: number;
    }

    const COLORS = ['#00d4ff', '#0066ff', '#7b9fff', '#ffffff', '#5588ff'];
    const particles: LParticle[] = [];

    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    let burstActive = false;
    let burstParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];

    const triggerBurst = () => {
      burstActive = true;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let i = 0; i < 80; i++) {
        const angle = (i / 80) * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        burstParticles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    if (burst) triggerBurst();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Night sky gradient
      const sky = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width * 0.8);
      sky.addColorStop(0, 'rgba(5, 20, 60, 0.3)');
      sky.addColorStop(1, 'rgba(5, 13, 31, 0.1)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Aurora waves
      for (let i = 0; i < 4; i++) {
        const waveY = canvas.height * (0.2 + i * 0.2) + Math.sin(t * 0.004 + i * 1.2) * 60;
        const gradient = ctx.createLinearGradient(0, waveY - 40, 0, waveY + 40);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(${i % 2 === 0 ? '0, 100, 255' : '0, 212, 255'}, 0.04)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, waveY - 40, canvas.width, 80);
      }

      // Floating particles
      const inputEl = inputRef.current;
      const inputX = inputEl ? inputEl.getBoundingClientRect().left + inputEl.offsetWidth / 2 : canvas.width / 2;
      const inputY = inputEl ? inputEl.getBoundingClientRect().top + inputEl.offsetHeight / 2 : canvas.height / 2;

      particles.forEach(p => {
        const dx = inputX - p.x;
        const dy = inputY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Subtle attraction to input when typing
        if (inputValue.length > 0 && dist < 200) {
          p.vx += (dx / dist) * 0.05;
          p.vy += (dy / dist) * 0.05;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (0.4 + 0.6 * Math.abs(Math.sin(p.pulse)));
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Burst particles
      if (burstActive) {
        burstParticles = burstParticles.filter(p => p.life > 0);
        burstParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.life -= 0.02;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      // Stars
      for (let i = 0; i < 80; i++) {
        const sx = (i * 137.5) % canvas.width;
        const sy = (i * 93.2) % canvas.height;
        const twinkle = 0.2 + 0.8 * Math.abs(Math.sin(t * 0.02 + i * 0.7));
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.globalAlpha = twinkle * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      t++;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [burst, inputValue]);

  const handleSubmit = () => {
    const trimmedInput = inputValue.toLowerCase().trim();

    // Check if admin key
    if (trimmedInput === ADMIN_KEY) {
      setShowAdmin(true);
      setInputValue('');
      return;
    }

    // Check if user key
    if (trimmedInput === SECRET_KEY) {
      setBurst(true);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onUnlock(), 800);
      }, 600);
    } else {
      setError(true);
      setShaking(true);
      setDimmed(true);
      setTimeout(() => {
        setShaking(false);
        setError(false);
        setDimmed(false);
      }, 1500);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // Show Admin Panel
  if (showAdmin) {
    return <AdminPanel onExit={() => setShowAdmin(false)} />;
  }

  // Welcome screen
  if (unlocked && welcomeShown) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#050d1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        {/* Stars */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 73.1) % 100}%`,
            top: `${(i * 47.3) % 100}%`,
            width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`,
            borderRadius: '50%', background: 'white',
            animation: `twinkle ${2 + i % 4}s ease-in-out infinite ${i * 0.1}s`,
          }} />
        ))}

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, animation: 'scaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px', animation: 'heartbeat 1.5s ease-in-out infinite' }}>💙</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            background: 'linear-gradient(135deg, #ffffff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.5))',
          }}>Welcome, Marvellous 💙</h1>
          <p style={{
            color: 'rgba(200, 220, 255, 0.8)',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            animation: 'fadeInUp 1s ease 0.5s both',
          }}>
            I've been waiting for you.
          </p>
          <div style={{
            marginTop: '30px',
            width: '60px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            margin: '30px auto 0',
            animation: 'fadeInUp 1s ease 1s both',
          }} />
        </div>
      </div>
    );
  }

  // Burst / fade out state
  if (unlocked) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: fadeOut ? '#050d1f' : 'radial-gradient(circle, rgba(0,102,255,0.2) 0%, #050d1f 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.8s ease',
      }}>
        <div style={{ fontSize: '5rem', animation: 'bounce-in 0.6s ease forwards' }}>💙</div>
      </div>
    );
  }

  return (
    <div
      className="lock-screen"
      style={{
        zIndex: 1000,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Error dim */}
      {dimmed && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(120, 0, 0, 0.15)',
          zIndex: 1, pointerEvents: 'none',
          animation: 'fadeInUp 0.2s ease',
        }} />
      )}

      {/* Lock Card */}
      <div
        className={`glass ${shaking ? 'animate-shake' : ''}`}
        style={{
          position: 'relative', zIndex: 2,
          width: 'min(500px, 92vw)',
          padding: 'clamp(28px, 5vw, 48px) clamp(24px, 5vw, 44px)',
          textAlign: 'center',
          animation: 'scaleIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          boxShadow: '0 0 60px rgba(0, 100, 255, 0.15), 0 0 120px rgba(0, 212, 255, 0.08)',
        }}
      >
        {/* Pulsing border */}
        <div style={{
          position: 'absolute', inset: '-1px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          animation: 'pulse-glow 2.5s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>
            🔒
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: '700',
            color: '#e0f0ff',
            marginBottom: '10px',
            lineHeight: 1.4,
          }}>
            Private Message For<br />Someone Special 💙
          </h2>

          <p style={{
            color: 'rgba(160, 196, 255, 0.6)',
            fontSize: '0.85rem',
            marginBottom: '8px',
            lineHeight: 1.6,
          }}>
            This experience is meant for one person only.
          </p>

          <div style={{
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
          }}>
            <p style={{
              color: 'rgba(0, 212, 255, 0.85)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              fontFamily: "'Crimson Text', serif",
            }}>
              "What's that favorite word I like calling you?" 💙
            </p>
          </div>

          <input
            ref={inputRef}
            type="password"
            className="lock-input"
            placeholder="Enter your secret key..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            autoFocus
          />

          {error && (
            <div style={{
              marginTop: '12px',
              padding: '10px 16px',
              background: 'rgba(200, 0, 0, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: '8px',
              animation: 'fadeInUp 0.3s ease',
            }}>
              <p style={{ color: '#ff8888', fontSize: '0.875rem' }}>
                Oops... this isn't for you 💙
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: '20px',
              width: '100%',
              background: 'linear-gradient(135deg, #0044cc, #0066ff, #00aaff)',
              border: 'none',
              borderRadius: '12px',
              padding: '15px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 102, 255, 0.3)',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 212, 255, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 102, 255, 0.3)';
            }}
          >
            Open My Heart 💙
          </button>

          <p style={{
            marginTop: '16px',
            color: 'rgba(100, 150, 255, 0.4)',
            fontSize: '0.75rem',
          }}>
            🔐 This is a private, secure experience
          </p>
        </div>
      </div>
    </div>
  );
}
