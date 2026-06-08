const CACHE_KEY = 'romantic-proposal-files-cache';

export interface StoredFile {
  id: string;
  pathname: string;
  name: string;
  type: 'photo' | 'music';
  data: string;
  uploadedAt: number;
}

type RemotePayload =
  | { photos?: StoredFile[]; music?: StoredFile[] }
  | StoredFile[];

let cache: StoredFile[] = loadCachedFiles();

function loadCachedFiles(): StoredFile[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredFile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
}

function normalizeFile(file: Partial<StoredFile> & {
  pathname?: string;
  url?: string;
  uploadedAt?: number | string | Date;
}): StoredFile {
  const pathname = file.pathname || file.id || file.url || `files/${Date.now()}`;
  const type = pathname.startsWith('music/') ? 'music' : 'photo';

  return {
    id: file.id || pathname,
    pathname,
    name: file.name || pathname.split('/').pop() || 'file',
    type: file.type || type,
    data: file.data || file.url || '',
    uploadedAt:
      file.uploadedAt instanceof Date
        ? file.uploadedAt.getTime()
        : typeof file.uploadedAt === 'string'
          ? Date.parse(file.uploadedAt)
          : file.uploadedAt || Date.now(),
  };
}

function setCache(files: StoredFile[]) {
  cache = files;
  persistCache();
}

async function readRemoteFiles(): Promise<StoredFile[]> {
  const response = await fetch('/api/files');
  if (!response.ok) {
    throw new Error(`Failed to load files (${response.status})`);
  }

  const payload = (await response.json()) as RemotePayload;
  const files = Array.isArray(payload)
    ? payload
    : [...(payload.photos || []), ...(payload.music || [])];

  return files.map(normalizeFile);
}

async function uploadRemoteFile(file: File, type: 'photo' | 'music') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  return normalizeFile((await response.json()) as StoredFile);
}

async function deleteRemoteFile(pathname: string) {
  const response = await fetch(`/api/files?pathname=${encodeURIComponent(pathname)}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed (${response.status})`);
  }
}

export const fileManager = {
  async refresh(): Promise<StoredFile[]> {
    try {
      const files = await readRemoteFiles();
      setCache(files);
      return files;
    } catch {
      cache = loadCachedFiles();
      return cache;
    }
  },

  getAll(): StoredFile[] {
    return cache;
  },

  getPhotos(): StoredFile[] {
    return cache.filter((file) => file.type === 'photo');
  },

  getMusic(): StoredFile[] {
    return cache.filter((file) => file.type === 'music');
  },

  async addFile(file: File, type: 'photo' | 'music'): Promise<StoredFile> {
    const uploaded = await uploadRemoteFile(file, type);
    setCache([...cache.filter((item) => item.id !== uploaded.id), uploaded]);
    return uploaded;
  },

  async deleteFile(idOrPath: string): Promise<void> {
    const item = cache.find(
      (file) => file.id === idOrPath || file.pathname === idOrPath || file.data === idOrPath,
    );
    const pathname = item?.pathname || idOrPath;

    await deleteRemoteFile(pathname);
    setCache(cache.filter((file) => file.pathname !== pathname && file.id !== pathname));
  },

  clear() {
    cache = [];
    persistCache();
  },

  getPinnedPhotoId(): string | null {
    try {
      return localStorage.getItem(CACHE_KEY + ':pinned') || null;
    } catch {
      return null;
    }
  },

  setPinnedPhotoId(id: string | null) {
    try {
      if (id === null) localStorage.removeItem(CACHE_KEY + ':pinned');
      else localStorage.setItem(CACHE_KEY + ':pinned', id);
    } catch {
      // ignore
    }
  },
};
