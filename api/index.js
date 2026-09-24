import app from '../server/index.js';
import { ensureDbInitialized } from '../server/db.js';

export default async function handler(req, res) {
  try {
    await ensureDbInitialized();
  } catch (err) {
    console.warn('ℹ️ Serverless DB initialization note:', err.message);
  }
  return app(req, res);
}

