/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { Point } from '../../util/geoUtils';

// Pass your real location object
export const mockField = {
  name: 'Second Field',
  location_id: 'dab87a46-0f41-11f0-9a54-acde48001122',
  type: 'field',
  grid_points: [
    {
      lat: 49.06326733965025,
      lng: -123.153402026469,
    },
    {
      lat: 49.06643065095024,
      lng: -123.15411012964893,
    },
    {
      lat: 49.06681023477433,
      lng: -123.15554779368091,
    },
    {
      lat: 49.06650094446976,
      lng: -123.15614860850025,
    },
    {
      lat: 49.06692270349866,
      lng: -123.15692108469653,
    },
    {
      lat: 49.06606512304573,
      lng: -123.1577793915813,
    },
    {
      lat: 49.06464516221381,
      lng: -123.15741461115527,
    },
  ],
};

// Pass pivot info; no need to make a location entity for it
export const mockPivot = {
  center: { lat: 49.06547, lng: -123.15597 },
  radius: 150,
};

export const mockUriData = {
  application_depth: 10,
  application_depth_unit: 'mm',
  available_soil_moisture: 40,
  available_soil_moisture_unit: '%',
};

/* -----------------
3-zone test case
--------------------*/
// Mock data for VRI zones (AI-generated polygons)
const boundaryA = { lat: 49.0663, lng: -123.1563 };
const boundaryB = { lat: 49.0654, lng: -123.1575 };
const boundaryC = { lat: 49.0652, lng: -123.1555 };

const innerMeeting = {
  lat: (boundaryA.lat + boundaryB.lat + boundaryC.lat) / 3,
  lng: (boundaryA.lng + boundaryB.lng + boundaryC.lng) / 3,
};

const zone1Outer = [
  { lat: 49.06479, lng: -123.15418 },
  { lat: 49.06547, lng: -123.15391 },
  { lat: 49.06615, lng: -123.15418 },
  { lat: 49.06664, lng: -123.15494 },
  { lat: 49.06682, lng: -123.15597 },
];
const zone1Inner = [boundaryA, innerMeeting, boundaryC];

export const mockZone1 = {
  available_soil_moisture: 40,
  available_soil_moisture_unit: '%',
  application_depth: 10,
  application_depth_unit: 'mm',
  grid_points: [...zone1Outer, ...zone1Inner],
};

const zone2Outer = [
  { lat: 49.06682, lng: -123.15597 },
  { lat: 49.06664, lng: -123.157 },
  { lat: 49.06615, lng: -123.15776 },
  { lat: 49.06547, lng: -123.15803 },
  { lat: 49.06479, lng: -123.15776 },
];
const zone2Inner = [boundaryB, innerMeeting, boundaryA];

export const mockZone2 = {
  available_soil_moisture: 50,
  available_soil_moisture_unit: '%',
  application_depth: 15,
  application_depth_unit: 'mm',
  grid_points: [...zone2Outer, ...zone2Inner],
};

const zone3Outer = [
  { lat: 49.06479, lng: -123.15776 },
  { lat: 49.0643, lng: -123.157 },
  { lat: 49.06412, lng: -123.15597 },
  { lat: 49.0643, lng: -123.15494 },
  { lat: 49.06479, lng: -123.15418 },
];
const zone3Inner = [boundaryC, innerMeeting, boundaryB];

export const mockZone3 = {
  available_soil_moisture: 60,
  available_soil_moisture_unit: '%',
  application_depth: 20,
  application_depth_unit: 'mm',
  grid_points: [...zone3Outer, ...zone3Inner],
};

export const mockVriZones = [mockZone2, mockZone3, mockZone1];

/* -----------------
3-zone dynamic test case
--------------------*/
// Dynamic mock data for VRI zones (AI-generated function using haversine formula)
interface VriZone {
  available_soil_moisture: number;
  available_soil_moisture_unit: string;
  application_depth: number;
  application_depth_unit: 'mm';
  grid_points: Point[];
}

const EARTH_RADIUS = 6371000; // meters

function offsetPoint(center: Point, distance: number, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  const deltaLat = (distance * Math.cos(angleRad)) / EARTH_RADIUS;
  const deltaLng =
    (distance * Math.sin(angleRad)) / (EARTH_RADIUS * Math.cos((center.lat * Math.PI) / 180));

  return {
    lat: center.lat + (deltaLat * 180) / Math.PI,
    lng: center.lng + (deltaLng * 180) / Math.PI,
  };
}

export function generateMockPieSliceZones({
  center,
  radius,
}: {
  center: Point;
  radius: number;
}): VriZone[] {
  const zones: VriZone[] = [];
  const zoneCount = 3;
  const arcSpan = 120; // degrees per slice

  for (let i = 0; i < zoneCount; i++) {
    const startAngle = i * arcSpan;
    const endAngle = startAngle + arcSpan;
    const step = 30; // spacing for outer arc points

    // Generate arc points in increasing angle order
    const arcPoints: Point[] = [];
    for (let angle = startAngle; angle <= endAngle; angle += step) {
      arcPoints.push(offsetPoint(center, radius, angle));
    }

    // Add points forming the inner triangle: arc end -> center -> arc start (in reverse to maintain winding)
    const innerEdgePoint = offsetPoint(center, radius * 0.6, endAngle);
    const innerStartPoint = offsetPoint(center, radius * 0.6, startAngle);

    const polygonPoints = [
      ...arcPoints, // outer arc (clockwise or CCW)
      innerEdgePoint, // from outer arc end inward
      center, // center point
      innerStartPoint, // from center back out to arc start
    ];

    zones.push({
      available_soil_moisture: 40 + i * 10,
      available_soil_moisture_unit: '%',
      application_depth: 10 + i * 5,
      application_depth_unit: 'mm',
      grid_points: polygonPoints,
    });
  }

  return zones;
}

/* -----------------
5-zone test case
--------------------*/
// Also AI generated; for some reason Copilot was not able to extend the algorithm above so these zones are wonky
const freshCenterOrganic = mockPivot.center;
const outerRadiusOrganic = 0.0015;

function pointAtAngle(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    lat: freshCenterOrganic.lat + outerRadiusOrganic * Math.sin(rad),
    lng: freshCenterOrganic.lng + outerRadiusOrganic * Math.cos(rad),
  };
}

function perturb(point: { lat: number; lng: number }) {
  return { lat: point.lat + 0.0001, lng: point.lng - 0.0001 };
}

const o1 = pointAtAngle(0);
const o2 = pointAtAngle(72);
const o3 = pointAtAngle(144);
const o4 = pointAtAngle(216);
const o5 = pointAtAngle(288);

const o1_2 = pointAtAngle(36);
const o2_3 = pointAtAngle(108);
const o3_4 = pointAtAngle(180);
const o4_5 = pointAtAngle(252);
const o5_1 = pointAtAngle(324);

const zone1OuterOrganic = [perturb(o1), o1, o1_2, o2, perturb(o2)];
const zone2OuterOrganic = [perturb(o2), o2, o2_3, o3, perturb(o3)];
const zone3OuterOrganic = [perturb(o3), o3, o3_4, o4, perturb(o4)];
const zone4OuterOrganic = [perturb(o4), o4, o4_5, o5, perturb(o5)];
const zone5OuterOrganic = [perturb(o5), o5, o5_1, o1, perturb(o1)];

const b1 = { lat: 49.0663, lng: -123.1563 };
const b2 = { lat: 49.0654, lng: -123.1575 };
const b3 = { lat: 49.0652, lng: -123.1555 };
const b4 = { lat: 49.065, lng: -123.154 };
const b5 = { lat: 49.066, lng: -123.1545 };

const innerMeeting1 = {
  lat: (b1.lat + b2.lat + b5.lat) / 3,
  lng: (b1.lng + b2.lng + b5.lng) / 3,
};
const innerMeeting2 = {
  lat: (b2.lat + b3.lat + b1.lat) / 3,
  lng: (b2.lng + b3.lng + b1.lng) / 3,
};
const innerMeeting3 = {
  lat: (b3.lat + b4.lat + b2.lat) / 3,
  lng: (b3.lng + b4.lng + b2.lng) / 3,
};
const innerMeeting4 = {
  lat: (b4.lat + b5.lat + b3.lat) / 3,
  lng: (b4.lng + b5.lng + b3.lng) / 3,
};
const innerMeeting5 = {
  lat: (b5.lat + b1.lat + b4.lat) / 3,
  lng: (b5.lng + b1.lng + b4.lng) / 3,
};

const zone1InnerOrganic = [b1, innerMeeting1, b2];
const zone2InnerOrganic = [b2, innerMeeting2, b3];
const zone3InnerOrganic = [b3, innerMeeting3, b4];
const zone4InnerOrganic = [b4, innerMeeting4, b5];
const zone5InnerOrganic = [b5, innerMeeting5, b1];

export const mockZone1Organic = {
  available_soil_moisture: 40,
  available_soil_moisture_unit: '%',
  application_depth: 10,
  application_depth_unit: 'mm',
  grid_points: [...zone1OuterOrganic, ...zone1InnerOrganic],
};

export const mockZone2Organic = {
  available_soil_moisture: 50,
  available_soil_moisture_unit: '%',
  application_depth: 15,
  application_depth_unit: 'mm',
  grid_points: [...zone2OuterOrganic, ...zone2InnerOrganic],
};

export const mockZone3Organic = {
  available_soil_moisture: 60,
  available_soil_moisture_unit: '%',
  application_depth: 20,
  application_depth_unit: 'mm',
  grid_points: [...zone3OuterOrganic, ...zone3InnerOrganic],
};

export const mockZone4Organic = {
  available_soil_moisture: 70,
  available_soil_moisture_unit: '%',
  application_depth: 25,
  application_depth_unit: 'mm',
  grid_points: [...zone4OuterOrganic, ...zone4InnerOrganic],
};

export const mockZone5Organic = {
  available_soil_moisture: 80,
  available_soil_moisture_unit: '%',
  application_depth: 30,
  application_depth_unit: 'mm',
  grid_points: [...zone5OuterOrganic, ...zone5InnerOrganic],
};
export const mockVriZonesFive = [
  mockZone3Organic,
  mockZone1Organic,
  mockZone5Organic,
  mockZone2Organic,
  mockZone4Organic,
];
