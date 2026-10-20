import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPointInPolygon,
  polygonIntersectsPolygon,
  calculateRunoffRisk,
  calculateWindStressRisk,
  calculateFungalRisk,
  processWeatherAlert,
} from './spatialEngine.ts';
import type { WeatherAlertPayload, AgriculturalParcel } from '../types/solvision.ts';

test('isPointInPolygon correctly detects internal point', () => {
  const polygon = [
    [6.25, 36.45],
    [6.50, 36.45],
    [6.50, 36.30],
    [6.25, 36.30],
    [6.25, 36.45],
  ];

  assert.equal(isPointInPolygon([6.35, 36.38], polygon), true);
  assert.equal(isPointInPolygon([7.00, 37.00], polygon), false);
});

test('polygonIntersectsPolygon correctly matches intersecting polygons', () => {
  const stormPoly = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [6.25, 36.45],
        [6.50, 36.45],
        [6.50, 36.30],
        [6.25, 36.30],
        [6.25, 36.45],
      ],
    ],
  };

  // Parcel inside storm bounds (Mila parcel)
  const intersectedParcel = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [6.30, 36.40],
        [6.38, 36.40],
        [6.38, 36.35],
        [6.30, 36.35],
        [6.30, 36.40],
      ],
    ],
  };

  // Parcel far away outside storm bounds (Algiers parcel)
  const nonIntersectedParcel = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [3.05, 36.75],
        [3.10, 36.75],
        [3.10, 36.70],
        [3.05, 36.70],
        [3.05, 36.75],
      ],
    ],
  };

  assert.equal(polygonIntersectsPolygon(intersectedParcel, stormPoly), true);
  assert.equal(polygonIntersectsPolygon(nonIntersectedParcel, stormPoly), false);
});

test('calculateRunoffRisk classifies high slope (>15 deg) as HIGH risk', () => {
  const steepParcel = calculateRunoffRisk(18.5, 0.7, 45, 'heavy clay');
  assert.equal(steepParcel.runoff_risk, 'HIGH');
  assert.equal(steepParcel.soil_saturation_expected, 'MAX');
  assert.equal(steepParcel.dem_concavity_status, 'PRONE_TO_WATERLOGGING');

  const flatParcel = calculateRunoffRisk(4.0, 0.2, 20, 'sandy loam');
  assert.equal(flatParcel.runoff_risk, 'LOW');
});

test('calculateWindStressRisk factors downburst velocity and tree drag', () => {
  const highWind = calculateWindStressRisk(85, 1, 0.75, 12, 'أشجار الزيتون');
  assert.equal(highWind.wind_stress_risk, 'HIGH');

  const lowWind = calculateWindStressRisk(30, 0, 0.3, 8, 'حمضيات');
  assert.equal(lowWind.wind_stress_risk, 'LOW');
});

test('calculateFungalRisk identifies severe risk under saturated soil conditions', () => {
  assert.equal(calculateFungalRisk(55, 'MAX'), 'SEVERE');
  assert.equal(calculateFungalRisk(30, 'HIGH'), 'HIGH');
  assert.equal(calculateFungalRisk(8, 'MODERATE'), 'LOW');
});

test('processWeatherAlert performs end-to-end matching and automated commands', () => {
  const alert: WeatherAlertPayload = {
    alert_id: 'ESTOFEX-2026-10-20-01',
    source: 'ESTOFEX / National Met Office',
    severity_level: 1,
    hazard_type: 'THUNDERSTORM_HEAVY_RAIN_DOWNBURST',
    issued_at: '2026-10-20T01:00:00Z',
    valid_until: '2026-10-20T18:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.25, 36.45],
          [6.50, 36.45],
          [6.50, 36.30],
          [6.25, 36.30],
          [6.25, 36.45],
        ],
      ],
    },
  };

  const parcels: AgriculturalParcel[] = [
    {
      parcel_id: 'PRC-MILA-01',
      owner_id: 'OWN-901',
      name: 'القطعة (A3/مزرعة ميلة)',
      name_en: 'Parcel A3 - Mila High Plains',
      wilaya: 'ميلة (Mila)',
      crop_type: 'أشجار الزيتون المعمر والقمح الصلب',
      crop_type_en: 'Olive Trees & Durum Wheat',
      tree_age_years: 15,
      ndvi_vegetation_index: 0.74,
      row_orientation_degrees: 45,
      slope_degree: 17.5,
      soil_type: 'طينية ثقيلة (Heavy Clay)',
      elevation_m: 480,
      depression_index: 0.65,
      geom: {
        type: 'Polygon',
        coordinates: [
          [
            [6.30, 36.40],
            [6.38, 36.40],
            [6.38, 36.35],
            [6.30, 36.35],
            [6.30, 36.40],
          ],
        ],
      },
      area_hectares: 42.5,
      current_irrigation_status: 'ACTIVE',
      assigned_manager: {
        name: 'المهندس كريم بوجمعة',
        phone: '+213 550 12 34 56',
        email: 'karim.b@solvision.farm',
      },
    },
  ];

  const result = processWeatherAlert(alert, parcels);
  assert.equal(result.matched_parcels_count, 1);
  assert.equal(result.actions_triggered[0].parcel_id, 'PRC-MILA-01');
  assert.equal(result.actions_triggered[0].risk_assessment.runoff_risk, 'HIGH');
  assert.equal(result.actions_triggered[0].risk_assessment.wind_stress_risk, 'HIGH');

  // Verify IoT pause command was generated
  const iotCommand = result.actions_triggered[0].automated_commands.find(
    (c) => c.target_system === 'IoT_Irrigation_Controller'
  );
  assert.ok(iotCommand);
  assert.equal(iotCommand?.action, 'PAUSE_SCHEDULE');
  assert.equal(iotCommand?.duration_hours, 48);
});
