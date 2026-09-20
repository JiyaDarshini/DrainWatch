import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL cloud connection
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('⚡ Connected to Neon PostgreSQL database successfully!');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Citizen',
        is_phone_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create OTP codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create drainage sensor telemetry table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drainage_alerts (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        water_level_pct INTEGER NOT NULL,
        flow_rate_m3s NUMERIC(5,2) DEFAULT 4.20,
        status VARCHAR(50) DEFAULT 'Normal',
        reported_by VARCHAR(255) DEFAULT 'IoT Sensor Array #7',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed mock telemetry if empty
    const alertCountRes = await client.query('SELECT COUNT(*) FROM drainage_alerts');
    if (parseInt(alertCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO drainage_alerts (location, water_level_pct, flow_rate_m3s, status, reported_by)
        VALUES 
          ('Sector 4 - Central Sump Basin', 42, 6.8, 'Normal', 'FlowSensor-4A'),
          ('North Canal Arterial Drain #12', 88, 14.5, 'Critical High', 'SonarNode-12N'),
          ('Industrial Zone Outfall #3', 64, 8.1, 'Moderate', 'IoT-Turbidity-03'),
          ('Downtown Metro Underground Culvert', 29, 3.4, 'Optimal', 'SensorNet-DT09');
      `);
    }

    console.log('✅ Database tables initialized and verified.');
  } catch (err) {
    console.error('❌ Error initializing database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}
