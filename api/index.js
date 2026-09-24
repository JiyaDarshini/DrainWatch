import app from '../server/index.js';
import { initDb } from '../server/db.js';

// Asynchronously initialize database in background on lambda start
initDb().catch((err) => {
  console.log('ℹ️ Serverless background db check:', err.message);
});

export default app;
