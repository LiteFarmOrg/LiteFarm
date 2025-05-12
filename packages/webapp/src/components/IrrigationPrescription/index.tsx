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

import { useTranslation } from 'react-i18next';
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
  vriData,
  uriData,
  system,
}: PureIrrigationPrescriptionProps) => {
  const { t } = useTranslation();

  if (vriData) {
    vriData.sort((a, b) => a.application_depth - b.application_depth);
  }

  const tableInfo = vriData
    ? vriData.map(({ grid_points, ...zoneData }, index) => ({
        ...zoneData,
        id: index,
      }))
    : [
        {
          ...uriData,
          id: 1,
        },
      ];

  return (
    <div className={styles.ipViewContainer}>
      <IrrigationPrescriptionMapView
        fieldLocation={fieldLocation}
        pivotCenter={pivotCenter}
        pivotRadiusInMeters={pivotRadiusInMeters}
        vriZones={vriData}
        system={system}
      />
      <IrrigationPrescriptionTable data={tableInfo} />
    </div>
  );
};

export default PureIrrigationPrescription;
