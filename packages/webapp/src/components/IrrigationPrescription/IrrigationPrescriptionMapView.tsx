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

interface IrrigationPrescriptionMapViewProps {
  fieldLocation: Location;
  pivotCenter: { lat: number; lng: number };
  pivotRadius: number; // in meters
  className?: string;
}

const IrrigationPrescriptionMapView = ({
  fieldLocation,
  pivotCenter,
  pivotRadius,
  className,
}: IrrigationPrescriptionMapViewProps) => {
  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const pivotMapObjects = createPivotMapObjects(pivotCenter, pivotRadius);

  const { name, ...fieldLocationWithoutLabel } = fieldLocation;

  return (
    <div className={clsx(className, styles.mapContainer)}>
      <LocationPicker
        onSelectLocation={() => {}}
        locations={[fieldLocationWithoutLabel, ...pivotMapObjects]}
        selectedLocationIds={[]}
        farmCenterCoordinate={pivotCenter}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
      />
    </div>
  );
};

export default IrrigationPrescriptionMapView;

const createPivotMapObjects = (center: { lat: number; lng: number }, radius: number) => {
  const label = `${radius}m`; // TODO: units

  const pivot = {
    type: 'pivot',
    location_id: 'pivot',
    center,
    radius,
    name: label,
  };

  // Calculate the endpoint on the circle's circumference (eastward) [Source: Copilot]
  const earthRadius = 6378137; // in meters
  const latRad = center.lat * (Math.PI / 180);
  const deltaLng = (radius / (earthRadius * Math.cos(latRad))) * (180 / Math.PI);
  const endpoint = { lat: center.lat, lng: center.lng + deltaLng };

  const pivotArm = {
    type: 'pivot_arm',
    location_id: 'pivot_arm',
    line_points: [center, endpoint],
    width: 2,
  };

  return [pivot, pivotArm];
};
