import { del, list, put } from '@vercel/blob';

type FileType = 'photo' | 'music';

function getTypeFromPathname(pathname: string): FileType {
  return pathname.startsWith('music/') ? 'music' : 'photo';
}

function toStoredFile(blob: {
  pathname: string;
  url: string;
  uploadedAt?: Date;
}): {
  id: string;
  pathname: string;
  name: string;
  type: FileType;
  data: string;
  uploadedAt: number;
} {
  return {
    id: blob.pathname,
    pathname: blob.pathname,
    name: blob.pathname.split('/').pop() ?? blob.pathname,
    type: getTypeFromPathname(blob.pathname),
    data: blob.url,
    uploadedAt: blob.uploadedAt ? blob.uploadedAt.getTime() : Date.now(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const photoResults = await list({ prefix: 'photos/', limit: 1000 });
  const musicResults = await list({ prefix: 'music/', limit: 1000 });

  const photos = photoResults.blobs.map(toStoredFile);
  const music = musicResults.blobs.map(toStoredFile);

  if (type === 'photo') {
    return Response.json(photos);
  }

  if (type === 'music') {
    return Response.json(music);
  }

  return Response.json({ photos, music });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!(file instanceof File)) {
      return new Response('Missing file', { status: 400 });
    }

    const fileType: FileType = type === 'music' ? 'music' : 'photo';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const pathname = `${fileType}s/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return Response.json(toStoredFile(blob));
  } catch (error) {
    console.error('POST /api/files failed', error);
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('url') ?? searchParams.get('pathname');

    if (!target) {
      return new Response('Missing url', { status: 400 });
    }

    await del(target);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/files failed', error);
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
