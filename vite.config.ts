import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { basename, join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

/**
 * Photos, smaller (build only): every JPG and PNG imported from src/assets ships as WebP,
 * at most 2400px wide (photos at quality 78; PNGs near-lossless, keeping transparency and
 * crisp line art), unless that wouldn't save at least 5%. The source files are untouched.
 * Results are cached in node_modules/.cache, so only new or changed images are re-encoded.
 */
function optimizeImages(): Plugin {
  const MAX_WIDTH = 2400;
  const cacheDir = resolve(__dirname, 'node_modules/.cache/optimized-images');
  let saved = 0;
  let count = 0;
  return {
    name: 'optimize-images',
    apply: 'build',
    enforce: 'pre',
    async load(id) {
      const [file, query] = id.split('?');
      if (query || !/\/src\/assets\/.+\.(jpe?g|png)$/i.test(file)) return null;
      const source = readFileSync(file);
      const isPng = /\.png$/i.test(file);
      const key = createHash('sha1').update(source).update(`webp-v1-${MAX_WIDTH}`).digest('hex').slice(0, 20);
      mkdirSync(cacheDir, { recursive: true });
      const cachedWebp = join(cacheDir, `${key}.webp`);
      const keepMarker = join(cacheDir, `${key}.keep`);
      let out: Buffer | null = null;
      if (existsSync(cachedWebp)) out = readFileSync(cachedWebp);
      else if (!existsSync(keepMarker)) {
        const { default: sharp } = await import('sharp');
        const image = sharp(source, { failOn: 'none' }).rotate();
        const { width = 0 } = await image.metadata();
        const sized = width > MAX_WIDTH ? image.resize({ width: MAX_WIDTH }) : image;
        const webp = await sized
          .webp(isPng ? { nearLossless: true, quality: 80, effort: 5 } : { quality: 78, effort: 5 })
          .toBuffer();
        if (webp.length < source.length * 0.95) {
          writeFileSync(cachedWebp, webp);
          out = webp;
        } else writeFileSync(keepMarker, '');
      }
      const name = out ? basename(file).replace(/\.(jpe?g|png)$/i, '.webp') : basename(file);
      if (out) {
        saved += source.length - out.length;
        count += 1;
      }
      const ref = this.emitFile({ type: 'asset', name, source: out ?? source });
      return `export default import.meta.ROLLUP_FILE_URL_${ref};`;
    },
    buildEnd() {
      if (count) this.info(`optimize-images: ${count} images as WebP, ${(saved / 1048576).toFixed(1)} MB saved`);
    },
  };
}

/**
 * Property experience pages: hand-built pages that live beside the React app and are
 * served at /locations/<property>/experience. Each is its own HTML entry (so Vite adds
 * the shared site nav to it); its images, films and scripts sit under public/ at the
 * same address. Add a property here when its experience page exists.
 */
const EXPERIENCE_PAGES = ['macquarie-park'];
const experiencePath = (id: string) => `/locations/${id}/experience`;

/** Locally, open an experience page without the trailing slash, as Vercel serves it. */
function experiencePages(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const [path, query = ''] = (req.url ?? '').split('?');
    if (EXPERIENCE_PAGES.some((id) => path === experiencePath(id))) {
      req.url = `${path}/index.html${query ? `?${query}` : ''}`;
    }
    next();
  };
  return {
    name: 'experience-pages',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

/**
 * Locally, /api/chat runs the same function Vercel serves (api/chat.ts), with the key read
 * from .env.local (GEMINI_API_KEY=…). Other /api routes are left to Vercel.
 *
 * Dev only: /api/dev/catalog rewrites knowledge/rooms.md (the rooms, terms and prices the
 * assistant is told about) from this site's own room data and rebundles the knowledge base.
 * After changing rooms or prices, with `npm run dev` running, run in the browser console:
 *   fetch('/api/dev/catalog', { method: 'POST', body: (await import('/src/lib/chatCatalog.ts')).catalogMarkdown() })
 */
function chatApi(): Plugin {
  return {
    name: 'chat-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ['GEMINI_', 'CHAT_']));
      server.middlewares.use('/api/dev/catalog', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const text = Buffer.concat(chunks).toString('utf8');
        if (req.method !== 'POST' || !text.startsWith('# Booking catalogue')) return void res.writeHead(400).end();
        writeFileSync(resolve(__dirname, 'knowledge/rooms.md'), text);
        execFileSync(process.execPath, [resolve(__dirname, 'tools/build-knowledge.mjs')]);
        res.end('ok');
      });
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const { POST } = (await server.ssrLoadModule('/api/chat.ts')) as { POST: (r: Request) => Promise<Response> };
          const response = await POST(
            new Request('http://localhost/api/chat', { method: req.method, headers: { 'Content-Type': 'application/json' }, body: Buffer.concat(chunks) }),
          );
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          if (response.body) for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
          res.end();
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { code: 'upstream', message: 'Something went wrong on our side. Please try again.' } }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [optimizeImages(), react(), experiencePages(), chatApi()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          EXPERIENCE_PAGES.map((id) => [`experience-${id}`, resolve(__dirname, `.${experiencePath(id)}/index.html`)]),
        ),
      },
      output: {
        // Big libraries in chunks of their own, so they load only with the parts that use them
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl') || id.includes('node_modules/@maplibre')) return 'maplibre';
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
});
