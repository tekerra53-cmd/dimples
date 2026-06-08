// File storage manager using localStorage

const STORAGE_KEY = 'romantic-proposal-files';

export interface StoredFile {
  id: string;
  name: string;
  type: 'photo' | 'music';
  data: string; // base64
  uploadedAt: number;
}

export const fileManager = {
  getAll: (): StoredFile[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getPhotos: (): StoredFile[] => {
    return fileManager.getAll().filter(f => f.type === 'photo');
  },

  getMusic: (): StoredFile[] => {
    return fileManager.getAll().filter(f => f.type === 'music');
  },

  addFile: (file: File, type: 'photo' | 'music') => {
    return new Promise<StoredFile>((resolve, reject) => {
      try {
        const id = Date.now().toString();
        const storedFile: StoredFile = {
          id,
          name: file.name,
          type,
          data: '',
          uploadedAt: Date.now(),
        };

        const files = fileManager.getAll();
        const typeFiles = files.filter(f => f.type === type);

        if (type === 'photo') {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const base64 = e.target?.result as string;
              storedFile.data = base64;

              // enforce photo limit
              if (typeFiles.length >= 50) {
                // remove oldest photo
                const firstPhotoIndex = files.findIndex(f => f.type === 'photo');
                if (firstPhotoIndex !== -1) files.splice(firstPhotoIndex, 1);
              }

              files.push(storedFile);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
              resolve(storedFile);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        } else {
          // music: store blob in IndexedDB and store metadata in localStorage to avoid quota issues
          storedFile.data = '__idb__:' + id;

          // keep the latest 2 music files
          if (typeFiles.length >= 2) {
            const oldestMusicIndex = files.findIndex(f => f.type === 'music');
            if (oldestMusicIndex !== -1) files.splice(oldestMusicIndex, 1);
          }
          files.push(storedFile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

          // store blob in IndexedDB
          const putBlob = (blob: Blob) => {
            const req = indexedDB.open('romantic-proposal-db', 1);
            req.onupgradeneeded = () => {
              const db = req.result;
              if (!db.objectStoreNames.contains('music')) db.createObjectStore('music');
            };
            req.onsuccess = () => {
              const db = req.result;
              const tx = db.transaction('music', 'readwrite');
              tx.objectStore('music').put(blob, id);
              tx.oncomplete = () => {
                resolve(storedFile);
                db.close();
              };
              tx.onerror = () => {
                reject(tx.error);
                db.close();
              };
            };
            req.onerror = () => reject(req.error);
          };

          // file is already a Blob
          putBlob(file);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  deleteFile: (id: string) => {
    const files = fileManager.getAll().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
  // Pinned photo id helpers
  getPinnedPhotoId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY + ':pinned') || null;
    } catch {
      return null;
    }
  },
  setPinnedPhotoId: (id: string | null) => {
    try {
      if (id === null) localStorage.removeItem(STORAGE_KEY + ':pinned');
      else localStorage.setItem(STORAGE_KEY + ':pinned', id);
    } catch {
      // ignore
    }
  },
  // IndexedDB helpers for music
  async getMusicBlobUrl(id: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open('romantic-proposal-db', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('music')) db.createObjectStore('music');
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('music', 'readonly');
          const getReq = tx.objectStore('music').get(id as any);
          getReq.onsuccess = () => {
            const blob = getReq.result as Blob | undefined | null;
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              resolve(null);
            }
            db.close();
          };
          getReq.onerror = () => {
            resolve(null);
            db.close();
          };
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },
};
