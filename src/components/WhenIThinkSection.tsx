import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const CARDS = [
  {
    icon: '🌙',
    title: 'You make nights feel shorter',
    desc: 'Every late-night talk with you turns minutes into memories.',
    color: '#4466ff',
  },
  {
    icon: '🎵',
    title: 'You make silence feel comfortable',
    desc: "Even when we're not talking, just knowing you're there is enough.",
    color: '#7b9fff',
  },
  {
    icon: '🌧️',
    title: 'You make bad days feel lighter',
    desc: 'One message from you and the weight just disappears.',
    color: '#5588ff',
  },
  {
    icon: '🔥',
    title: 'You make me want to be better',
    desc: "Not because you ask, but because someone like you deserves the best version of me.",
    color: '#00aaff',
  },
  {
    icon: '💫',
    title: 'You make "forever" feel possible',
    desc: "And I haven't even met you yet. That's how special you are.",
    color: '#0066ff',
  },
];

function Card({ card, index }: { card: typeof CARDS[0]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(8, 20, 55, 0.55)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? card.color + '66' : 'rgba(0, 212, 255, 0.12)'}`,
        borderRadius: '20px',
        padding: '28px 24px',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)'
          : 'translateY(50px)',
        transition: `all 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s`,
        boxShadow: hovered
          ? `0 20px 50px rgba(0, 102, 255, 0.25), 0 0 30px ${card.color}22`
          : '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Glow bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 30% 30%, ${card.color}08, transparent 60%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '14px',
        display: 'inline-block',
        filter: hovered ? `drop-shadow(0 0 12px ${card.color}88)` : 'none',
        transition: 'all 0.3s ease',
        animation: hovered ? 'heartbeat 1.5s ease-in-out infinite' : 'none',
      }}>
        {card.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.05rem', fontWeight: '700',
        color: hovered ? card.color : '#e0f0ff',
        marginBottom: '10px', lineHeight: 1.4,
        transition: 'color 0.3s ease',
      }}>
        {card.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: '1rem', lineHeight: 1.75,
        color: 'rgba(200, 220, 255, 0.65)',
        fontStyle: 'italic', margin: 0,
      }}>
        {card.desc}
      </p>

      {/* Floating hearts on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '12px', right: '14px',
          fontSize: '12px', opacity: 0.5,
          animation: 'float 2s ease-in-out infinite',
        }}>
          💙
        </div>
      )}
    </div>
  );
}

export default function WhenIThinkSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      className="section-container aurora-bg"
      style={{ padding: '80px 20px', alignItems: 'center' }}
    >
      {/* Section header */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '700px' }}
      >
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1rem', color: 'rgba(0,212,255,0.6)',
          letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: '10px',
          opacity: visible ? 1 : 0,
          transition: 'all 0.6s ease',
        }}>
          The effect you have
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          color: '#00d4ff',
          textShadow: '0 0 40px rgba(0,212,255,0.4)',
          marginBottom: '16px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.1s',
        }}>
          This Is What You Do To Me 💙
        </h2>
        <div style={{
          width: '80px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transition: 'all 0.8s ease 0.2s',
        }} />
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '22px',
        maxWidth: '960px',
        width: '100%',
      }}>
        {CARDS.map((card, i) => (
          <Card key={i} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}
