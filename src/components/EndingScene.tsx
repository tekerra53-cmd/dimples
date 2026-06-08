import { useState, useEffect } from 'react';

const LINES = [
  "No matter what your answer is...",
  "I'll always be grateful for every laugh...",
  "Every conversation...",
  "Every smile...",
  "Thank you for being you, Marvellous 💙",
];

export default function EndingScene() {
  const [shownLines, setShownLines] = useState<number[]>([]);
  const [showHeart, setShowHeart] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    LINES.forEach((_, i) => {
      setTimeout(() => {
        setShownLines(prev => [...prev, i]);
      }, i * 1500 + 500);
    });
    setTimeout(() => setShowHeart(true), LINES.length * 1500 + 1000);
    setTimeout(() => setShowSignature(true), LINES.length * 1500 + 2500);
  }, []);

  return (
    <div
      className="section-container"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, rgba(0,20,60,0.5) 0%, rgba(5,13,31,1) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shooting stars */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="shooting-star"
          style={{
            '--duration': `${4 + i * 0.8}s`,
            '--delay': `${i * 1.2}s`,
            top: `${5 + i * 15}%`,
            left: 0,
            transform: `rotate(${25 + i * 5}deg)`,
          } as React.CSSProperties}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${(i * 73.1) % 100}%`,
          top: `${(i * 47.3) % 100}%`,
          width: `${(i % 3) + 1}px`,
          height: `${(i % 3) + 1}px`,
          '--duration': `${2 + (i % 4)}s`,
          '--delay': `${(i % 5) * 0.5}s`,
        } as React.CSSProperties} />
      ))}

      {/* Content */}
      <div style={{ textAlign: 'center', maxWidth: '700px', position: 'relative', zIndex: 2 }}>
        {LINES.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: i === 4 ? "'Playfair Display', serif" : "'Crimson Text', serif",
              fontSize: i === 4
                ? 'clamp(1.5rem, 3vw, 2.2rem)'
                : 'clamp(1rem, 2vw, 1.4rem)',
              color: i === 4 ? '#00d4ff' : 'rgba(200, 220, 255, 0.75)',
              marginBottom: '20px',
              lineHeight: 1.8,
              opacity: shownLines.includes(i) ? 1 : 0,
              transform: shownLines.includes(i) ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
              textShadow: i === 4 ? '0 0 30px rgba(0,212,255,0.5)' : 'none',
              fontStyle: i < 4 ? 'italic' : 'normal',
              fontWeight: i === 4 ? '700' : '400',
            }}
          >
            {line}
          </p>
        ))}

        {/* Heart */}
        {showHeart && (
          <div style={{
            fontSize: '4rem',
            marginTop: '30px',
            marginBottom: '20px',
            animation: 'heartbeat 1.5s ease-in-out infinite, fadeInUp 1s ease both',
            filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.7))',
          }}>
            💙
          </div>
        )}

        {/* Signature */}
        {showSignature && (
          <div style={{
            animation: 'fadeInUp 1s ease both',
            borderTop: '1px solid rgba(0,212,255,0.2)',
            paddingTop: '24px',
            marginTop: '20px',
          }}>
            <p style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              color: 'rgba(0, 212, 255, 0.6)',
            }}>
              Made with love for Marvellous 💙
            </p>
            <p style={{
              color: 'rgba(200,220,255,0.3)',
              fontSize: '0.75rem',
              marginTop: '8px',
            }}>
              This moment was crafted just for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
