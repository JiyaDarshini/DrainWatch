import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'drainwatch_secret_jwt_key_2025';

// Risk Calculation Algorithm
function calculateRiskScore({ category, zoneCriticality, waterLevelPct }) {
  const categoryWeights = {
    'Culvert Collapse': 92,
    'Toxic Sludge & Overflow': 84,
    'Sump Overflow': 76,
    'Severe Blockage': 66,
    'Open Manhole Hazard': 62,
    'Siltation': 46,
    'Trash Grate Clog': 28,
  };

  const zoneMultipliers = {
    'Critical Health Zone': 1.35,
    'High Traffic Transit': 1.25,
    'School Safety Zone': 1.20,
    'Dense Commercial': 1.10,
    'Residential': 1.00,
    'Public Park': 0.80,
  };

  const baseWeight = categoryWeights[category] || 50;
  const zoneMult = zoneMultipliers[zoneCriticality] || 1.0;
  const waterPct = Math.min(100, Math.max(0, parseInt(waterLevelPct, 10) || 50));

  // Composite Weighted Score
  // 45% Category Severity + 30% Water Level + 25% Zone Vulnerability Factor
  const rawScore = (baseWeight * 0.45) + (waterPct * 0.30) + ((baseWeight * zoneMult) * 0.25);
  return Math.min(99, Math.max(12, Math.round(rawScore)));
}

/**
 * GET /api/complaints
 * Returns complaints ranked by risk_score DESC by default.
 * Supports filtering by user (userId, userEmail, phone, reportedBy, onlyMine) so users only see their own complaints.
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, zone, sortBy = 'risk_score', order = 'DESC', userId, userEmail, phone, reportedBy, onlyMine } = req.query;

    let tokenUser = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        tokenUser = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        // Token invalid or expired, continue with query parameters
      }
    }

    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'All') {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category && category !== 'All') {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (zone && zone !== 'All') {
      query += ` AND zone_criticality = $${paramIndex++}`;
      params.push(zone);
    }

    // User-specific filtering (for citizen view / my complaints only)
    const filterUserId = userId ? parseInt(userId, 10) : (tokenUser && onlyMine === 'true' ? tokenUser.id : null);
    const filterEmail = userEmail ? userEmail.trim().toLowerCase() : (tokenUser && onlyMine === 'true' ? tokenUser.email.toLowerCase() : null);
    const filterPhone = phone ? phone.trim() : (tokenUser && onlyMine === 'true' ? tokenUser.phone : null);
    const filterReportedBy = reportedBy ? reportedBy.trim() : null;

    const isUserFilterRequested = filterUserId || filterEmail || filterPhone || filterReportedBy || onlyMine === 'true';

    if (isUserFilterRequested) {
      const userConditions = [];
      if (filterUserId) {
        userConditions.push(`user_id = $${paramIndex++}`);
        params.push(filterUserId);
      }
      if (filterEmail) {
        userConditions.push(`LOWER(user_email) = LOWER($${paramIndex++})`);
        params.push(filterEmail);
      }
      if (filterPhone) {
        userConditions.push(`contact_phone = $${paramIndex++}`);
        params.push(filterPhone);
      }
      if (filterReportedBy) {
        userConditions.push(`LOWER(reported_by) = LOWER($${paramIndex++})`);
        params.push(filterReportedBy);
      }

      if (userConditions.length > 0) {
        query += ` AND (${userConditions.join(' OR ')})`;
      } else if (onlyMine === 'true' && !tokenUser) {
        // Requested onlyMine but no user identifiers provided: return empty
        query += ` AND 1=0`;
      }
    }

    // Sorting
    const allowedSortFields = ['risk_score', 'water_level_pct', 'created_at', 'sla_hours_remaining'];
    const validSort = allowedSortFields.includes(sortBy) ? sortBy : 'risk_score';
    const validOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${validSort} ${validOrder}`;

    const result = await pool.query(query, params);
    return res.json({
      success: true,
      count: result.rows.length,
      complaints: result.rows,
    });
  } catch (error) {
    console.error('Error fetching ranked complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});

/**
 * GET /api/complaints/analytics
 * Returns aggregated statistics for visual dashboards & charts
 */
router.get('/analytics', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as total, AVG(risk_score) as avg_risk FROM complaints');
    const tierRes = await pool.query(`
      SELECT 
        COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as critical_count,
        COUNT(CASE WHEN risk_score >= 60 AND risk_score < 80 THEN 1 END) as high_count,
        COUNT(CASE WHEN risk_score >= 40 AND risk_score < 60 THEN 1 END) as medium_count,
        COUNT(CASE WHEN risk_score < 40 THEN 1 END) as low_count,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved_count,
        COUNT(CASE WHEN status = 'Critical Dispatch' THEN 1 END) as active_dispatches
      FROM complaints
    `);

    const zoneRes = await pool.query(`
      SELECT zone_criticality as zone, COUNT(*) as count, AVG(risk_score)::int as avg_risk
      FROM complaints
      GROUP BY zone_criticality
      ORDER BY avg_risk DESC
    `);

    const categoryRes = await pool.query(`
      SELECT category, COUNT(*) as count, AVG(risk_score)::int as avg_risk
      FROM complaints
      GROUP BY category
      ORDER BY avg_risk DESC
    `);

    return res.json({
      success: true,
      summary: {
        total: parseInt(totalRes.rows[0].total, 10),
        avgRiskScore: Math.round(parseFloat(totalRes.rows[0].avg_risk) || 0),
        criticalCount: parseInt(tierRes.rows[0].critical_count, 10),
        highCount: parseInt(tierRes.rows[0].high_count, 10),
        mediumCount: parseInt(tierRes.rows[0].medium_count, 10),
        lowCount: parseInt(tierRes.rows[0].low_count, 10),
        resolvedCount: parseInt(tierRes.rows[0].resolved_count, 10),
        activeDispatches: parseInt(tierRes.rows[0].active_dispatches, 10),
      },
      zoneDistribution: zoneRes.rows,
      categoryDistribution: categoryRes.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

/**
 * POST /api/complaints
 * Submit a new complaint with automated risk scoring (supports Photo, GPS Location, Description, User Identity)
 */
router.post('/', async (req, res) => {
  try {
    let tokenUser = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        tokenUser = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        // Token invalid or expired
      }
    }

    const { 
      title, 
      category = 'Severe Blockage', 
      location, 
      zoneCriticality, 
      reportedBy, 
      contactPhone, 
      waterLevelPct, 
      description,
      photoUrl,
      latitude,
      longitude,
      userId,
      userEmail,
    } = req.body;

    if (!location && !latitude && !longitude) {
      return res.status(400).json({ success: false, message: 'Location or GPS coordinates are required.' });
    }

    const resolvedLocation = (location && location.trim()) || 
      (latitude && longitude ? `GPS (${parseFloat(latitude).toFixed(4)}°, ${parseFloat(longitude).toFixed(4)}°)` : 'Civic Drainage Sector');

    const derivedTitle = (title && title.trim()) || 
      (description && description.trim().length > 0 ? description.trim().slice(0, 45) + (description.length > 45 ? '...' : '') : `${category} Report`);

    const complaintId = `DW-CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const zone = zoneCriticality || 'Residential';
    const waterPct = parseInt(waterLevelPct, 10) || 55;
    const riskScore = calculateRiskScore({ category, zoneCriticality: zone, waterLevelPct: waterPct });

    const effectiveUserId = userId || (tokenUser ? tokenUser.id : null);
    const effectiveUserEmail = (userEmail && userEmail.trim().toLowerCase()) || (tokenUser ? tokenUser.email.toLowerCase() : '');
    const effectiveReportedBy = reportedBy || (tokenUser ? tokenUser.fullName : 'Citizen Reporter');
    const effectivePhone = contactPhone || (tokenUser ? tokenUser.phone : '');

    let initialStatus = 'Pending Inspection';
    let slaHours = 24;
    if (riskScore >= 80) {
      initialStatus = 'Critical Dispatch';
      slaHours = 4;
    } else if (riskScore >= 60) {
      initialStatus = 'In Progress';
      slaHours = 12;
    }

    const insertRes = await pool.query(
      `INSERT INTO complaints 
        (complaint_id, title, category, location, zone_criticality, reported_by, contact_phone, water_level_pct, risk_score, status, sla_hours_remaining, description, photo_url, latitude, longitude, user_id, user_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        complaintId,
        derivedTitle,
        category,
        resolvedLocation,
        zone,
        effectiveReportedBy,
        effectivePhone,
        waterPct,
        riskScore,
        initialStatus,
        slaHours,
        description || '',
        photoUrl || null,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        effectiveUserId ? parseInt(effectiveUserId, 10) : null,
        effectiveUserEmail,
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Complaint lodged successfully with Incident ID ${complaintId} and Priority Score: ${riskScore}/100`,
      complaint: insertRes.rows[0],
    });
  } catch (error) {
    console.error('Error inserting complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit complaint' });
  }
});

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status (e.g. Critical Dispatch, In Progress, Resolved)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updateRes = await pool.query(
      'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    return res.json({
      success: true,
      message: `Status updated to ${status}`,
      complaint: updateRes.rows[0],
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update complaint status' });
  }
});

/**
 * DELETE /api/complaints/:id
 * Delete a complaint by numeric ID or complaint_id string (e.g. DW-CMP-6239)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deleteRes;
    
    if (isNaN(id)) {
      deleteRes = await pool.query('DELETE FROM complaints WHERE complaint_id = $1 RETURNING *', [id]);
    } else {
      deleteRes = await pool.query('DELETE FROM complaints WHERE id = $1 OR complaint_id = $2 RETURNING *', [parseInt(id, 10), id]);
    }

    if (deleteRes.rowCount === 0 && (!deleteRes.rows || deleteRes.rows.length === 0)) {
      return res.status(404).json({ success: false, message: 'Complaint not found or already deleted' });
    }

    return res.json({
      success: true,
      message: 'Complaint deleted successfully',
      deletedComplaint: deleteRes.rows ? deleteRes.rows[0] : null
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete complaint' });
  }
});

export default router;

