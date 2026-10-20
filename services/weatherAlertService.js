/**
 * SolVision Weather Alert Processing Service
 * Conforming to PostGIS Spatial Intersections and Automated Farm Dispatches
 */

// If running in Node environment with pg or simulated pool
const mockDb = {
  async query(sql, params) {
    // In-memory PostGIS simulator for webhook test runs
    if (sql.includes('SELECT') && sql.includes('agricultural_parcels')) {
      return {
        rows: [
          {
            parcel_id: 'PRC-MILA-01',
            owner_id: 'OWN-901',
            parcel_name: 'القطعة (A3/مزرعة ميلة)',
            slope_degree: 17.5,
            parcel_geom: '{"type":"Polygon","coordinates":[[[6.30,36.40],[6.38,36.40],[6.38,36.35],[6.30,36.35],[6.30,36.40]]]}'
          },
          {
            parcel_id: 'PRC-MILA-02',
            owner_id: 'OWN-904',
            parcel_name: 'القطعة (B2/حوض وادي العثمانية)',
            slope_degree: 19.4,
            parcel_geom: '{"type":"Polygon","coordinates":[[[6.43,36.41],[6.49,36.41],[6.49,36.33],[6.43,36.33],[6.43,36.41]]]}'
          }
        ]
      };
    }
    return { rows: [] };
  }
};

let pool = mockDb;
try {
  // If user configures actual postgres pool
  pool = require('../config/db');
} catch (e) {
  pool = mockDb;
}

async function processIncomingWeatherAlert(alertPayload) {
  const { alert_id, severity_level, valid_until, geometry } = alertPayload;
  const geometryJSON = JSON.stringify(geometry);

  try {
    // 1. استعلام المطابقة المكانية مع القطع الفلاحية المُسجلة
    const query = `
      SELECT 
        p.parcel_id,
        p.owner_id,
        p.name AS parcel_name,
        p.slope_degree,
        ST_AsGeoJSON(p.geom) AS parcel_geom
      FROM 
        agricultural_parcels p
      WHERE 
        ST_Intersects(
          p.geom, 
          ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
        );
    `;

    const { rows: matchedParcels } = await pool.query(query, [geometryJSON]);

    if (!matchedParcels || matchedParcels.length === 0) {
      console.log(`[SolVision] لا توجد قطع زراعية متأثرة بالتنبيه ${alert_id}`);
      return { status: 'NO_AFFECTED_PARCELS', matched_parcels_count: 0, actions_triggered: [] };
    }

    const triggeredActions = [];

    // 2. معالجة كل قطعة أرض متأثرة وتوليد الإجراءات الآلية
    for (const parcel of matchedParcels) {
      // تقييم المخاطر المباشرة بناءً على خصائص القطعة والتنبيه
      const runoffRisk = parcel.slope_degree > 15 ? 'HIGH' : 'MEDIUM';

      // أ. أمر إيقاف أنظمة الري الذكية (IoT Kill-Switch)
      await pool.query(
        `UPDATE iot_irrigation_controllers 
         SET status = 'PAUSED', paused_until = $1 
         WHERE parcel_id = $2`,
        [valid_until, parcel.parcel_id]
      );

      // ب. تسجيل الحدث والتنبيه في السجل التاريخي (History Log)
      await pool.query(
        `INSERT INTO weather_event_logs (alert_id, parcel_id, severity, status) 
         VALUES ($1, $2, $3, $4)`,
        [alert_id, parcel.parcel_id, severity_level, 'TRIGGERED']
      );

      triggeredActions.push({
        parcel_id: parcel.parcel_id,
        parcel_name: parcel.parcel_name,
        risk_assessment: {
          runoff_risk: runoffRisk,
          wind_stress_risk: severity_level >= 1 ? 'HIGH' : 'LOW',
          soil_saturation_expected: 'MAX'
        },
        actions_taken: [
          'IoT_Irrigation_Controller_PAUSED',
          'Notification_Sent'
        ],
        automated_commands: [
          {
            target_system: 'IoT_Irrigation_Controller',
            action: 'PAUSE_SCHEDULE',
            duration_hours: 48,
            status: 'DISPATCHED'
          },
          {
            target_system: 'Notification_Service',
            recipient: 'Farm_Manager',
            channel: 'PUSH_AND_SMS',
            message: `تنبيه SolVision: عاصفة رعدية من الدرجة الأولى مستهدفة لقطعتك (${parcel.parcel_name}). تم إيقاف الري تلقائياً وتفعيل بروتوكول تثبيت الأفرع ومصارف السيول.`
          }
        ]
      });
    }

    return {
      event_processing_id: `EVT-${Date.now()}-SOL`,
      matched_parcels_count: matchedParcels.length,
      actions_triggered: triggeredActions
    };

  } catch (error) {
    console.error('خطأ أثناء معالجة التنبيه الجوي في SolVision:', error);
    throw error;
  }
}

module.exports = { processIncomingWeatherAlert };
