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
import { IrrigationData, IrrigationPolygonData } from './types';

interface CommonIrrigationPrescriptionProps {
  fieldLocation?: Location;
  pivotCenter: { lat: number; lng: number };
  pivotRadiusInMeters: number;
  system: System;
}

type PureIrrigationPrescriptionProps = CommonIrrigationPrescriptionProps &
  (
    | {
        vriZones: IrrigationPolygonData[];
        uriData?: never;
      }
    | {
        uriData: IrrigationData;
        vriZones?: never;
      }
  );

const PureIrrigationPrescription = ({
  fieldLocation,
  pivotCenter,
  pivotRadiusInMeters,
  vriZones,
  uriData,
  system,
}: PureIrrigationPrescriptionProps) => {
  const { t } = useTranslation();

  if (vriZones) {
    vriZones.sort((a, b) => a.application_depth - b.application_depth);
  }

  const tableInfo = vriZones
    ? vriZones.map(({ grid_points, ...zoneData }, index) => ({
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
        vriZones={vriZones}
        system={system}
      />
      <div className={styles.dataText}>{t('IRRIGATION_PRESCRIPTION.BASED_ON_DATA')}</div>
      <IrrigationPrescriptionTable data={tableInfo} />
    </div>
  );
};

export default PureIrrigationPrescription;
