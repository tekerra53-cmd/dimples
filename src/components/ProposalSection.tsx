import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Props {
  onYes: () => void;
  onEndingReached: () => void;
}

type Step = 'proposal' | 'yes-reaction' | 'response' | 'whatsapp-options' | 'sent';

export default function ProposalSection({ onYes, onEndingReached }: Props) {
  const [step, setStep] = useState<Step>('proposal');
  const [maybePos, setMaybePos] = useState({ x: 0, y: 0 });
  const [maybeClicks, setMaybeClicks] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const { ref, visible } = useScrollReveal(0.2);

  // WhatsApp phone number — update with real number
  const PHONE = '2347052441423';

  const handleYesClick = () => {
    onYes();
    setStep('yes-reaction');
    setTimeout(() => setStep('response'), 3000);
  };

  const handleMaybeInteract = () => {
    const range = 100 + maybeClicks * 20;
    setMaybePos({
      x: (Math.random() - 0.5) * range * 2,
      y: (Math.random() - 0.5) * range,
    });
    setMaybeClicks(c => c + 1);
  };

  useEffect(() => {
    if (maybeClicks >= 5) {
      setTimeout(handleYesClick, 400);
    }
  }, [maybeClicks]);

  const buildMessage = () => {
    return `Hey... I said YES 💙\n\n${responseText}\n\n— Sent from your proposal website ❤️`;
  };

  const handleSendWhatsApp = () => {
    const msg = encodeURIComponent(buildMessage());
    const url = PHONE ? `https://wa.me/${2347052441423}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
    setStep('sent');
    setTimeout(() => onEndingReached(), 4000);
  };

  const handleCopy = async () => {
    const msg = buildMessage();
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      const el = document.createElement('textarea');
      el.value = msg;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  };

  useEffect(() => {
    if (responseText) localStorage.setItem('marvellous_response', responseText);
  }, [responseText]);

  return (
    <div
      className="section-container"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, rgba(0,40,120,0.4) 0%, rgba(5,13,31,1) 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient circle */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,80,200,0.08) 0%, transparent 70%)',
        animation: 'pulse-glow 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* ─── PROPOSAL STEP ─── */}
      {step === 'proposal' && (
        <div style={{
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s ease',
          position: 'relative', zIndex: 2,
          maxWidth: '720px', width: '100%',
          padding: '0 16px',
        }}>
          {/* Name reveal */}
          <div style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            color: 'rgba(0,212,255,0.7)',
            marginBottom: '16px',
            letterSpacing: '1px',
          }}>
            Okechukwu Marvellous Chinazamuekpere...
          </div>

          {/* Main question */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            lineHeight: 1.25,
            marginBottom: '16px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff 0%, #a0d4ff 40%, #00d4ff 70%, #7b9fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.3))',
          }}>
            Will You Be<br />My Girlfriend?
          </h1>

          <div style={{ fontSize: '3rem', marginBottom: '50px', animation: 'heartbeat 1.2s ease-in-out infinite' }}>
            💙
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex', gap: '20px',
            justifyContent: 'center', alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {/* YES */}
            <button
              className="yes-button"
              onClick={handleYesClick}
              style={{ fontSize: '1.3rem', padding: '20px 60px', letterSpacing: '1px' }}
            >
              YES 💙
            </button>

            {/* MAYBE */}
            <div style={{ position: 'relative' }}>
              <button
                className="maybe-button"
                onMouseEnter={handleMaybeInteract}
                onClick={handleMaybeInteract}
                onTouchStart={handleMaybeInteract}
                style={{
                  transform: `translate(${maybePos.x}px, ${maybePos.y}px)`,
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  userSelect: 'none',
                }}
              >
                {maybeClicks >= 3 ? '…okay fine YES 🤭' : 'MAYBE 🤭'}
              </button>
            </div>
          </div>

          {/* Hint text */}
          {maybeClicks > 0 && maybeClicks < 5 && (
            <p style={{
              marginTop: '24px',
              color: 'rgba(0,212,255,0.6)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              animation: 'fadeInUp 0.4s ease',
            }}>
              {maybeClicks === 1 && "Hm, that button doesn't want to be pressed 😏"}
              {maybeClicks === 2 && "It keeps running... maybe follow its lead? 💙"}
              {maybeClicks >= 3 && "Some things are just meant to be 💙"}
            </p>
          )}
        </div>
      )}

      {/* ─── YES REACTION ─── */}
      {step === 'yes-reaction' && (
        <div style={{
          textAlign: 'center', position: 'relative', zIndex: 2,
          maxWidth: '600px',
          animation: 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <div style={{
            fontSize: '5rem', marginBottom: '28px',
            animation: 'heartbeat 0.7s ease-in-out infinite',
          }}>
            🥹💙
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            background: 'linear-gradient(135deg, #ffffff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '20px',
            animation: 'fadeInUp 0.8s ease both',
          }}>
            Wait... really? 🥹💙
          </h2>
          <p style={{
            color: 'rgba(200,220,255,0.8)',
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            fontStyle: 'italic',
            fontFamily: "'Crimson Text', serif",
            animation: 'fadeInUp 0.8s ease 0.3s both',
            lineHeight: 1.8,
          }}>
            You just made me the happiest person alive...<br />
            I'm literally smiling so hard right now 😭💙
          </p>
        </div>
      )}

      {/* ─── RESPONSE STEP ─── */}
      {step === 'response' && (
        <div style={{
          textAlign: 'center', position: 'relative', zIndex: 2,
          maxWidth: '600px', width: '100%',
          animation: 'fadeInUp 0.8s ease both',
          padding: '0 16px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>
            💙
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            color: '#00d4ff',
            textShadow: '0 0 20px rgba(0,212,255,0.4)',
            marginBottom: '8px',
          }}>
            Say something to him... 💙
          </h2>
          <p style={{
            color: 'rgba(200,220,255,0.55)',
            fontSize: '0.9rem', marginBottom: '24px',
            fontStyle: 'italic',
          }}>
            Let him know how you feel right now
          </p>

          <div style={{ position: 'relative' }}>
            <textarea
              className="response-input"
              placeholder="Tell him how you feel... 💙"
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              maxLength={500}
            />
            <div style={{
              position: 'absolute', bottom: '10px', right: '14px',
              fontSize: '11px', color: 'rgba(0,212,255,0.4)',
            }}>
              {responseText.length}/500
            </div>
          </div>

          {/* Floating hearts when typing */}
          {responseText.length > 0 && (
            <div style={{ marginTop: '8px', textAlign: 'left', paddingLeft: '4px' }}>
              {[...Array(Math.min(Math.floor(responseText.length / 25) + 1, 8))].map((_, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  fontSize: '14px',
                  marginRight: '3px',
                  animation: `float ${1.5 + i * 0.2}s ease-in-out infinite ${i * 0.15}s`,
                }}>💙</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '14px',
            marginTop: '24px', flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <button
              className="whatsapp-btn"
              onClick={handleSendWhatsApp}
              disabled={!responseText.trim()}
              style={{
                opacity: responseText.trim() ? 1 : 0.5,
                cursor: responseText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              💬 Send on WhatsApp
            </button>

            <button
              onClick={handleCopy}
              disabled={!responseText.trim()}
              style={{
                background: 'rgba(0, 20, 60, 0.6)',
                border: '1px solid rgba(0,212,255,0.35)',
                borderRadius: '50px',
                padding: '14px 28px',
                color: '#00d4ff',
                cursor: responseText.trim() ? 'pointer' : 'not-allowed',
                opacity: responseText.trim() ? 1 : 0.5,
                fontSize: '15px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,50,120,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,20,60,0.6)')}
            >
              📋 Copy My Message
            </button>
          </div>

          <p style={{
            marginTop: '16px',
            color: 'rgba(200,220,255,0.35)',
            fontSize: '0.78rem',
          }}>
            🔒 Your response is saved automatically
          </p>
        </div>
      )}

      {/* ─── SENT ─── */}
      {step === 'sent' && (
        <div style={{
          textAlign: 'center', position: 'relative', zIndex: 2,
          animation: 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
          <div style={{
            fontSize: '4.5rem', marginBottom: '24px',
            animation: 'bounce-in 0.8s ease both',
          }}>
            📱💙
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: '#00d4ff',
            textShadow: '0 0 30px rgba(0,212,255,0.5)',
            marginBottom: '16px',
          }}>
            Your answer is on its way... 💙
          </h2>
          <p style={{
            color: 'rgba(200,220,255,0.7)',
            fontStyle: 'italic',
            fontFamily: "'Crimson Text', serif",
            fontSize: '1.2rem',
            lineHeight: 1.8,
          }}>
            He's probably smiling at his phone right now...<br />
            You just changed everything. 💙
          </p>
          <div style={{
            marginTop: '30px', fontSize: '2rem',
            animation: 'heartbeat 1s ease-in-out infinite',
          }}>
            ❤️
          </div>
        </div>
      )}

      {/* Copy Toast */}
      <div className={`toast ${showCopyToast ? 'show' : ''}`}>
        ✓ Copied! Now paste it in his DMs 💙
      </div>
    </div>
  );
}

import React from 'react';
