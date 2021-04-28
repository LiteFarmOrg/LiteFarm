require('dotenv').config();

export const DEFAULT_CENTER = {
  lat: 49.24966,
  lng: -123.237421,
};
export const DEFAULT_ZOOM = 15;
export const GMAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
export const ENVIRONMENT = process.env.NODE_ENV;

export const isArea = (type) => {
  return [
    locationEnum.barn,
    locationEnum.ceremonial_area,
    locationEnum.farm_site_boundary,
    locationEnum.field,
    locationEnum.garden,
    locationEnum.greenhouse,
    locationEnum.surface_water,
    locationEnum.natural_area,
    locationEnum.residence,
  ].includes(type);
};
export const isAreaLine = (type) =>
  [locationEnum.watercourse, locationEnum.buffer_zone, locationEnum.farm_site_boundary].includes(
    type,
  );
export const containsCrops = (type) => {
  return [
    locationEnum.field,
    locationEnum.garden,
    locationEnum.greenhouse,
    locationEnum.buffer_zone,
  ].includes(type);
};

export const isNoFillArea = (type) => {
  return [locationEnum.farm_site_boundary].includes(type);
};

export const isLine = (type) => {
  return [locationEnum.watercourse, locationEnum.fence, locationEnum.buffer_zone].includes(type);
};

export const isPoint = (type) => {
  return [locationEnum.gate, locationEnum.water_valve].includes(type);
};

export const locationEnum = {
  field: 'field',
  garden: 'garden',
  barn: 'barn',
  ceremonial_area: 'ceremonial_area',
  greenhouse: 'greenhouse',
  surface_water: 'surface_water',
  natural_area: 'natural_area',
  buffer_zone: 'buffer_zone',
  watercourse: 'watercourse',
  fence: 'fence',
  gate: 'gate',
  water_valve: 'water_valve',
  farm_site_boundary: 'farm_site_boundary',
  residence: 'residence',
};

export const polygonPath = (path, width, maps) => {
  const { leftPoints, rightPoints } = path.reduce(linePathPolygonConstructor, {
    leftPoints: [],
    rightPoints: [],
    bearings: [],
    width,
    maps,
  });
  return leftPoints.concat(rightPoints.reverse());
};

const linePathPolygonConstructor = (innerState, point, i, path) => {
  const { bearings, leftPoints, rightPoints, width, maps } = innerState;
  const {
    geometry: {
      spherical: { computeHeading, computeOffset },
    },
  } = maps;
  if (i === 0 || i === path.length - 1) {
    const initialPoint = i === 0 ? point : path[i - 1];
    const nextPoint = i === 0 ? path[i + 1] : point;
    setPerpendiculars(initialPoint, nextPoint);
  } else {
    const heading = computeHeading(point, path[i + 1]);
    bearings.push(heading);
    // OC: 180 is added to get the angle from the perspective of the 2nd point.
    const angleFormed = heading - adjustAngle(bearings[i - 1] + 180);
    const angleFormedInRadians = (Math.abs(angleFormed) * Math.PI) / 180;
    if (Math.sin(angleFormedInRadians / 2) < 0.03) {
      setPerpendiculars(path[i - 1], point);
      return { bearings, leftPoints, rightPoints, width, maps };
    }
    const distance = width / (2 * Math.sin(angleFormedInRadians / 2));
    const heading1 = adjustAngle(heading - angleFormed / 2);
    const heading2 = adjustAngle(heading1 + 180);
    const p1 = computeOffset(point, distance, heading1);
    const p2 = computeOffset(point, distance, heading2);
    const p1LeftHeading = computeHeading(leftPoints[leftPoints.length - 1], p1);
    const p2LeftHeading = computeHeading(leftPoints[leftPoints.length - 1], p2);
    // OC: This line of code says: Is the slope of line p1 (m1) closest to the main line than the slope of line p2 (m2)?
    // Or Δmp1 < Δmp2
    const isP1Left =
      Math.abs(Math.abs(p1LeftHeading) - Math.abs(bearings[i - 1])) <
      Math.abs(Math.abs(p2LeftHeading) - Math.abs(bearings[i - 1]));
    leftPoints.push(isP1Left ? p1 : p2);
    rightPoints.push(isP1Left ? p2 : p1);
  }

  function setPerpendiculars(initialPoint, nextPoint) {
    const heading = computeHeading(initialPoint, nextPoint);
    const { left, right } = calculatePerpendiculars(heading);
    bearings.push(heading);
    leftPoints.push(computeOffset(point, width / 2, left));
    rightPoints.push(computeOffset(point, width / 2, right));
  }

  return { bearings, leftPoints, rightPoints, width, maps };
};

function areTheSamePoint(p1, p2) {
  return p1.lat() === p2.lat() && p1.lng() === p2.lng();
}
const calculatePerpendiculars = (bearing) => {
  const left = adjustAngle(bearing - 90);
  const right = adjustAngle(bearing + 90);

  return { left, right };
};

const adjustAngle = (currentAngle) => {
  if (Math.abs(currentAngle) > 180) {
    let angle = 360 - Math.abs(currentAngle);
    angle = currentAngle >= 0 ? angle * -1 : angle;
    return angle;
  }
  return currentAngle;
};
