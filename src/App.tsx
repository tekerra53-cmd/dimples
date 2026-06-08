import { useState, useCallback, useEffect } from 'react';
import ScrollProgress from './components/ScrollProgress';
import LockScreen from './components/LockScreen';
import ParticleCanvas from './components/ParticleCanvas';
import MusicPlayer from './components/MusicPlayer';
import OpeningScene from './components/OpeningScene';
import HeroSection from './components/HeroSection';
import PersistentCard from './components/PersistentCard';
import WhenIThinkSection from './components/WhenIThinkSection';
import LoveLetter from './components/LoveLetter';
import AdmireSection from './components/AdmireSection';
import NameReveal from './components/NameReveal';
import FinalBuildup from './components/FinalBuildup';
import ProposalSection from './components/ProposalSection';
import EndingScene from './components/EndingScene';
import CelebrationOverlay from './components/CelebrationOverlay';

export default function App() {
  // Initialize from localStorage if available
  const [unlocked, setUnlocked] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const [, setMusicReady] = useState(false);
  const [showMain, setShowMain] = useState(() => {
    try {
      const saved = localStorage.getItem('showMain');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [showEnding, setShowEnding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(() => {
    try {
      return localStorage.getItem('audio_enabled') === 'true';
    } catch {
      return false;
    }
  });

  // Persist showMain to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('showMain', String(showMain));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [showMain]);

  // listen for audio-enabled event
  useEffect(() => {
    const handler = () => {
      try { localStorage.setItem('audio_enabled', 'true'); } catch {}
      setAudioAllowed(true);
    };
    window.addEventListener('audio-enabled', handler as EventListener);
    return () => window.removeEventListener('audio-enabled', handler as EventListener);
  }, []);

  // prevent scrolling until audio allowed
  useEffect(() => {
    try {
      if (!audioAllowed) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    } catch {}
    return () => { try { document.body.style.overflow = ''; } catch {} };
  }, [audioAllowed]);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    setTimeout(() => {
      setWelcomeShown(true);
      setTimeout(() => {
        setShowMain(true);
      }, 3000);
    }, 1000);
  }, []);

  const handleLogout = useCallback(() => {
    setUnlocked(false);
    setWelcomeShown(false);
    setShowMain(false);
    setShowEnding(false);
    setShowCelebration(false);
    setMusicReady(false);
    try {
      localStorage.removeItem('showMain');
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  const handleYes = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 8000);
  }, []);

  const handleEndingReached = useCallback(() => {
    setShowEnding(true);
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: '#050d1f' }}>
      {/* Global Particle Canvas */}
      <ParticleCanvas active={showMain} />

      {/* Lock Screen */}
      {!showMain && (
        <LockScreen
          onUnlock={handleUnlock}
          unlocked={unlocked}
          welcomeShown={welcomeShown}
        />
      )}

      {/* Scroll Progress */}
      {showMain && <ScrollProgress />}

      {/* Music Player - Always render, autoplay on lock screen */}
      <MusicPlayer autoPlay={true} />

      {/* Logout Button */}
      {showMain && (
        <button
          onClick={handleLogout}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 50,
            background: 'rgba(255, 100, 100, 0.1)',
            border: '2px solid rgba(255, 100, 100, 0.5)',
            color: '#ff6464',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 100, 100, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Logout"
        >
          🔓
        </button>
      )}

      {/* Celebration Overlay */}
      {showCelebration && <CelebrationOverlay />}

      {/* Main Content */}
      {showMain && (
        <main>
          {!audioAllowed && (
            <div style={{position: 'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(180deg, rgba(5,13,31,0.92), rgba(5,13,31,0.98))', color:'#fff', padding:20, textAlign:'center'}}>
              <div>
                <h2 style={{fontSize:22, marginBottom:12}}>Please enable sound to continue</h2>
                <p style={{opacity:0.95, marginBottom:18}}>Tap the play button below to enable audio. Scrolling and reading will be available after that.</p>
                <div style={{display:'flex', gap:12, justifyContent:'center', alignItems:'center'}}>
                  <button onClick={() => window.dispatchEvent(new Event('request-audio-play'))} style={{padding:'10px 16px', borderRadius:10, background:'#00aaff', color:'#fff', border:'none', fontWeight:600, cursor:'pointer'}}>
                    ▶ Enable Sound
                  </button>
                  <div style={{opacity:0.9}}>Or use the player control (🎵) at the top-right.</div>
                </div>
              </div>
            </div>
          )}
          <OpeningScene />
          <HeroSection />
          <PersistentCard />
          <WhenIThinkSection />
          <LoveLetter />
          <AdmireSection />
          <NameReveal />
          <FinalBuildup />
          <ProposalSection onYes={handleYes} onEndingReached={handleEndingReached} />
          {showEnding && <EndingScene />}
        </main>
      )}
    </div>
  );
}
