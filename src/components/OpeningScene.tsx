import { useState, useEffect, useRef } from 'react';

const LINES = [
  { text: "Hey Marvellous 💙", isTitle: true },
  { text: "There is something I've been holding in my heart...", isTitle: false },
  { text: "Something that keeps me smiling at my phone...", isTitle: false },
  { text: "Something that makes ordinary days feel extraordinary...", isTitle: false },
  { text: "Because honestly...", isTitle: false },
  { text: "You are the kind of girl people write songs about.", isTitle: false },
  { text: "The kind of girl who walks into someone's life and suddenly everything makes sense.", isTitle: false },
  { text: "And I don't know how I got this lucky...", isTitle: false },
  { text: "But having you in my life feels like a dream I never want to wake up from.", isTitle: false },
  { text: "So before I say anything else...", isTitle: false },
  { text: "I just need you to know, that your already my dream girl. 💙", isTitle: true },
];

export default function OpeningScene() {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [completedLines, setCompletedLines] = useState<Array<typeof LINES[0] & { id: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;
    const line = LINES[currentLine];
    if (charIndex < line.text.length) {
      const speed = line.text[charIndex] === ' ' ? 30 : line.isTitle ? 60 : 35;
      const t = setTimeout(() => {
        setDisplayedText(prev => prev + line.text[charIndex]);
        setCharIndex(i => i + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const pause = line.isTitle ? 2000 : 1000;
      const t = setTimeout(() => {
        setCompletedLines(prev => [...prev, { ...line, id: currentLine }]);
        setDisplayedText('');
        setCharIndex(0);
        if (currentLine < LINES.length - 1) {
          setCurrentLine(l => l + 1);
        } else {
          setDone(true);
        }
      }, pause);
      return () => clearTimeout(t);
    }
  }, [charIndex, currentLine, done]);

  // Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [completedLines, displayedText]);

  return (
    <div
      className="section-container"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(0,30,80,0.6) 0%, rgba(5,13,31,1) 60%)',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Constellation dots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${5 + (i * 8.3) % 90}%`,
          top: `${5 + (i * 7.7) % 85}%`,
          width: `${(i % 3) + 2}px`,
          height: `${(i % 3) + 2}px`,
          borderRadius: '50%',
          background: i % 4 === 0 ? '#00d4ff' : 'white',
          boxShadow: i % 4 === 0 ? '0 0 10px rgba(0,212,255,0.8)' : 'none',
          animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite ${i * 0.3}s`,
          pointerEvents: 'none', zIndex: 1,
        }} />
      ))}

      {/* Text container */}
      <div
        ref={containerRef}
        style={{
          maxWidth: '760px',
          width: '100%',
          position: 'relative',
          zIndex: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          padding: '20px',
        }}
      >
        <style>{`.opening-scroll::-webkit-scrollbar { display: none; }`}</style>

        {/* Completed lines */}
        {completedLines.map((line, i) => (
          <div
            key={line.id}
            style={{
              marginBottom: '16px',
              opacity: Math.max(0.3, 1 - (completedLines.length - i - 1) * 0.06),
              transition: 'opacity 0.8s ease',
            }}
          >
            {line.isTitle ? (
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                color: i === 0 ? '#00d4ff' : '#e0f0ff',
                textShadow: i === 0 ? '0 0 30px rgba(0,212,255,0.6)' : '0 0 20px rgba(200,220,255,0.3)',
                lineHeight: 1.4, margin: 0,
                fontWeight: '700',
              }}>
                {line.text}
              </h2>
            ) : (
              <p style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: 'rgba(200, 220, 255, 0.8)',
                lineHeight: 1.8, margin: 0,
                fontStyle: 'italic',
              }}>
                {line.text}
              </p>
            )}
          </div>
        ))}

        {/* Current typing line */}
        {!done && displayedText && (
          <div style={{ marginBottom: '16px' }}>
            {LINES[currentLine].isTitle ? (
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                color: currentLine === 0 ? '#00d4ff' : '#e0f0ff',
                textShadow: '0 0 20px rgba(0,212,255,0.3)',
                lineHeight: 1.4, margin: 0, fontWeight: '700',
              }}>
                {displayedText}
                <span className="typewriter-cursor" />
              </h2>
            ) : (
              <p style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: 'rgba(220, 235, 255, 0.9)',
                lineHeight: 1.8, margin: 0, fontStyle: 'italic',
              }}>
                {displayedText}
                <span className="typewriter-cursor" />
              </p>
            )}
          </div>
        )}

        {/* Done message */}
        {done && (
          <div style={{
            marginTop: '40px',
            textAlign: 'center',
            animation: 'fadeInUp 1.2s ease both',
            padding: '30px',
            background: 'rgba(0, 20, 60, 0.3)',
            borderRadius: '20px',
            border: '1px solid rgba(0, 212, 255, 0.15)',
          }}>
            <div style={{
              fontSize: '3rem',
              animation: 'heartbeat 1.5s ease-in-out infinite',
              marginBottom: '16px',
            }}>
              💙
            </div>
            <p style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              color: '#00d4ff',
              textShadow: '0 0 20px rgba(0,212,255,0.4)',
            }}>
              Scroll down to continue your story...
            </p>
            <div style={{
              marginTop: '16px',
              fontSize: '1.5rem',
              animation: 'float 2s ease-in-out infinite',
            }}>
              ↓
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
