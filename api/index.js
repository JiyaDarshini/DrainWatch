import app from '../server/index.js';
import { initDb } from '../server/db.js';

let isDbInitialized = false;

export default async function handler(req, res) {
  if (!isDbInitialized) {
    try {
      await initDb();
    } catch (err) {
      console.warn('⚠️ Serverless DB initialization deferred:', err.message);
    }
    isDbInitialized = true;
  }
  return app(req, res);
}
