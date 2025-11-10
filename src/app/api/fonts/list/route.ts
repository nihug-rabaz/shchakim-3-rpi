import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const fontsDir = path.join(publicDir, 'fonts');
    const polinDir = path.join(fontsDir, 'Polin');

    const listDirSafe = async (dir: string) => {
      try { return (await fs.readdir(dir)).map((name) => ({ name, dir: path.relative(publicDir, dir) })); }
      catch { return []; }
    };

    const rootFonts = await listDirSafe(fontsDir);
    const polinFonts = await listDirSafe(polinDir);

    const files = [...rootFonts, ...polinFonts]
      .filter((f) => /\.(ttf|otf|woff2?|TTF|OTF|WOFF2?|ttc)$/.test(f.name))
      .map((f) => ({
        name: f.name,
        path: `/${f.dir.replace(/\\/g, '/')}/${encodeURIComponent(f.name)}`.replace(/\/+/, '/'),
        lower: f.name.toLowerCase()
      }));

    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ files: [] });
  }
}


