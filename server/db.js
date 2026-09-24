import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Live PostgreSQL Pool
const rawPool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Quick timeout before falling back
});

// In-Memory Resilient Fallback Database
export const memoryDb = {
  users: [],
  otp_codes: [],
  drainage_alerts: [
    { id: 1, location: 'Sector 4 - Central Sump Basin', water_level_pct: 42, flow_rate_m3s: 6.8, status: 'Normal', reported_by: 'FlowSensor-4A', created_at: new Date() },
    { id: 2, location: 'North Canal Arterial Drain #12', water_level_pct: 88, flow_rate_m3s: 14.5, status: 'Critical High', reported_by: 'SonarNode-12N', created_at: new Date() },
    { id: 3, location: 'Industrial Zone Outfall #3', water_level_pct: 64, flow_rate_m3s: 8.1, status: 'Moderate', reported_by: 'IoT-Turbidity-03', created_at: new Date() },
    { id: 4, location: 'Downtown Metro Underground Culvert', water_level_pct: 29, flow_rate_m3s: 3.4, status: 'Optimal', reported_by: 'SensorNet-DT09', created_at: new Date() },
  ],
  complaints: [
    {
      id: 1,
      complaint_id: 'DW-CMP-801',
      title: 'Severe Sump Inundation & Culvert Collapse',
      category: 'Culvert Collapse',
      location: 'Metro Hospital Emergency Access Corridor',
      zone_criticality: 'Critical Health Zone',
      reported_by: 'Dr. Alistair Vance',
      contact_phone: '9876543210',
      user_id: 101,
      user_email: 'alistair@cityhospital.org',
      water_level_pct: 95,
      risk_score: 96,
      status: 'Critical Dispatch',
      sla_hours_remaining: 2,
      description: 'Main culvert collapsed under acute storm surge. Flood water rising 0.5m near ICU emergency ambulance bay.',
      photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0827,
      longitude: 80.2707,
      created_at: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      complaint_id: 'DW-CMP-792',
      title: 'Hazardous Industrial Chemical Runoff & Choked Siphon',
      category: 'Toxic Sludge & Overflow',
      location: 'Industrial Export Park Outfall #4',
      zone_criticality: 'Dense Commercial',
      reported_by: 'Insp. Sarah Connor',
      contact_phone: '9812345678',
      user_id: 102,
      user_email: 'sarah@drainwatch.gov',
      water_level_pct: 88,
      risk_score: 87,
      status: 'Critical Dispatch',
      sla_hours_remaining: 4,
      description: 'High turbidity chemical foam overflow choking municipal siphon valve. Immediate spill containment team required.',
      photo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0878,
      longitude: 80.2785,
      created_at: new Date(Date.now() - 7200000),
    },
    {
      id: 3,
      complaint_id: 'DW-CMP-764',
      title: 'Stormwater Backflow Submerging Subway Underpass',
      category: 'Sump Overflow',
      location: 'Central Metro Terminal Station Underpass',
      zone_criticality: 'High Traffic Transit',
      reported_by: 'Eng. Rajiv Nair',
      contact_phone: '9876123450',
      user_id: 103,
      user_email: 'rajiv@metrotransit.org',
      water_level_pct: 78,
      risk_score: 79,
      status: 'In Progress',
      sla_hours_remaining: 8,
      description: 'Subway passenger access tunnel waterlogging causing heavy commuter disruption. Dual sump pumps operating at max capacity.',
      photo_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0780,
      longitude: 80.2650,
      created_at: new Date(Date.now() - 14400000),
    },
    {
      id: 4,
      complaint_id: 'DW-CMP-750',
      title: 'Heavy Silt & Plastic Waste Clogging Arterial Drain',
      category: 'Severe Blockage',
      location: 'Market Square Main Commercial Boulevard',
      zone_criticality: 'Dense Commercial',
      reported_by: 'Citizen Priya Sharma',
      contact_phone: '9822334455',
      user_id: 104,
      user_email: 'priya.sharma@example.com',
      water_level_pct: 68,
      risk_score: 68,
      status: 'In Progress',
      sla_hours_remaining: 12,
      description: 'Heavy silt and discarded commercial plastic bags obstructing arterial canal #3 during monsoon prep.',
      photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0720,
      longitude: 80.2550,
      created_at: new Date(Date.now() - 28800000),
    },
    {
      id: 5,
      complaint_id: 'DW-CMP-732',
      title: 'Dislodged Cast-Iron Manhole Cover with High Inflow',
      category: 'Open Manhole Hazard',
      location: 'Oakridge Elementary School Crossing',
      zone_criticality: 'School Safety Zone',
      reported_by: 'Principal Elena Rostova',
      contact_phone: '9833445566',
      user_id: 105,
      user_email: 'elena@oakridgeschool.edu',
      water_level_pct: 45,
      risk_score: 62,
      status: 'Under Review',
      sla_hours_remaining: 14,
      description: 'Manhole lid displaced by heavy road vibrations. Extreme pedestrian hazard for school children.',
      photo_url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0910,
      longitude: 80.2450,
      created_at: new Date(Date.now() - 43200000),
    },
    {
      id: 6,
      complaint_id: 'DW-CMP-715',
      title: 'Slow Drainage Discharge & Debris Accumulation',
      category: 'Siltation',
      location: 'Green Valley Residential Sector 7',
      zone_criticality: 'Residential',
      reported_by: 'Resident Arthur Pendelton',
      contact_phone: '9844556677',
      user_id: 106,
      user_email: 'arthur@greenvalley.org',
      water_level_pct: 52,
      risk_score: 48,
      status: 'Pending Inspection',
      sla_hours_remaining: 24,
      description: 'Household wastewater backflow in secondary street gully. Requires municipal suction excavator.',
      photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0650,
      longitude: 80.2350,
      created_at: new Date(Date.now() - 86400000),
    },
    {
      id: 7,
      complaint_id: 'DW-CMP-702',
      title: 'Minor Trash Grate Obstruction After Rain',
      category: 'Trash Grate Clog',
      location: 'Civic Park Outer Periphery Path',
      zone_criticality: 'Public Park',
      reported_by: 'Ranger Thomas Bell',
      contact_phone: '9855667788',
      user_id: 107,
      user_email: 'thomas@civicparks.org',
      water_level_pct: 25,
      risk_score: 28,
      status: 'Resolved',
      sla_hours_remaining: 0,
      description: 'Leaves and twigs collected on surface storm grate. Cleared by morning civic maintenance patrol.',
      photo_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      latitude: 13.0550,
      longitude: 80.2250,
      created_at: new Date(Date.now() - 172800000),
    },
  ],
};

// Seed default users in memory
function seedDefaultUsers() {
  const defaultPassHash = bcrypt.hashSync('drainwatch123', 10);
  memoryDb.users = [
    {
      id: 1,
      full_name: 'Municipal Officer',
      email: 'admin@drainwatch.city',
      phone: '9876543210',
      password_hash: defaultPassHash,
      role: 'Municipal Officer',
      is_phone_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      full_name: 'Jiya Darshini',
      email: 'citizen@drainwatch.city',
      phone: '9812345678',
      password_hash: defaultPassHash,
      role: 'Citizen',
      is_phone_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      full_name: 'Drainage Engineer',
      email: 'engineer@drainwatch.city',
      phone: '9876123450',
      password_hash: defaultPassHash,
      role: 'Drainage Engineer',
      is_phone_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      full_name: 'Field Inspector',
      email: 'inspector@drainwatch.city',
      phone: '9822334455',
      password_hash: defaultPassHash,
      role: 'Field Inspector',
      is_phone_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}
seedDefaultUsers();

let isNeonConnected = false;

// Safe In-Memory Query Engine Fallback
function executeMemoryQuery(text, params = []) {
  const sql = text.trim();
  const lower = sql.toLowerCase().replace(/\s+/g, ' ');

  // 1. SELECT NOW(), COUNT(*) FROM users
  if (lower.includes('from users') && lower.includes('count(*)')) {
    return {
      rows: [{ current_time: new Date(), user_count: memoryDb.users.length.toString() }],
      rowCount: 1,
    };
  }

  // 2. User lookup by ID (e.g. /api/auth/me) -> MUST CHECK BEFORE generic email/phone check!
  if (lower.includes('from users') && (lower.includes('where id =') || lower.includes('where id=$'))) {
    const id = parseInt(params[0], 10);
    const match = memoryDb.users.filter(u => u.id === id);
    return { 
      rows: match.map(u => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_phone_verified: u.is_phone_verified,
        created_at: u.created_at || new Date()
      })), 
      rowCount: match.length 
    };
  }

  // 3. User lookup by identifier (email or phone)
  if (lower.includes('from users') && (lower.includes('where lower(email)') || lower.includes('where email') || lower.includes('where phone'))) {
    const p1 = (params[0] || '').toString().toLowerCase().trim();
    const p2 = params[1] ? params[1].toString().toLowerCase().trim() : p1;
    const match = memoryDb.users.filter(u => 
      u.email.toLowerCase() === p1 || 
      u.phone === p1 || 
      u.email.toLowerCase() === p2 || 
      u.phone === p2
    );
    return { 
      rows: match.map(u => ({ ...u })), 
      rowCount: match.length 
    };
  }

  // 4. INSERT into users
  if (lower.startsWith('insert into users')) {
    const [full_name, email, phone, password_hash, role, is_phone_verified] = params;
    const newId = memoryDb.users.length > 0 ? Math.max(...memoryDb.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      full_name,
      email,
      phone,
      password_hash,
      role: role || 'Citizen',
      is_phone_verified: !!is_phone_verified,
      created_at: new Date(),
      updated_at: new Date(),
    };
    memoryDb.users.push(newUser);
    return { 
      rows: [{
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_phone_verified: newUser.is_phone_verified,
        created_at: newUser.created_at
      }], 
      rowCount: 1 
    };
  }

  // 5. UPDATE users (phone verification or password reset)
  if (lower.startsWith('update users')) {
    if (lower.includes('is_phone_verified')) {
      if (lower.includes('where id =')) {
        const id = parseInt(params[0], 10);
        const user = memoryDb.users.find(u => u.id === id);
        if (user) {
          user.is_phone_verified = true;
          user.updated_at = new Date();
        }
        return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
      } else {
        const cleanPhone = (params[0] || '').toString().trim().replace(/\s+/g, '');
        const user = memoryDb.users.find(u => u.phone.replace(/\s+/g, '') === cleanPhone);
        if (user) {
          user.is_phone_verified = true;
          user.updated_at = new Date();
        }
        return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
      }
    }
    if (lower.includes('password_hash = $1') || lower.includes('password_hash =')) {
      const [newHash, phone] = params;
      const cleanPhone = (phone || '').toString().trim().replace(/\s+/g, '');
      const user = memoryDb.users.find(u => u.phone.replace(/\s+/g, '') === cleanPhone);
      if (user) {
        user.password_hash = newHash;
        user.updated_at = new Date();
      }
      return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
    }
  }

  // 6. OTP Operations
  if (lower.startsWith('insert into otp_codes')) {
    const [phone, otp_code, expires_at] = params;
    const newOtp = {
      id: memoryDb.otp_codes.length + 1,
      phone: (phone || '').toString().trim().replace(/\s+/g, ''),
      otp_code: (otp_code || '').toString().trim(),
      expires_at: new Date(expires_at),
      is_used: false,
      created_at: new Date(),
    };
    memoryDb.otp_codes.push(newOtp);
    return { rows: [newOtp], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from otp_codes')) {
    const cleanPhone = (params[0] || '').toString().trim().replace(/\s+/g, '');
    const cleanOtp = (params[1] || '').toString().trim();
    const now = new Date();
    const match = memoryDb.otp_codes.filter(
      o => o.phone.replace(/\s+/g, '') === cleanPhone &&
           o.otp_code === cleanOtp &&
           !o.is_used &&
           new Date(o.expires_at) > now
    );
    match.sort((a, b) => b.id - a.id);
    return { rows: match, rowCount: match.length };
  }

  if (lower.startsWith('update otp_codes set is_used = true')) {
    if (params.length === 1 && typeof params[0] === 'number') {
      const id = params[0];
      const otp = memoryDb.otp_codes.find(o => o.id === id);
      if (otp) otp.is_used = true;
    } else {
      const cleanPhone = (params[0] || '').toString().trim().replace(/\s+/g, '');
      memoryDb.otp_codes.forEach(o => {
        if (o.phone.replace(/\s+/g, '') === cleanPhone) o.is_used = true;
      });
    }
    return { rows: [], rowCount: 1 };
  }

  // 7. Drainage Alerts
  if (lower.startsWith('select') && lower.includes('from drainage_alerts')) {
    return { rows: [...memoryDb.drainage_alerts], rowCount: memoryDb.drainage_alerts.length };
  }

  // 8. Complaints Analytics Queries
  if (lower.includes('from complaints') && lower.includes('avg(risk_score)')) {
    const total = memoryDb.complaints.length;
    const avgRisk = total > 0 ? memoryDb.complaints.reduce((acc, c) => acc + c.risk_score, 0) / total : 0;
    return { rows: [{ total: total.toString(), avg_risk: avgRisk.toFixed(2) }], rowCount: 1 };
  }

  if (lower.includes('from complaints') && (lower.includes('critical_count') || lower.includes('case when risk_score'))) {
    const critical = memoryDb.complaints.filter(c => c.risk_score >= 80).length;
    const high = memoryDb.complaints.filter(c => c.risk_score >= 60 && c.risk_score < 80).length;
    const moderate = memoryDb.complaints.filter(c => c.risk_score >= 40 && c.risk_score < 60).length;
    const low = memoryDb.complaints.filter(c => c.risk_score < 40).length;
    const resolved = memoryDb.complaints.filter(c => c.status === 'Resolved').length;
    const activeDispatches = memoryDb.complaints.filter(c => c.status === 'Critical Dispatch').length;
    return { 
      rows: [{ 
        critical_count: critical, 
        high_count: high, 
        medium_count: moderate, 
        low_count: low,
        resolved_count: resolved,
        active_dispatches: activeDispatches
      }], 
      rowCount: 1 
    };
  }

  if (lower.includes('from complaints') && lower.includes('group by zone_criticality')) {
    const zoneMap = {};
    memoryDb.complaints.forEach(c => {
      const z = c.zone_criticality || 'Residential';
      if (!zoneMap[z]) zoneMap[z] = { count: 0, totalRisk: 0 };
      zoneMap[z].count += 1;
      zoneMap[z].totalRisk += (c.risk_score || 50);
    });
    const rows = Object.entries(zoneMap).map(([zone, data]) => ({ 
      zone, 
      zone_criticality: zone,
      count: data.count.toString(),
      avg_risk: Math.round(data.totalRisk / data.count)
    }));
    return { rows, rowCount: rows.length };
  }

  if (lower.includes('from complaints') && lower.includes('group by category')) {
    const catMap = {};
    memoryDb.complaints.forEach(c => {
      const cat = c.category || 'Severe Blockage';
      if (!catMap[cat]) catMap[cat] = { count: 0, totalRisk: 0 };
      catMap[cat].count += 1;
      catMap[cat].totalRisk += (c.risk_score || 50);
    });
    const rows = Object.entries(catMap).map(([category, data]) => ({ 
      category, 
      count: data.count.toString(),
      avg_risk: Math.round(data.totalRisk / data.count)
    }));
    return { rows, rowCount: rows.length };
  }

  // 9. Complaints General SELECT (with filters & sorting)
  if (lower.startsWith('select') && lower.includes('from complaints')) {
    if (lower.includes('1=0')) {
      return { rows: [], rowCount: 0 };
    }

    let list = [...memoryDb.complaints];
    
    // Status filter
    if (lower.includes('status =')) {
      const match = lower.match(/status\s*=\s*\$(\d+)/);
      if (match && params[parseInt(match[1], 10) - 1]) {
        const sVal = String(params[parseInt(match[1], 10) - 1]).toLowerCase();
        list = list.filter(c => c.status && c.status.toLowerCase() === sVal);
      }
    }

    // Category filter
    if (lower.includes('category =')) {
      const match = lower.match(/category\s*=\s*\$(\d+)/);
      if (match && params[parseInt(match[1], 10) - 1]) {
        const cVal = String(params[parseInt(match[1], 10) - 1]).toLowerCase();
        list = list.filter(c => c.category && c.category.toLowerCase() === cVal);
      }
    }

    // Zone filter
    if (lower.includes('zone_criticality =')) {
      const match = lower.match(/zone_criticality\s*=\s*\$(\d+)/);
      if (match && params[parseInt(match[1], 10) - 1]) {
        const zVal = String(params[parseInt(match[1], 10) - 1]).toLowerCase();
        list = list.filter(c => c.zone_criticality && c.zone_criticality.toLowerCase() === zVal);
      }
    }

    // User ownership filter (user_id, user_email, contact_phone, reported_by)
    const hasUserClause = lower.includes('user_id') || lower.includes('user_email') || lower.includes('contact_phone') || lower.includes('reported_by');
    if (hasUserClause) {
      let targetUserId = null;
      let targetEmail = null;
      let targetPhone = null;
      let targetReportedBy = null;

      const uidMatch = lower.match(/user_id\s*=\s*\$(\d+)/);
      if (uidMatch && params[parseInt(uidMatch[1], 10) - 1] !== undefined) {
        targetUserId = parseInt(params[parseInt(uidMatch[1], 10) - 1], 10);
      }

      const emailMatch = lower.match(/user_email\)?\s*=\s*lower\(\$(\d+)\)/) || lower.match(/user_email\s*=\s*\$(\d+)/);
      if (emailMatch && params[parseInt(emailMatch[1], 10) - 1]) {
        targetEmail = String(params[parseInt(emailMatch[1], 10) - 1]).toLowerCase().trim();
      }

      const phoneMatch = lower.match(/contact_phone\s*=\s*\$(\d+)/);
      if (phoneMatch && params[parseInt(phoneMatch[1], 10) - 1]) {
        targetPhone = String(params[parseInt(phoneMatch[1], 10) - 1]).trim();
      }

      const repMatch = lower.match(/reported_by\)?\s*=\s*lower\(\$(\d+)\)/) || lower.match(/reported_by\s*=\s*\$(\d+)/);
      if (repMatch && params[parseInt(repMatch[1], 10) - 1]) {
        targetReportedBy = String(params[parseInt(repMatch[1], 10) - 1]).toLowerCase().trim();
      }

      list = list.filter(c => {
        const matchId = targetUserId != null && c.user_id != null && c.user_id === targetUserId;
        const matchEmail = targetEmail && c.user_email && c.user_email.toLowerCase() === targetEmail;
        const matchPhone = targetPhone && c.contact_phone && c.contact_phone === targetPhone;
        const matchRep = targetReportedBy && c.reported_by && c.reported_by.toLowerCase() === targetReportedBy;
        return Boolean(matchId || matchEmail || matchPhone || matchRep);
      });
    }

    // Determine sort
    if (lower.includes('order by water_level_pct')) {
      const isAsc = lower.includes('water_level_pct asc');
      list.sort((a, b) => isAsc ? a.water_level_pct - b.water_level_pct : b.water_level_pct - a.water_level_pct);
    } else if (lower.includes('order by created_at')) {
      const isAsc = lower.includes('created_at asc');
      list.sort((a, b) => isAsc ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at));
    } else if (lower.includes('order by sla_hours_remaining')) {
      const isAsc = lower.includes('sla_hours_remaining asc');
      list.sort((a, b) => isAsc ? a.sla_hours_remaining - b.sla_hours_remaining : b.sla_hours_remaining - a.sla_hours_remaining);
    } else {
      // Default: risk_score DESC
      const isAsc = lower.includes('risk_score asc');
      list.sort((a, b) => isAsc ? a.risk_score - b.risk_score : b.risk_score - a.risk_score);
    }

    return { rows: list, rowCount: list.length };
  }

  // 10. INSERT into complaints
  if (lower.startsWith('insert into complaints')) {
    const [
      complaint_id, 
      title, 
      category, 
      location, 
      zone_criticality, 
      reported_by, 
      contact_phone, 
      water_level_pct, 
      risk_score, 
      status, 
      sla_hours_remaining, 
      description, 
      photo_url, 
      latitude, 
      longitude,
      user_id,
      user_email
    ] = params;

    const newId = memoryDb.complaints.length > 0 ? Math.max(...memoryDb.complaints.map(c => c.id)) + 1 : 1;
    const newComplaint = {
      id: newId,
      complaint_id: complaint_id || `DW-CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || 'Drainage Incident Report',
      category: category || 'Severe Blockage',
      location: location || 'Civic Drainage Sector',
      zone_criticality: zone_criticality || 'Residential',
      reported_by: reported_by || 'Citizen Reporter',
      contact_phone: contact_phone || '',
      water_level_pct: parseInt(water_level_pct, 10) || 50,
      risk_score: parseInt(risk_score, 10) || 60,
      status: status || 'Pending Inspection',
      sla_hours_remaining: parseInt(sla_hours_remaining, 10) || 24,
      description: description || '',
      photo_url: photo_url || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      user_id: user_id ? parseInt(user_id, 10) : null,
      user_email: user_email || '',
      created_at: new Date(),
    };
    memoryDb.complaints.unshift(newComplaint);
    return { rows: [newComplaint], rowCount: 1 };
  }

  // 11. UPDATE complaints (handles simple status update and rich field inspection updates)
  if (lower.startsWith('update complaints')) {
    let id = params[params.length - 1];
    let comp = memoryDb.complaints.find(c => c.id === parseInt(id, 10) || c.complaint_id === id);

    if (!comp && params.length >= 2) {
      // Check if id is passed as another param
      comp = memoryDb.complaints.find(c => params.includes(c.id) || params.includes(c.complaint_id));
    }

    if (comp) {
      if (lower.includes('technical_cause') || lower.includes('recommended_fix') || lower.includes('estimated_cost')) {
        // Engineer Assessment Update: [status, technicalCause, recommendedFix, estimatedCost, requiredMachinery, materialSpecs, estimatedDuration, isStructuralRisk, structuralRiskLevel, engineerNotes, assessedBy, id, complaint_id]
        if (params[0]) comp.status = params[0];
        if (params[1] !== undefined) comp.technical_cause = params[1];
        if (params[2] !== undefined) comp.recommended_fix = params[2];
        if (params[3] !== undefined) comp.estimated_cost = parseInt(params[3], 10) || 0;
        if (params[4] !== undefined) comp.required_machinery = params[4];
        if (params[5] !== undefined) comp.material_specs = params[5];
        if (params[6] !== undefined) comp.estimated_duration = params[6];
        if (params[7] !== undefined) comp.is_structural_risk = Boolean(params[7]);
        if (params[8] !== undefined) comp.structural_risk_level = params[8];
        if (params[9] !== undefined) comp.engineer_notes = params[9];
        if (params[10] !== undefined) comp.assessed_by = params[10];
        comp.assessed_at = new Date();
      } else if (params.length === 2 && typeof params[0] === 'string') {
        comp.status = params[0];
        if (params[0] === 'Resolved') comp.sla_hours_remaining = 0;
      } else {
        // Detailed field update: [status, fieldNotes, verificationPhoto, flaggedReason, isEscalated, escalationNotes, inspectedBy, id]
        if (params[0]) comp.status = params[0];
        if (params[1] !== undefined) comp.field_notes = params[1];
        if (params[2] !== undefined) comp.verification_photo = params[2];
        if (params[3] !== undefined) comp.flagged_reason = params[3];
        if (params[4] !== undefined) comp.is_escalated = Boolean(params[4]);
        if (params[5] !== undefined) comp.escalation_notes = params[5];
        if (params[6] !== undefined) comp.inspected_by = params[6];
        comp.inspected_at = new Date();
        if (comp.status === 'Resolved') comp.sla_hours_remaining = 0;
      }
      return { rows: [{ ...comp }], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  // 12. DELETE complaints
  if (lower.startsWith('delete from complaints')) {
    const idParam = params[0];
    const initialLen = memoryDb.complaints.length;
    const deletedItem = memoryDb.complaints.find(c => 
      c.id === parseInt(idParam, 10) || 
      c.complaint_id === idParam ||
      (params[1] && (c.id === parseInt(params[1], 10) || c.complaint_id === params[1]))
    );
    memoryDb.complaints = memoryDb.complaints.filter(c => 
      c.id !== parseInt(idParam, 10) && 
      c.complaint_id !== idParam &&
      (!params[1] || (c.id !== parseInt(params[1], 10) && c.complaint_id !== params[1]))
    );
    const rowCount = initialLen - memoryDb.complaints.length;
    return { rows: deletedItem ? [deletedItem] : [], rowCount };
  }

  return { rows: [], rowCount: 0 };
}

// Resilient Pool Proxy
export const pool = {
  async query(text, params) {
    if (isNeonConnected) {
      try {
        return await rawPool.query(text, params);
      } catch (err) {
        console.warn('⚠️ Neon query error, using resilient fallback:', err.message);
        isNeonConnected = false;
        return executeMemoryQuery(text, params);
      }
    }
    return executeMemoryQuery(text, params);
  },
  async connect() {
    if (isNeonConnected) {
      try {
        return await rawPool.connect();
      } catch (err) {
        isNeonConnected = false;
      }
    }
    return {
      query: async (text, params) => executeMemoryQuery(text, params),
      release: () => {},
    };
  },
};

export async function initDb() {
  console.log('🔄 Checking database connectivity...');
  try {
    const client = await rawPool.connect();
    isNeonConnected = true;
    console.log('⚡ Connected to Neon PostgreSQL database successfully!');

    // Initialize tables
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

      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drainage_alerts (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        water_level_pct INTEGER NOT NULL,
        flow_rate_m3s NUMERIC(5,2) DEFAULT 4.20,
        status VARCHAR(50) DEFAULT 'Normal',
        reported_by VARCHAR(255) DEFAULT 'IoT Sensor Array #7',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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
        user_id INTEGER,
        user_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_zone VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_ward VARCHAR(100);

      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id INTEGER;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS field_notes TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS verification_photo TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS inspection_status VARCHAR(50);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS flagged_reason VARCHAR(100);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_escalated BOOLEAN DEFAULT FALSE;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_notes TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS inspected_by VARCHAR(255);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS inspected_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS technical_cause VARCHAR(255);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS recommended_fix VARCHAR(255);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS estimated_cost INTEGER DEFAULT 0;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS required_machinery TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS material_specs TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(100);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_structural_risk BOOLEAN DEFAULT FALSE;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS structural_risk_level VARCHAR(100);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS engineer_notes TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assessed_by VARCHAR(255);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assessed_at TIMESTAMP WITH TIME ZONE;
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

    client.release();
    console.log('✅ Neon PostgreSQL tables initialized and ready.');
  } catch (err) {
    isNeonConnected = false;
    console.log(`💡 Note: Neon PostgreSQL cloud connection timeout (${err.message}).`);
    console.log('🛡️ Seamless in-memory infrastructure database active and ready for all login, registration & complaints.');
  }
}
