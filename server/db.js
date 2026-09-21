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

    // Create complaints table for risk scoring & ranking
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        complaint_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        zone_criticality VARCHAR(50) DEFAULT 'Residential',
        reported_by VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        water_level_pct INTEGER DEFAULT 50,
        risk_score INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending Inspection',
        sla_hours_remaining INTEGER DEFAULT 24,
        description TEXT,
        photo_url TEXT,
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure complaints table has photo_url, latitude, longitude columns if it already exists
    await client.query(`
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
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

    // Seed initial complaints if empty
    const complaintCountRes = await client.query('SELECT COUNT(*) FROM complaints');
    if (parseInt(complaintCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO complaints (complaint_id, title, category, location, zone_criticality, reported_by, contact_phone, water_level_pct, risk_score, status, sla_hours_remaining, description)
        VALUES 
          ('DW-CMP-801', 'Severe Sump Inundation & Culvert Collapse', 'Culvert Collapse', 'Metro Hospital Emergency Access Corridor', 'Critical Health Zone', 'Dr. Alistair Vance', '9876543210', 95, 96, 'Critical Dispatch', 2, 'Main culvert collapsed under acute storm surge. Flood water rising 0.5m near ICU emergency ambulance bay.'),
          ('DW-CMP-792', 'Hazardous Industrial Chemical Runoff & Choked Siphon', 'Toxic Sludge & Overflow', 'Industrial Export Park Outfall #4', 'Dense Commercial', 'Insp. Sarah Connor', '9812345678', 88, 87, 'Critical Dispatch', 4, 'High turbidity chemical foam overflow choking municipal siphon valve. Immediate spill containment team required.'),
          ('DW-CMP-764', 'Stormwater Backflow Submerging Subway Underpass', 'Sump Overflow', 'Central Metro Terminal Station Underpass', 'High Traffic Transit', 'Eng. Rajiv Nair', '9876123450', 78, 79, 'In Progress', 8, 'Subway passenger access tunnel waterlogging causing heavy commuter disruption. Dual sump pumps operating at max capacity.'),
          ('DW-CMP-750', 'Heavy Silt & Plastic Waste Clogging Arterial Drain', 'Severe Blockage', 'Market Square Main Commercial Boulevard', 'Dense Commercial', 'Citizen Priya Sharma', '9822334455', 68, 68, 'In Progress', 12, 'Heavy silt and discarded commercial plastic bags obstructing arterial canal #3 during monsoon prep.'),
          ('DW-CMP-732', 'Dislodged Cast-Iron Manhole Cover with High Inflow', 'Open Manhole Hazard', 'Oakridge Elementary School Crossing', 'School Safety Zone', 'Principal Elena Rostova', '9833445566', 45, 62, 'Under Review', 14, 'Manhole lid displaced by heavy road vibrations. Extreme pedestrian hazard for school children.'),
          ('DW-CMP-715', 'Slow Drainage Discharge & Debris Accumulation', 'Siltation', 'Green Valley Residential Sector 7', 'Residential', 'Resident Arthur Pendelton', '9844556677', 52, 48, 'Pending Inspection', 24, 'Household wastewater backflow in secondary street gully. Requires municipal suction excavator.'),
          ('DW-CMP-702', 'Minor Trash Grate Obstruction After Rain', 'Trash Grate Clog', 'Civic Park Outer Periphery Path', 'Public Park', 'Ranger Thomas Bell', '9855667788', 25, 28, 'Resolved', 0, 'Leaves and twigs collected on surface storm grate. Cleared by morning civic maintenance patrol.');
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
