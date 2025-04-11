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
import { convert } from '../../util/convert-units/convert';
import { useMaxZoom } from '../../containers/Map/useMaxZoom';
import LocationPicker from '../LocationPicker/SingleLocationPicker';
import { GestureHandling } from '../LocationPicker/SingleLocationPicker/types';
import { Location, System } from '../../types';
import { IRRIGATION_ZONE_COLOURS, EARTH_RADIUS, BRIGHT_PIVOT_COLOUR } from './constants';

interface IrrigationZonePolygon {
  grid_points: { lat: number; lng: number }[];
}

interface IrrigationPrescriptionMapViewProps {
  fieldLocation: Location;
  pivotCenter: { lat: number; lng: number };
  pivotRadiusInMeters: number;
  className?: string;
  vriZones?: IrrigationZonePolygon[];
  system?: System;
}

const IrrigationPrescriptionMapView = ({
  fieldLocation,
  pivotCenter,
  pivotRadiusInMeters,
  className,
  vriZones,
  system = 'metric',
}: IrrigationPrescriptionMapViewProps) => {
  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const pivotMapObjects = createPivotMapObjects(
    pivotCenter,
    pivotRadiusInMeters,
    !!vriZones?.length,
    (vriZones?.length || 0) > 3,
    system,
  );

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
        showOverlappingAreasModal={false}
        disableHover={true}
        gestureHandling={GestureHandling.COOPERATIVE}
      />
    </div>
  );
};

export default IrrigationPrescriptionMapView;

const createPivotMapObjects = (
  center: { lat: number; lng: number },
  radius: number,
  vriZonesPresent: boolean,
  moreThanThreeZones: boolean,
  system: System,
) => {
  const unit = system === 'imperial' ? 'ft' : 'm';

  const labelRadius =
    system === 'imperial' ? Math.round(convert(radius).from('m').to('ft')) : radius;

  const label = `${labelRadius}${unit}`;

  const pivot = {
    type: 'pivot',
    location_id: 'pivot',
    center,
    radius,
    name: label,
    ...(vriZonesPresent ? { fillOpacity: 0 } : {}),
    ...(moreThanThreeZones
      ? {
          markerColour: BRIGHT_PIVOT_COLOUR,
          lineColour: BRIGHT_PIVOT_COLOUR,
        }
      : {}),
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
    zIndex: 1, // render on top of pivot fill
    ...(moreThanThreeZones ? { lineColour: BRIGHT_PIVOT_COLOUR } : {}),
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
