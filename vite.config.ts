import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

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
 * from .env.local (ANTHROPIC_API_KEY=…). Other /api routes are left to Vercel.
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
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ['ANTHROPIC_', 'CHAT_']));
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
  plugins: [react(), experiencePages(), chatApi()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          EXPERIENCE_PAGES.map((id) => [`experience-${id}`, resolve(__dirname, `.${experiencePath(id)}/index.html`)]),
        ),
      },
    },
  },
});
