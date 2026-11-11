import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

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

export default defineConfig({
  plugins: [react(), experiencePages()],
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
