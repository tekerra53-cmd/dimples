import { useState } from 'react';
import { fileManager, StoredFile } from '../utils/fileManager';

interface Props {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: Props) {
  const [photos, setPhotos] = useState<StoredFile[]>(fileManager.getPhotos());
  const [pinnedId, setPinnedId] = useState<string | null>(fileManager.getPinnedPhotoId());
  const [music, setMusic] = useState<StoredFile[]>(fileManager.getMusic());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      await fileManager.addFile(file, 'photo');
      setPhotos(fileManager.getPhotos());
      setMessage(`✅ Photo uploaded: ${file.name}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Failed to upload photo');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side size check to avoid localStorage quota failures
    const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_AUDIO_BYTES) {
      setMessage('❌ File too large. Please upload audio under 5 MB.');
      setTimeout(() => setMessage(''), 4000);
      e.target.value = '';
      return;
    }

    setUploadingMusic(true);
    try {
      await fileManager.addFile(file, 'music');
      setMusic(fileManager.getMusic());
      setMessage(`✅ Music uploaded: ${file.name}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Music upload failed', err);
      const msg = err?.message || String(err) || 'Failed to upload music';
      setMessage(`❌ ${msg}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploadingMusic(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = (id: string) => {
    fileManager.deleteFile(id);
    setPhotos(fileManager.getPhotos());
    if (pinnedId === id) {
      fileManager.setPinnedPhotoId(null);
      setPinnedId(null);
    }
  };

  const handlePinPhoto = (id: string) => {
    fileManager.setPinnedPhotoId(id);
    setPinnedId(id);
    setMessage('📌 Photo pinned to card');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleUnpinPhoto = () => {
    fileManager.setPinnedPhotoId(null);
    setPinnedId(null);
    setMessage('📌 Photo unpinned');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDeleteMusic = (id: string) => {
    fileManager.deleteFile(id);
    setMusic(fileManager.getMusic());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #050d1f 0%, #0a1635 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(5, 13, 31, 0.95)',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              color: '#00d4ff',
              textShadow: '0 0 20px rgba(0,212,255,0.5)',
              margin: 0,
            }}
          >
            ✨ Admin Panel
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onExit}
              style={{
                background: 'rgba(100, 150, 255, 0.1)',
                border: '1px solid rgba(100, 150, 255, 0.5)',
                color: '#8dd0ff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(100, 150, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(100, 150, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(100, 150, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Back to experience"
            >
              ←
            </button>
            <button
              onClick={() => {
                if (confirm('This will return to the lock screen. Are you sure?')) {
                  window.location.reload();
                }
              }}
              style={{
                background: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid rgba(255, 100, 100, 0.5)',
                color: '#ff6464',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 100, 100, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Logout"
            >
              🔓
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              color: '#00d4ff',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'fadeInUp 0.3s ease',
            }}
          >
            {message}
          </div>
        )}

        {/* Photos Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              color: '#00d4ff',
              fontSize: '1.3rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📸 Upload Photos ({photos.length}/50)
          </h2>
          <p style={{ color: 'rgba(200, 230, 255, 0.7)', fontSize: '0.9rem', marginBottom: '12px' }}>
            Upload photos of her. Older photos are removed when the limit (50) is reached.
          </p>

          <label
            style={{
              display: 'block',
              padding: '20px',
              background: 'rgba(0, 212, 255, 0.05)',
              border: '2px dashed rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              marginBottom: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto || photos.length >= 50}
              style={{ display: 'none' }}
            />
            <div style={{ color: uploadingPhoto ? '#ffcc00' : '#00d4ff', fontWeight: '600' }}>
              {uploadingPhoto ? '⏳ Uploading...' : '+ Click to add photo'}
            </div>
          </label>

          {/* Photos List */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={photo.data} alt={photo.name} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      <div>
                        <div style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: '600' }}>📷 {photo.name}</div>
                      </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      {pinnedId === photo.id ? (
                        <button
                          onClick={handleUnpinPhoto}
                          style={{
                            background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.3)',
                            color: '#00d4ff',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Unpin
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePinPhoto(photo.id)}
                          style={{
                            background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.2)',
                            color: '#00d4ff',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Pin
                        </button>
                      )}

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        style={{
                          background: 'rgba(255, 100, 100, 0.1)',
                          border: '1px solid rgba(255, 100, 100, 0.5)',
                          color: '#ff6464',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Music Section */}
        <div>
          <h2
            style={{
              color: '#00d4ff',
              fontSize: '1.3rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎵 Upload Music ({music.length}/1)
          </h2>
          <p style={{ color: 'rgba(200, 230, 255, 0.7)', fontSize: '0.9rem', marginBottom: '12px' }}>
            Upload background music for the experience. Max 1 song stored.
          </p>

          <label
            style={{
              display: 'block',
              padding: '20px',
              background: 'rgba(0, 212, 255, 0.05)',
              border: '2px dashed rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              marginBottom: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            }}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              disabled={uploadingMusic || music.length >= 1}
              style={{ display: 'none' }}
            />
            <div style={{ color: uploadingMusic ? '#ffcc00' : '#00d4ff', fontWeight: '600' }}>
              {uploadingMusic ? '⏳ Uploading...' : '+ Click to add music'}
            </div>
          </label>

          {/* Music List */}
          {music.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {music.map((song) => (
                <div
                  key={song.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: '600' }}>🎵 {song.name}</div>
                    <div style={{ color: 'rgba(200, 230, 255, 0.5)', fontSize: '0.8rem' }}>
                      {new Date(song.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMusic(song.id)}
                    style={{
                      background: 'rgba(255, 100, 100, 0.1)',
                      border: '1px solid rgba(255, 100, 100, 0.5)',
                      color: '#ff6464',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={onExit}
          style={{
            width: '100%',
            marginTop: '32px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #0055ee, #00aaff)',
            border: 'none',
            color: 'white',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,102,255,0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,102,255,0.6)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,102,255,0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Experience
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
