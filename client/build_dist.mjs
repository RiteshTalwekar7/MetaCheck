import { build } from './node_modules/vite/dist/node/index.js';
import react from './node_modules/@vitejs/plugin-react/dist/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Building MetaCheck Client with Vite (configFile: false)...');
  await build({
    root: __dirname,
    configFile: false,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, './dist'),
      emptyOutDir: true,
    },
  });
  console.log('--- Client production build completed successfully to client/dist/ ! ---');
}

run().catch(err => {
  console.error('Vite build error:', err);
  process.exit(1);
});

