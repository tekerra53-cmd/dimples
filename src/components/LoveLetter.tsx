import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LETTER_CONTENT = `Dear Marvellous,

I sat down to write this and realized something
There aren't enough words in any language to describe what you mean to me.

But I'm going to try anyway.


You make me laugh when I don't even feel like smiling.
You make me calm when everything feels chaotic.
You make me feel Seen, Heard and Wanted.

And the craziest part?
You do all of this without even trying.
That's just who you are.

I don't have a perfect past.
I don't have all the answers.
But I know this with every part of me:

You are worth every risk.
You are worth every wait.
You are worth every mile between us.

So here I am, heart in my hands,
Asking you to let me love you the way you deserve.

Because you, Marvellous,
Deserve someone who looks at you like you hung the moon.

And I already do.


yours,
Someone Who Cares More Than Words Can Say 💙`;

export default function LoveLetter() {
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'reading' | 'done'>('sealed');
  const [displayedText, setDisplayedText] = useState('');
  const [charIdx, setCharIdx] = useState(0);
  const { ref, visible } = useScrollReveal(0.2);

  const handleOpenSeal = () => {
    setPhase('opening');
    setTimeout(() => setPhase('reading'), 800);
  };

  useEffect(() => {
    if (phase !== 'reading') return;
    if (charIdx < LETTER_CONTENT.length) {
      const char = LETTER_CONTENT[charIdx];
      const delay = char === '\n' ? 50 : 15;
      const t = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCharIdx(i => i + 1);
      }, delay);
      return () => clearTimeout(t);
    } else {
      setPhase('done');
    }
  }, [phase, charIdx]);

  return (
    <div
      className="section-container"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        padding: '80px 20px',
        background: 'linear-gradient(180deg, rgba(0,20,60,0.2), rgba(0,5,20,0.4), rgba(0,20,60,0.2))',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1rem', color: 'rgba(0,212,255,0.6)',
          letterSpacing: '2px', marginBottom: '10px',
          opacity: visible ? 1 : 0, transition: 'all 0.6s ease',
        }}>
          From the heart
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          color: '#00d4ff',
          textShadow: '0 0 30px rgba(0,212,255,0.4)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.1s',
        }}>
          A Letter From My Heart 💙
        </h2>
      </div>

      {/* Sealed state */}
      {(phase === 'sealed' || phase === 'opening') && (
        <div style={{
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}>
          {/* Envelope */}
          <div style={{
            width: 'min(320px, 90vw)',
            margin: '0 auto 28px',
            position: 'relative',
          }}>
            {/* Envelope body */}
            <div style={{
              height: '200px',
              background: 'linear-gradient(160deg, #f5e6c8 0%, #ede0c0 50%, #e8d5a8 100%)',
              borderRadius: '8px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Left crease */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, top: '45%',
                background: 'linear-gradient(135deg, #dcc895 0%, transparent 50%, #dcc895 100%)',
                clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
              }} />
              {/* Top flap */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '45%',
                background: 'linear-gradient(160deg, #e8d5a8, #f0e0b0)',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                transformOrigin: 'top',
                transform: phase === 'opening' ? 'rotateX(-180deg)' : 'rotateX(0deg)',
                transition: 'transform 0.6s ease',
              }} />
              <p style={{
                fontFamily: "'Dancing Script', cursive",
                color: '#8b6914', fontSize: '1.1rem',
                position: 'relative', zIndex: 1,
                marginTop: '20px',
              }}>
                For Marvellous 💙
              </p>
            </div>
          </div>

          {/* Wax seal */}
          <div
            onClick={handleOpenSeal}
            style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #2266ff, #0033cc, #001a80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,102,255,0.5), 0 0 40px rgba(0,102,255,0.2)',
              transition: 'all 0.3s ease',
              animation: 'pulse-glow 2s ease-in-out infinite',
              transform: phase === 'opening' ? 'scale(0) rotate(30deg)' : 'scale(1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.15)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,102,255,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,102,255,0.5)';
            }}
          >
            💙
          </div>

          <p style={{
            color: 'rgba(0,212,255,0.5)',
            fontSize: '0.875rem',
            fontStyle: 'italic',
          }}>
            Click the seal to open the letter 💙
          </p>
        </div>
      )}

      {/* Reading / Done state */}
      {(phase === 'reading' || phase === 'done') && (
        <div style={{
          maxWidth: '700px', width: '100%',
          animation: 'slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
          {/* Paper */}
          <div
            className="letter-paper"
            style={{
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,180,120,0.3)',
            }}
          >
            {/* Header decoration */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✉️</div>
              <span style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: '1.8rem',
                color: '#7a5c10',
                borderBottom: '1px solid rgba(120,80,0,0.2)',
                paddingBottom: '8px',
              }}>
                A Letter To U Princess 💙
              </span>
            </div>

            {/* Letter content */}
            <pre style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: '#3d2b05',
              lineHeight: 2,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}>
              {displayedText}
              {phase === 'reading' && (
                <span style={{
                  display: 'inline-block',
                  width: '2px', height: '1em',
                  background: '#7a5c10',
                  verticalAlign: 'middle',
                  marginLeft: '2px',
                  animation: 'blink 0.8s ease-in-out infinite',
                }} />
              )}
            </pre>

            {/* Done decoration */}
            {phase === 'done' && (
              <>
                <div style={{
                  textAlign: 'right',
                  marginTop: '32px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(120,80,0,0.15)',
                  animation: 'fadeInUp 0.8s ease both',
                }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>💙</div>
                  <div style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: '1.8rem',
                    color: '#2f4f75',
                    letterSpacing: '1px',
                    fontWeight: '500',
                    lineHeight: 1.2,
                    marginBottom: '4px',
                  }}>
                    ukpe famous chinedu
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(120,80,0,0.6)',
                    fontStyle: 'italic',
                    marginTop: '8px',
                  }}>
                    Written with all my heart
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Re-read option */}
          {phase === 'done' && (
            <div style={{
              textAlign: 'center', marginTop: '20px',
              animation: 'fadeInUp 1s ease 1s both',
            }}>
              <button
                onClick={() => {
                  setPhase('sealed');
                  setDisplayedText('');
                  setCharIdx(0);
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(0,212,255,0.25)',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  color: 'rgba(0,212,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
              >
                📜 Read again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
