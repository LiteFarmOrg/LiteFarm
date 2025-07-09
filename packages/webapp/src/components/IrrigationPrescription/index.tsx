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

import styles from './styles.module.scss';
import { Location, System } from '../../types';
import IrrigationPrescriptionMapView from '../../components/IrrigationPrescription/IrrigationPrescriptionMapView';
import IrrigationPrescriptionTable from '../../components/IrrigationPrescription/IrrigationPrescriptionTable';
import { UriPrescriptionData, VriPrescriptionData } from './types';
import { Point } from '../../util/geoUtils';

interface CommonIrrigationPrescriptionProps {
  fieldLocation?: Location;
  pivotCenter: Point;
  pivotRadiusInMeters: number;
  pivotArc?: {
    start_angle: number;
    end_angle: number;
  };
  system: System;
}

type PureIrrigationPrescriptionProps = CommonIrrigationPrescriptionProps &
  (
    | {
        vriData: VriPrescriptionData[];
        uriData?: never;
      }
    | {
        uriData: UriPrescriptionData;
        vriData?: never;
      }
  );

const PureIrrigationPrescription = ({
  fieldLocation,
  pivotCenter,
  pivotRadiusInMeters,
  pivotArc,
  vriData,
  uriData,
  system,
}: PureIrrigationPrescriptionProps) => {
  const sortedVriData = vriData
    ? [...vriData].sort((a, b) => a.application_depth - b.application_depth)
    : undefined;

  const tableInfo = sortedVriData
    ? sortedVriData.map(({ grid_points, ...zoneData }, index) => ({
        ...zoneData,
        id: index,
      }))
    : [
        {
          ...(uriData as UriPrescriptionData),
          id: 1,
        },
      ];

  return (
    <div className={styles.ipViewContainer}>
      <IrrigationPrescriptionMapView
        fieldLocation={fieldLocation}
        pivotCenter={pivotCenter}
        pivotRadiusInMeters={pivotRadiusInMeters}
        pivotArc={pivotArc}
        vriZones={sortedVriData}
        system={system}
      />
      <IrrigationPrescriptionTable data={tableInfo} />
    </div>
  );
};

export default PureIrrigationPrescription;
