import { useState, useRef, useEffect, useCallback } from 'react';
import { fileManager } from '../utils/fileManager';

interface Props {
  autoPlay: boolean;
}

interface Song {
  url: string;
  name: string;
}

export default function MusicPlayer({ autoPlay }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.18);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [vinylAngle, setVinylAngle] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentUrlRef = useRef<string | null>(null);
  const idToUrlRef = useRef<Record<string, string>>({});
  const progressRef = useRef<number>(0);
  const vinylRef = useRef<number>(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Load music from fileManager on mount
  useEffect(() => {
    const musicFiles = fileManager.getMusic();
    if (musicFiles.length > 0) {
      const uploadedSongs = musicFiles.map(file => ({
        url: file.data,
        name: file.name,
      }));
      setSongs(uploadedSongs);
    }
  }, []);

  // Poll for music changes so uploads appear without a reload
  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      const musicFiles = fileManager.getMusic();
      if (musicFiles.length > 0) {
        const uploadedSongs: Song[] = [];
        for (const file of musicFiles) {
          if (file.data && file.data.startsWith('__idb__:')) {
            const id = file.data.split(':')[1];
            if (!idToUrlRef.current[id]) {
              const url = await fileManager.getMusicBlobUrl(id);
              if (url) idToUrlRef.current[id] = url;
            }
            if (idToUrlRef.current[id]) uploadedSongs.push({ url: idToUrlRef.current[id], name: file.name });
          } else {
            uploadedSongs.push({ url: file.data, name: file.name });
          }
        }
        if (!cancelled) setSongs(uploadedSongs);
      } else {
        if (!cancelled) setSongs([]);
      }
    };
    update();
    const id = setInterval(update, 2000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const currentSong = songs[currentIndex];

  const [audioError, setAudioError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVol: number) => {
    audio.volume = 0;
    let vol = 0;
    const step = targetVol / 40;
    const interval = setInterval(() => {
      vol = Math.min(vol + step, targetVol);
      audio.volume = vol;
      if (vol >= targetVol) clearInterval(interval);
    }, 120);
  }, []);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      await audio.play();
      setIsPlaying(true);
      setUserInteracted(true);
      setAutoplayBlocked(false);
      fadeIn(audio, isMuted ? 0 : volume);
      try { window.dispatchEvent(new CustomEvent('audio-enabled')); } catch {}
      return true;
    } catch (err) {
      console.warn('play error', err);
      setAutoplayBlocked(true);
      setUserInteracted(true);
      setIsPlaying(false);
      return false;
    }
  }, [fadeIn, isMuted, volume]);

  // Listen for external requests to play (e.g., overlay button)
  useEffect(() => {
    const handler = () => { attemptPlay(); };
    window.addEventListener('request-audio-play', handler as EventListener);
    return () => window.removeEventListener('request-audio-play', handler as EventListener);
  }, [attemptPlay]);

  // Listen for user interactions to unmute the audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isMuted && userInteracted === false) {
        setUserInteracted(true);
        setIsMuted(false);
      }
    };
    
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isMuted, userInteracted]);

  const attemptPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  // Load song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    // avoid resetting if same src
    if (!currentSong.url) {
      console.warn('currentSong has no url', currentSong);
      setAudioError('No URL for selected audio');
      return;
    }
    if (audio.src && currentSong.url && audio.src === currentSong.url) {
      return;
    }
    setAudioError(null);
    audio.src = currentSong.url;
    currentUrlRef.current = currentSong.url && currentSong.url.startsWith('blob:') ? currentSong.url : null;
    audio.load();
    if (isPlaying && autoPlay && userInteracted && !audioError) {
      audio.play().then(() => fadeIn(audio, volume)).catch((e) => { console.warn('play error', e); setIsPlaying(false); });
    }
  }, [currentIndex, currentSong]);

  // When songs list changes, reset index and try to play first song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (songs.length === 0) {
      // Only update if src is not already empty
      if (audio.src) {
        audio.src = '';
        audio.pause();
        setIsPlaying(false);
      }
      setAudioError(null);
      currentUrlRef.current = null;
      return;
    }

    setCurrentIndex(0);
    const first = songs[0];
    if (!first.url) return;
    
    // Only load if src is different
    if (audio.src === first.url) return;
    
    audio.src = first.url;
    currentUrlRef.current = first.url && first.url.startsWith('blob:') ? first.url : null;
    setAudioError(null);
    audio.load();
    if (autoPlay && userInteracted && !audioError) {
      setIsPlaying(true);
      audio.play().then(() => fadeIn(audio, isMuted ? 0 : volume)).catch((e) => {
        console.warn('play error', e);
        setIsPlaying(false);
      });
    }
  }, [songs]);

  // cleanup cached blob urls on unmount
  useEffect(() => {
    return () => {
      try {
        Object.values(idToUrlRef.current).forEach(u => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); });
      } catch {}
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      console.log('audio ended');
      if (songs.length > 0) {
        setCurrentIndex(i => (i + 1) % songs.length);
      }
    };

    const handlePlay = () => { console.log('audio play'); };
    const handlePause = () => { console.log('audio pause'); };
    const handleError = (ev: any) => { 
      console.error('audio error', ev, 'code:', audio.error?.code, 'message:', audio.error?.message);
      // Ignore errors from empty src
      if (!audio.src) return;
      setAudioError('Failed to load audio resource');
      // Stop trying to play when error occurs
      setIsPlaying(false);
      // Clear any pending error timeout
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      // Reset error state after 3 seconds to allow retry
      errorTimeoutRef.current = setTimeout(() => {
        setAudioError(null);
      }, 3000);
    };
    const handleLoaded = () => {
      if (!audio) return;
      setAudioError(null);
    };
    const handleTime = () => {
      if (!audio) return;
      // Time update - no state needed
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTime);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTime);
    };
  }, [songs.length]);

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || !autoPlay || audioError) return;
    if (isPlaying) {
      audio.play().then(() => fadeIn(audio, isMuted ? 0 : volume)).catch((e) => {
        console.warn('play error', e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, autoPlay, audioError]);

  // Auto-play when songs loaded
  useEffect(() => {
    if (songs.length > 0 && autoPlay && !isPlaying) {
      // Try to play immediately - browser will allow muted autoplay
      setIsPlaying(true);
    }
  }, [songs, autoPlay]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Progress tracking
  useEffect(() => {
    progressRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 300);
    return () => clearInterval(progressRef.current);
  }, []);

  // Vinyl rotation
  useEffect(() => {
    if (isPlaying) {
      vinylRef.current = window.setInterval(() => {
        setVinylAngle(a => (a + 2) % 360);
      }, 50);
    } else {
      clearInterval(vinylRef.current);
    }
    return () => clearInterval(vinylRef.current);
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  if (isMinimized) {
    return (
      <>
        <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            width: '50px', height: '50px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            border: 'none', color: 'white', fontSize: '20px',
            cursor: 'pointer', zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,102,255,0.4)',
            animation: isPlaying ? 'spin-slow 4s linear infinite' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          🎵
        </button>
      </>
    );
  }

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />

      <div
        className="music-player"
        style={{ zIndex: 100 }}
      >
        <div
          className="glass"
          style={{
            padding: '14px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.1)',
          }}
        >
          {/* Top row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: isExpanded ? '12px' : 0,
          }}>
            {/* Vinyl disc */}
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(from ${vinylAngle}deg, #0d1b3e 0%, #1a3a6b 25%, #0d1b3e 50%, #1a3a6b 75%, #0d1b3e 100%)`,
                border: '2px solid rgba(0, 212, 255, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying ? '0 0 15px rgba(0,212,255,0.3)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#00d4ff',
                boxShadow: '0 0 8px rgba(0,212,255,0.8)',
              }} />
            </div>

            {/* Song info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '9px', color: 'rgba(0,212,255,0.6)',
                letterSpacing: '1px', textTransform: 'uppercase',
                marginBottom: '2px',
              }}>
                🎵 Now Playing
              </div>
              <div style={{
                fontSize: '12px', color: '#e0f0ff',
                fontWeight: '600', overflow: 'hidden',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {currentSong?.name || (songs.length === 0 ? 'Upload songs below...' : 'Loading...')}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button
                onClick={() => setIsExpanded(x => !x)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(0,212,255,0.5)', cursor: 'pointer',
                  fontSize: '14px', padding: '4px',
                }}
              >
                {isExpanded ? '▾' : '▸'}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(0,212,255,0.4)', cursor: 'pointer',
                  fontSize: '12px', padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {isExpanded && (
            <>
              {autoplayBlocked && (
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                  <button onClick={attemptPlay} style={{ padding: '8px 12px', borderRadius: 8, background: '#00aaff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Click to enable sound
                  </button>
                </div>
              )}
              {audioError && (
                <div style={{ textAlign: 'center', marginBottom: 10, padding: '8px', background: 'rgba(255,100,100,0.1)', borderRadius: 8, border: '1px solid rgba(255,100,100,0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,150,150,0.9)' }}>
                    {audioError}
                  </div>
                  <button onClick={attemptPlay} style={{ marginTop: '6px', padding: '6px 10px', borderRadius: 6, background: '#ff6464', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px' }}>
                    Retry
                  </button>
                </div>
              )}
              {/* Progress bar */}
              <div
                className="progress-bar"
                onClick={handleProgressClick}
                style={{ marginBottom: '10px', cursor: 'pointer' }}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* Controls row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '8px', marginBottom: '10px',
              }}>
                <button
                  onClick={() => {
                    if (isPlaying) attemptPause();
                    else attemptPlay();
                  }}
                  style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0055ee, #00aaff)',
                    border: 'none', color: 'white', fontSize: '13px',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,102,255,0.3)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <button
                  onClick={() => {
                    if (songs.length > 1) {
                      setCurrentIndex(i => (i + 1) % songs.length);
                    }
                  }}
                  style={{
                    background: 'none', border: 'none',
                    color: songs.length > 1 ? 'rgba(0,212,255,0.7)' : 'rgba(0,212,255,0.3)',
                    cursor: songs.length > 1 ? 'pointer' : 'default',
                    fontSize: '16px', padding: '4px',
                  }}
                >
                  ⏭
                </button>

                <button
                  onClick={() => setIsMuted(m => !m)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(0,212,255,0.7)', cursor: 'pointer',
                    fontSize: '15px', padding: '4px',
                  }}
                >
                  {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                </button>

                <div style={{ flex: 1 }}>
                  <input
                    type="range" min="0" max="1" step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={e => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                  />
                </div>

                {songs.length > 1 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(0,212,255,0.5)',
                    flexShrink: 0,
                  }}>
                    {currentIndex + 1}/{songs.length}
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '1px solid rgba(0,212,255,0.1)',
                paddingTop: '12px',
              }}>
                <div style={{
                  fontSize: '10px', color: 'rgba(0,212,255,0.5)',
                  textAlign: 'center', marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  🎵 This is our private soundtrack
                </div>
                <p style={{
                  fontSize: '11px', color: 'rgba(0,212,255,0.6)',
                  textAlign: 'center', margin: 0,
                  lineHeight: 1.5,
                }}>
                  {songs.length > 0 ? 'I chose this song especially for you 💙' : 'Music coming soon...'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
