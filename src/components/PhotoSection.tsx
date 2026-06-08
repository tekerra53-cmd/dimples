import { useState, useMemo, useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fileManager, StoredFile } from '../utils/fileManager';

const DEFAULT_GALLERY_ITEMS = [
  {
    id: 1,
    bgColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    emoji: '💕',
  },
  {
    id: 2,
    bgColor: 'linear-gradient(135deg, #88d3ff 0%, #6e45e2 100%)',
    emoji: '💙',
  },
  {
    id: 3,
    bgColor: 'linear-gradient(135deg, #a1ffce 0%, #faffd1 100%)',
    emoji: '💖',
  },
  {
    id: 4,
    bgColor: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    emoji: '💗',
  },
];

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #88d3ff 0%, #6e45e2 100%)',
  'linear-gradient(135deg, #a1ffce 0%, #faffd1 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
];

export default function PhotoSection() {
  const { ref, visible } = useScrollReveal();
  const [photos, setPhotos] = useState<StoredFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for photo updates from admin
  useEffect(() => {
    const checkForUpdates = async () => {
      await fileManager.refresh();
      const updatedPhotos = fileManager.getPhotos();
      setPhotos(updatedPhotos);
    };
    void checkForUpdates();
    pollIntervalRef.current = setInterval(() => {
      void checkForUpdates();
    }, 2000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const gallery = useMemo(() => {
    if (photos.length > 0) {
      return photos.map((photo, idx) => ({
        id: photo.id,
        data: photo.data,
        name: photo.name,
        isDefault: false,
        gradientColor: GRADIENT_COLORS[idx % GRADIENT_COLORS.length],
        emoji: DEFAULT_GALLERY_ITEMS[idx % DEFAULT_GALLERY_ITEMS.length].emoji,
      }));
    }
    return DEFAULT_GALLERY_ITEMS.map((item) => ({
      ...item,
      isDefault: true,
      gradientColor: item.bgColor,
      name: 'Placeholder',
    }));
  }, [photos]);

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused || gallery.length <= 1) return;

    carouselIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, 4000);

    return () => {
      if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    };
  }, [isPaused, gallery.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 6000);
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % gallery.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 6000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gallery.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const getItemPosition = (index: number) => {
    const position = (index - currentIndex + gallery.length) % gallery.length;
    if (position === 0) return 'center';
    if (position === 1 || position === gallery.length - 1) return 'side';
    return 'back';
  };

  const selectedItem = selectedPhoto !== null ? gallery[selectedPhoto] : null;

  return (
    <div
      className="section-container"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        background: 'linear-gradient(180deg, transparent, rgba(0,20,60,0.2), transparent)',
        padding: 'clamp(20px, 5vw, 40px) 20px',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center', marginBottom: 'clamp(20px, 5vw, 40px)' }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            color: '#00d4ff',
            textShadow: '0 0 30px rgba(0,212,255,0.5)',
            marginBottom: 'clamp(12px, 3vw, 18px)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease',
            lineHeight: 1.2,
          }}
        >
          ✨ My Favourite Moments With You 💙
        </h2>

        <p
          style={{
            color: 'rgba(200, 230, 255, 0.85)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            lineHeight: 1.8,
            maxWidth: '100%',
            padding: '0 15px',
            margin: '0 auto',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.1s',
            fontStyle: 'italic',
          }}
        >
          Each one holds a special memory of us together 💕
        </p>
      </div>

      {/* Carousel Container */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto clamp(30px, 5vw, 48px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.2s',
        }}
      >
        {/* Main Carousel */}
        <div
          style={{
            position: 'relative',
            height: 'clamp(300px, 60vh, 500px)',
            perspective: '1000px',
            cursor: isPaused ? 'pause' : 'play',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Items */}
          {gallery.map((item, index) => {
            const position = getItemPosition(index);
            let transform = '';
            let opacity = 0.3;
            let zIndex = 1;

            if (position === 'center') {
              transform = 'translateX(0) scale(1) rotateY(0deg)';
              opacity = 1;
              zIndex = 10;
            } else if (position === 'side') {
              const isRight = (index - currentIndex + gallery.length) % gallery.length === 1;
              const translateX = isRight ? 'clamp(200px, 25vw, 400px)' : 'clamp(-200px, -25vw, -400px)';
              transform = `translateX(${translateX}) scale(0.85) rotateY(${isRight ? 25 : -25}deg)`;
              opacity = 0.6;
              zIndex = 5;
            } else {
              transform = 'translateX(0) scale(0.7) rotateY(0deg)';
              opacity = 0.2;
              zIndex = 1;
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (position === 'center') setSelectedPhoto(index);
                  else if (position === 'side') {
                    const isRight = (index - currentIndex + gallery.length) % gallery.length === 1;
                    if (isRight) handleNext();
                    else handlePrev();
                  }
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    background: item.isDefault ? item.gradientColor : `url(${(item as any).data})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 'clamp(20px, 4vw, 30px)',
                    overflow: 'hidden',
                    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px ${position === 'center' ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 212, 255, 0.1)'}`,
                    border: `3px solid ${position === 'center' ? 'rgba(0, 212, 255, 0.6)' : 'rgba(0, 212, 255, 0.2)'}`,
                    transform,
                    opacity,
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                    cursor: position === 'center' ? 'pointer' : 'grab',
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,20,60,0.3) 100%)',
                      zIndex: 2,
                    }}
                  />

                  {/* Emoji for default items */}
                  {item.isDefault && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(60px, 20vw, 140px)',
                        animation: 'float 4s ease-in-out infinite',
                        zIndex: 3,
                      }}
                    >
                      {item.emoji}
                    </div>
                  )}

                  {/* Photo Info */}
                  {position === 'center' && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(5, 13, 31, 0.95), transparent)',
                        padding: 'clamp(20px, 4vw, 30px)',
                        zIndex: 5,
                        animation: 'slideUp 0.6s ease',
                      }}
                    >
                      <p
                        style={{
                          color: '#00d4ff',
                          fontSize: 'clamp(14px, 3vw, 18px)',
                          fontWeight: '700',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          margin: '0 0 8px 0',
                        }}
                      >
                        {currentIndex + 1} / {gallery.length}
                      </p>
                      {!item.isDefault && (
                        <p
                          style={{
                            color: 'rgba(200, 230, 255, 0.9)',
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            margin: 0,
                            fontStyle: 'italic',
                          }}
                        >
                          {item.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              background: 'rgba(0, 212, 255, 0.1)',
              border: '2px solid rgba(0, 212, 255, 0.5)',
              color: '#00d4ff',
              width: 'clamp(44px, 10vw, 60px)',
              height: 'clamp(44px, 10vw, 60px)',
              borderRadius: '50%',
              fontSize: 'clamp(20px, 5vw, 28px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Previous (← key)"
          >
            ←
          </button>

          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              background: 'rgba(0, 212, 255, 0.1)',
              border: '2px solid rgba(0, 212, 255, 0.5)',
              color: '#00d4ff',
              width: 'clamp(44px, 10vw, 60px)',
              height: 'clamp(44px, 10vw, 60px)',
              borderRadius: '50%',
              fontSize: 'clamp(20px, 5vw, 28px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Next (→ key)"
          >
            →
          </button>

          {/* Play/Pause indicator */}
          <div
            style={{
              position: 'absolute',
              top: 'clamp(12px, 3vw, 20px)',
              right: 'clamp(12px, 3vw, 20px)',
              zIndex: 20,
              color: '#00d4ff',
              fontSize: 'clamp(16px, 4vw, 24px)',
              opacity: isPaused ? 0.7 : 0.4,
              transition: 'opacity 0.3s ease',
              animation: !isPaused ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
            title={isPaused ? 'Paused' : 'Auto-playing'}
          >
            {isPaused ? '⏸' : '▶'}
          </div>
        </div>

        {/* Thumbnail Dots */}
        {gallery.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 'clamp(8px, 2vw, 12px)',
              justifyContent: 'center',
              marginTop: 'clamp(24px, 5vw, 32px)',
              flexWrap: 'wrap',
            }}
          >
            {gallery.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 6000);
                }}
                style={{
                  width: currentIndex === index ? 'clamp(24px, 6vw, 36px)' : 'clamp(10px, 2.5vw, 14px)',
                  height: 'clamp(8px, 2vw, 12px)',
                  borderRadius: '50px',
                  background: currentIndex === index ? '#00d4ff' : 'rgba(0, 212, 255, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: currentIndex === index ? '0 0 20px rgba(0, 212, 255, 0.6)' : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {selectedPhoto !== null && selectedItem && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 13, 31, 0.97)',
            backdropFilter: 'blur(10px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 'clamp(16px, 5vw, 32px)',
              overflow: 'hidden',
              background: selectedItem.isDefault ? selectedItem.gradientColor : '#000',
              backgroundImage: selectedItem.isDefault ? 'none' : `url(${(selectedItem as any).data})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              boxShadow: '0 30px 100px rgba(0, 0, 0, 0.7), 0 0 80px rgba(0, 212, 255, 0.3)',
              border: '3px solid rgba(0, 212, 255, 0.5)',
              animation: 'lightboxOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'auto',
              minHeight: 'clamp(300px, 70vh, 800px)',
              minWidth: 'clamp(300px, 70vw, 800px)',
            }}
          >
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,20,60,0.2) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Emoji for default */}
            {selectedItem.isDefault && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(80px, 25vw, 200px)',
                  animation: 'float 4s ease-in-out infinite',
                  zIndex: 2,
                }}
              >
                {selectedItem.emoji}
              </div>
            )}

            {/* Info bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(5, 13, 31, 0.98), transparent)',
                padding: 'clamp(20px, 4vw, 30px)',
                zIndex: 10,
              }}
            >
              <p
                style={{
                  color: '#00d4ff',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                }}
              >
                {selectedPhoto + 1} / {gallery.length}
              </p>
              {!selectedItem.isDefault && (
                <p
                  style={{
                    color: 'rgba(200, 230, 255, 0.9)',
                    fontSize: 'clamp(12px, 2.5vw, 16px)',
                    margin: 0,
                  }}
                >
                  {selectedItem.name}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: 'clamp(10px, 3vw, 20px)',
                right: 'clamp(10px, 3vw, 20px)',
                zIndex: 11,
                background: 'rgba(255, 100, 100, 0.15)',
                border: '2px solid rgba(255, 100, 100, 0.5)',
                color: '#ff6464',
                width: 'clamp(40px, 10vw, 50px)',
                height: 'clamp(40px, 10vw, 50px)',
                borderRadius: '50%',
                fontSize: 'clamp(18px, 4vw, 28px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 100, 100, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 100, 100, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 100, 100, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Close (ESC)"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 'clamp(30px, 5vw, 42px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.3s',
        }}
      >
        <p
          style={{
            color: 'rgba(0,212,255,0.65)',
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          🎬 Auto-rotating carousel • Click center card to expand • ← → keys or click sides to navigate ↓
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes lightboxOpen {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
