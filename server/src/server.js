import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedDefaultUsers } from './modules/auth/auth.service.js';

async function startServer() {
  console.log('--- Starting MetaCheck AI Server ---');
  await connectDB();
  await seedDefaultUsers();

  const app = createApp();
  const port = env.PORT || 5000;

  app.listen(port, () => {
    console.log(`[MetaCheck Server] Listening on http://localhost:${port}`);
    console.log(`[MetaCheck Server] Active Rule-Set: ${env.RULESET_VERSION}`);
    console.log(`[MetaCheck Server] AI Provider: ${env.AI_PROVIDER.toUpperCase()}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

