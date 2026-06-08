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
  const [unlocked, setUnlocked] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
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

  useEffect(() => {
    try {
      localStorage.setItem('showMain', String(showMain));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [showMain]);

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
      <ParticleCanvas active={showMain} />

      {!showMain && (
        <LockScreen
          onUnlock={handleUnlock}
          unlocked={unlocked}
          welcomeShown={welcomeShown}
        />
      )}

      {showMain && <ScrollProgress />}

      <MusicPlayer autoPlay={true} />

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

      {showCelebration && <CelebrationOverlay />}

      {showMain && (
        <main>
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
