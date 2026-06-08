import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.18);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [vinylAngle, setVinylAngle] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const vinylTimerRef = useRef<number | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncSongs = async () => {
      await fileManager.refresh();
      if (cancelled) return;
      const nextSongs = fileManager.getMusic().map((file) => ({
        url: file.data,
        name: file.name,
      }));
      setSongs(nextSongs);
      if (nextSongs.length > 0 && currentIndex >= nextSongs.length) {
        setCurrentIndex(0);
      }
    };

    void syncSongs();
    const id = window.setInterval(() => {
      void syncSongs();
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentIndex]);

  const currentSong = songs[currentIndex];

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVol: number) => {
    audio.volume = 0;
    let vol = 0;
    const step = targetVol / 40;
    const interval = window.setInterval(() => {
      vol = Math.min(vol + step, targetVol);
      audio.volume = vol;
      if (vol >= targetVol) clearInterval(interval);
    }, 120);
  }, []);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return false;

    try {
      await audio.play();
      setIsPlaying(true);
      setUserInteracted(true);
      setAudioError(null);
      fadeIn(audio, isMuted ? 0 : volume);
      return true;
    } catch (err) {
      console.warn('play error', err);
      setUserInteracted(true);
      setIsPlaying(false);
      return false;
    }
  }, [currentSong, fadeIn, isMuted, volume]);

  useEffect(() => {
    const handler = () => {
      if (!isPlaying) {
        void attemptPlay();
      }
    };

    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [attemptPlay, isPlaying]);

  const attemptPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
      return;
    }

    if (audio.src !== currentSong.url) {
      audio.src = currentSong.url;
      audio.load();
    }

    setAudioError(null);

    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay, currentSong?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (songs.length > 1) {
        setCurrentIndex((i) => (i + 1) % songs.length);
      }
    };

    const handleError = () => {
      if (!audio.src) return;
      setAudioError('Failed to load audio resource');
      setIsPlaying(false);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = window.setTimeout(() => {
        setAudioError(null);
      }, 3000);
    };

    const handleLoaded = () => {
      setAudioError(null);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoaded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [songs.length]);

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
  }, [audioError, autoPlay, currentSong, fadeIn, isMuted, isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    progressTimerRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 300);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      vinylTimerRef.current = window.setInterval(() => {
        setVinylAngle((a) => (a + 2) % 360);
      }, 50);
    } else if (vinylTimerRef.current) {
      clearInterval(vinylTimerRef.current);
    }

    return () => {
      if (vinylTimerRef.current) clearInterval(vinylTimerRef.current);
    };
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
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,102,255,0.4)',
            animation: isPlaying ? 'spin-slow 4s linear infinite' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

      <div className="music-player" style={{ zIndex: 100 }}>
        <div
          className="glass"
          style={{
            padding: '14px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: isExpanded ? '12px' : 0,
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                flexShrink: 0,
                background: `conic-gradient(from ${vinylAngle}deg, #0d1b3e 0%, #1a3a6b 25%, #0d1b3e 50%, #1a3a6b 75%, #0d1b3e 100%)`,
                border: '2px solid rgba(0, 212, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPlaying ? '0 0 15px rgba(0,212,255,0.3)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00d4ff',
                  boxShadow: '0 0 8px rgba(0,212,255,0.8)',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '9px',
                  color: 'rgba(0,212,255,0.6)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                🎵 Now Playing
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#e0f0ff',
                  fontWeight: '600',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentSong?.name || (songs.length === 0 ? 'Upload songs below...' : 'Loading...')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button
                onClick={() => setIsExpanded((x) => !x)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(0,212,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                }}
              >
                {isExpanded ? '▾' : '▸'}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(0,212,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {isExpanded && (
            <>
              {audioError && (
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: 10,
                    padding: '8px',
                    background: 'rgba(255,100,100,0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,100,100,0.3)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'rgba(255,150,150,0.9)' }}>
                    {audioError}
                  </div>
                  <button
                    onClick={attemptPlay}
                    style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: '#ff6464',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div
                className="progress-bar"
                onClick={handleProgressClick}
                style={{ marginBottom: '10px', cursor: 'pointer' }}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <button
                  onClick={() => {
                    if (isPlaying) attemptPause();
                    else void attemptPlay();
                  }}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0055ee, #00aaff)',
                    border: 'none',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      setCurrentIndex((i) => (i + 1) % songs.length);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: songs.length > 1 ? 'rgba(0,212,255,0.7)' : 'rgba(0,212,255,0.3)',
                    cursor: songs.length > 1 ? 'pointer' : 'default',
                    fontSize: '16px',
                    padding: '4px',
                  }}
                >
                  ⏭
                </button>

                <button
                  onClick={() => setIsMuted((m) => !m)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(0,212,255,0.7)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    padding: '4px',
                  }}
                >
                  {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                </button>

                <div style={{ flex: 1 }}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                  />
                </div>

                {songs.length > 1 && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(0,212,255,0.5)',
                      flexShrink: 0,
                    }}
                  >
                    {currentIndex + 1}/{songs.length}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(0,212,255,0.1)',
                  paddingTop: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: 'rgba(0,212,255,0.5)',
                    textAlign: 'center',
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}
                >
                  🎵 This is our private soundtrack
                </div>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(0,212,255,0.6)',
                    textAlign: 'center',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
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
