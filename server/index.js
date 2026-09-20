import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth.js';
import complaintsRoutes from './complaints.js';
import { initDb, pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);

// System Health & Telemetry for DrainWatch
app.get('/api/system/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW() as current_time, COUNT(*) as user_count FROM users');
    return res.json({
      status: 'operational',
      system: 'DrainWatch Smart Infrastructure System',
      dbConnected: true,
      time: dbTest.rows[0].current_time,
      registeredUsers: parseInt(dbTest.rows[0].user_count, 10),
    });
  } catch (error) {
    console.error('Database Health Check Failed:', error.message);
    return res.status(500).json({
      status: 'degraded',
      dbConnected: false,
      error: error.message,
    });
  }
});

// Telemetry & Alerts Endpoint
app.get('/api/telemetry', async (req, res) => {
  try {
    const alertsRes = await pool.query('SELECT * FROM drainage_alerts ORDER BY id ASC');
    return res.json({
      success: true,
      alerts: alertsRes.rows,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🌊 DrainWatch Backend Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
