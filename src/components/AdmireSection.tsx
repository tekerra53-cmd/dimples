import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const TRAITS = [
  { icon: '😊', title: 'Your Smile', desc: 'Even through photos and videos, it lights up everything around you.', color: '#00d4ff' },
  { icon: '✨', title: 'Your Energy', desc: 'The way you carry yourself is amazing.', color: '#4499ff' },
  { icon: '💎', title: 'Your Personality', desc: "You're completely authentic, and that's the rarest thing in this world.", color: '#00aaff' },
  { icon: '🌅', title: 'The Way You Make Ordinary Days Better', desc: 'Just knowing you exist makes my days better. No cap.', color: '#5577ff' },
  { icon: '🎙️', title: 'Your Voice', desc: 'It has become one of my favorite sounds that i will always want to listen to.', color: '#0088ff' },
  { icon: '😂', title: 'Your Laugh', desc: "It's the kind that makes everyone else smile too. its just so Infectious.", color: '#00bbff' },
];

function TraitCard({ trait, index }: { trait: typeof TRAITS[0]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(8, 18, 50, 0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? trait.color + '55' : 'rgba(0, 212, 255, 0.1)'}`,
        borderRadius: '18px',
        padding: '22px 20px',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-6px)' : 'translateY(0)'
          : 'translateY(40px)',
        transition: `all 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.08}s`,
        boxShadow: hovered
          ? `0 16px 40px rgba(0,80,200,0.2), 0 0 0 1px ${trait.color}22`
          : '0 2px 12px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${trait.color}88, transparent)`,
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 20% 20%, ${trait.color}08, transparent 60%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: '2rem', marginBottom: '12px',
        filter: hovered ? `drop-shadow(0 0 10px ${trait.color}88)` : 'none',
        transition: 'all 0.3s ease',
        display: 'inline-block',
      }}>
        {trait.icon}
      </div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '0.95rem', fontWeight: '700',
        color: hovered ? trait.color : '#d0e4ff',
        marginBottom: '8px', lineHeight: 1.4,
        transition: 'color 0.3s ease',
      }}>
        {trait.title}
      </h3>

      <p style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: '0.9rem', lineHeight: 1.65,
        color: 'rgba(200, 220, 255, 0.6)',
        fontStyle: 'italic', margin: 0,
      }}>
        {trait.desc}
      </p>

      {hovered && (
        <div style={{
          position: 'absolute', bottom: '10px', right: '12px',
          fontSize: '10px', opacity: 0.5,
        }}>
          💙
        </div>
      )}
    </div>
  );
}

export default function AdmireSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <div className="section-container" style={{ padding: '80px 20px' }}>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '700px' }}
      >
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1rem', color: 'rgba(0,212,255,0.6)',
          letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: '10px',
          opacity: visible ? 1 : 0, transition: 'all 0.6s ease',
        }}>
          All the reasons
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
          Things That Make You Special 💙
        </h2>
        <p style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: '1.1rem',
          color: 'rgba(200,220,255,0.55)',
          fontStyle: 'italic',
          opacity: visible ? 1 : 0,
          transition: 'all 0.8s ease 0.2s',
        }}>
          There are so many things I could list. Here are just a few.
        </p>
        <div style={{
          width: '80px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
          margin: '16px auto 0',
          opacity: visible ? 1 : 0,
          transition: 'all 0.8s ease 0.3s',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '18px',
        maxWidth: '900px',
        width: '100%',
      }}>
        {TRAITS.map((trait, i) => (
          <TraitCard key={i} trait={trait} index={i} />
        ))}
      </div>
    </div>
  );
}
