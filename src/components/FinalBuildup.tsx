import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LINES = [
  {
    text: "Maybe we've already been acting like we're more than friends...",
    style: 'italic',
    size: 'normal',
  },
  {
    text: "Maybe everyone else already noticed...",
    style: 'italic',
    size: 'normal',
  },
  {
    text: "But I wanted to ask you properly...",
    style: 'normal',
    size: 'medium',
  },
  {
    text: "Because you deserve to be asked right. 💙",
    style: 'bold',
    size: 'large',
  },
];

export default function FinalBuildup() {
  const { ref, visible } = useScrollReveal(0.25);
  const [shownLines, setShownLines] = useState<number[]>([]);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (!visible) return;
    LINES.forEach((_, i) => {
      setTimeout(() => {
        setShownLines(prev => [...prev, i]);
      }, i * 1300);
    });
    setTimeout(() => setShowCTA(true), LINES.length * 1300 + 600);
  }, [visible]);

  const getStyle = (line: typeof LINES[0], shown: boolean): React.CSSProperties => {
    const sizeMap = {
      normal: 'clamp(1rem, 2.5vw, 1.4rem)',
      medium: 'clamp(1.2rem, 3vw, 1.8rem)',
      large: 'clamp(1.5rem, 4vw, 2.4rem)',
    };
    return {
      fontFamily: line.size === 'large'
        ? "'Playfair Display', serif"
        : "'Crimson Text', serif",
      fontSize: sizeMap[line.size as keyof typeof sizeMap] || sizeMap.normal,
      color: line.size === 'large' ? '#00d4ff' : 'rgba(200, 220, 255, 0.85)',
      fontStyle: line.style === 'italic' ? 'italic' : 'normal',
      fontWeight: line.style === 'bold' ? '700' : '400',
      lineHeight: 1.8,
      marginBottom: '24px',
      textShadow: line.size === 'large' ? '0 0 30px rgba(0,212,255,0.5)' : 'none',
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
    };
  };

  return (
    <div
      className="section-container"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        minHeight: '80vh',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(0,40,100,0.3) 0%, rgba(5,13,31,0.9) 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gathering glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,80,200,0.06) 0%, transparent 70%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
        animation: visible ? 'pulse-glow 3s ease-in-out infinite' : 'none',
      }} />

      {/* Star particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 50.3) % 100}%`,
          top: `${(i * 33.7) % 100}%`,
          width: `${(i % 3) + 1}px`,
          height: `${(i % 3) + 1}px`,
          borderRadius: '50%',
          background: 'white',
          animation: `twinkle ${2 + i % 3}s ease-in-out infinite ${i * 0.3}s`,
          pointerEvents: 'none',
          opacity: 0.5,
        }} />
      ))}

      {/* Content */}
      <div style={{
        textAlign: 'center', maxWidth: '720px',
        position: 'relative', zIndex: 2,
        padding: '0 20px',
      }}>
        {/* Decorative line */}
        {visible && (
          <div style={{
            width: '60px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            margin: '0 auto 40px',
            animation: 'fadeInUp 0.8s ease both',
          }} />
        )}

        {LINES.map((line, i) => (
          <p key={i} style={getStyle(line, shownLines.includes(i))}>
            {line.text}
          </p>
        ))}

        {showCTA && (
          <div style={{
            marginTop: '40px',
            animation: 'fadeInUp 1s ease both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '16px', marginBottom: '20px',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: `${8 - i * 2}px`,
                  height: `${8 - i * 2}px`,
                  borderRadius: '50%',
                  background: '#00d4ff',
                  opacity: 0.8,
                  animation: `pulse-glow ${1 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
            <div style={{
              fontSize: '3rem',
              animation: 'heartbeat 1.2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 15px rgba(0,212,255,0.6))',
              marginBottom: '12px',
            }}>
              💙
            </div>
            <p style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: '1.2rem',
              color: 'rgba(0,212,255,0.6)',
            }}>
              Keep scrolling...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
