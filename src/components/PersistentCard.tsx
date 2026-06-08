import { useEffect, useState } from 'react';
import { fileManager, StoredFile } from '../utils/fileManager';

export default function PersistentCard() {
  const [photos, setPhotos] = useState<StoredFile[]>([]);
  const [photo, setPhoto] = useState<StoredFile | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [userSelected, setUserSelected] = useState<number | null>(null);

  useEffect(() => {
    const update = async () => {
      await fileManager.refresh();
      const ps = fileManager.getPhotos();
      setPhotos(ps);
      setPinnedId(fileManager.getPinnedPhotoId());
      if (fileManager.getPinnedPhotoId()) {
        const pinned = ps.find(p => p.id === fileManager.getPinnedPhotoId()) || null;
        setPhoto(pinned);
      }
    };

    void update();
    const id = setInterval(() => {
      // advance index only if no pinned photo and user hasn't selected
      if (!fileManager.getPinnedPhotoId() && userSelected === null) {
        setIndex(i => i + 1);
      }
      void update();
    }, 4000);
    return () => clearInterval(id);
  }, [userSelected]);

  // keep photo updated when index or userSelected changes
  useEffect(() => {
    const ps = fileManager.getPhotos();
    const pinned = fileManager.getPinnedPhotoId();
    if (pinned) {
      const found = ps.find(p => p.id === pinned) || null;
      setPhoto(found);
      return;
    }
    if (userSelected !== null) {
      setPhoto(ps[userSelected] || null);
      // clear user selection after 8 seconds
      const t = setTimeout(() => setUserSelected(null), 8000);
      return () => clearTimeout(t);
    }
    setPhoto(ps.length ? ps[index % ps.length] : null);
  }, [index, userSelected, photos]);

  return (
    <section className="w-full flex justify-center items-center my-12">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-0.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes glow {
          0% { box-shadow: 0 6px 18px rgba(255,80,120,0.06); }
          50% { box-shadow: 0 20px 40px rgba(255,80,120,0.12); }
          100% { box-shadow: 0 6px 18px rgba(255,80,120,0.06); }
        }
        .persistent-card-outer {
          width: 340px;
          max-width: 90%;
          transition: transform 0.35s ease, opacity 0.35s ease;
          animation: floatY 6s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .persistent-card-inner {
          border-radius: 16px;
          overflow: hidden;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.75));
          animation: glow 6s ease-in-out infinite;
        }
        .persistent-card-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform-origin: center center;
          transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }
        .persistent-card-outer:hover { transform: translateY(-6px) scale(1.02); }
        .persistent-card-outer:active { transform: translateY(-2px) scale(1.01); }
      `}</style>

      <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-2xl p-1 shadow-xl persistent-card-outer">
        <div className="persistent-card-inner">
          {photo ? (
            <img src={photo.data} alt="her picture" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6" style={{ color: '#ffdbe6' }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>💙</div>
              <h3 style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>Her picture will stay here</h3>
              <p style={{ marginTop: 8, opacity: 0.8 }}>Ask the admin to upload a photo to make it appear.</p>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setUserSelected(i)}
                style={{
                  border: p.id === pinnedId ? '2px solid #00d4ff' : '1px solid rgba(255,255,255,0.06)',
                  padding: 2,
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img src={p.data} alt={p.name} style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
