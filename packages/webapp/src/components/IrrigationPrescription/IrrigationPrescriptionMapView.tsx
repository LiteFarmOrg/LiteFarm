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

import clsx from 'clsx';
import styles from './styles.module.scss';
import { useMaxZoom } from '../../containers/Map/useMaxZoom';
import LocationPicker from '../LocationPicker/SingleLocationPicker';
import { Location } from '../../types';
import { IRRIGATION_ZONE_COLOURS, EARTH_RADIUS } from './constants';

interface IrrigationZonePolygon {
  grid_points: { lat: number; lng: number }[];
}

interface IrrigationPrescriptionMapViewProps {
  fieldLocation: Location;
  pivotCenter: { lat: number; lng: number };
  pivotRadius: number; // in meters
  className?: string;
  vriZones?: IrrigationZonePolygon[];
}

const IrrigationPrescriptionMapView = ({
  fieldLocation,
  pivotCenter,
  pivotRadius,
  className,
  vriZones,
}: IrrigationPrescriptionMapViewProps) => {
  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const vriZonesPresent = !!vriZones?.length;

  const pivotMapObjects = createPivotMapObjects(pivotCenter, pivotRadius, vriZonesPresent);

  const irrigationZoneMapObjects = vriZones ? createIrrigationZoneMapObjects(vriZones) : [];

  return (
    <div className={clsx(className, styles.mapContainer)}>
      <LocationPicker
        onSelectLocation={() => {}}
        locations={[fieldLocation, ...irrigationZoneMapObjects, ...pivotMapObjects]}
        selectedLocationIds={[]}
        farmCenterCoordinate={pivotCenter}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
        showControls={false}
        disableHover={true}
        disableOverlappingAreasModal={true}
      />
    </div>
  );
};

export default IrrigationPrescriptionMapView;

const createPivotMapObjects = (
  center: { lat: number; lng: number },
  radius: number,
  vriZonesPresent: boolean,
) => {
  const label = `${radius}m`; // TODO: units

  const pivot = {
    type: 'pivot',
    location_id: 'pivot',
    center,
    radius,
    name: label,
    ...(vriZonesPresent ? { fillOpacity: 0 } : {}),
  };

  // Calculate the endpoint on the circle's circumference (eastward) [Source: Copilot]
  const latRad = center.lat * (Math.PI / 180);
  const deltaLng = (radius / (EARTH_RADIUS * Math.cos(latRad))) * (180 / Math.PI);
  const endpoint = { lat: center.lat, lng: center.lng + deltaLng };

  const pivotArm = {
    type: 'pivot_arm',
    location_id: 'pivot_arm',
    line_points: [center, endpoint],
    width: 2,
  };

  return [pivot, pivotArm];
};

const createIrrigationZoneMapObjects = (zonePolygons: IrrigationZonePolygon[]) => {
  return zonePolygons.map((zone, index) => {
    const zoneMapLocation = {
      type: 'irrigation_zone',
      location_id: `zone_${index}`,
      grid_points: zone.grid_points,
      fillOpacity: 1,
      colour: getIrrigationZoneColour(index),
      strokeColour: getIrrigationZoneColour(index),
    };

    return zoneMapLocation;
  });
};

const getIrrigationZoneColour = (index: number): string => {
  return IRRIGATION_ZONE_COLOURS[index % IRRIGATION_ZONE_COLOURS.length];
};
