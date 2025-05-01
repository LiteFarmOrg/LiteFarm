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
import DescriptionListTile from '../Tile/DescriptionListTile';
import { generateKPIData } from './util';
import { System } from '../../types';
import type { IrrigationPrescription } from '../IrrigationPrescription/types';
import styles from './styles.module.scss';

interface IrrigationPrescriptionKPIProps {
  irrigationPrescription: IrrigationPrescription;
  system: System;
}

const IrrigationPrescriptionKPI = ({
  irrigationPrescription,
  system,
}: IrrigationPrescriptionKPIProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const kpiData = generateKPIData(irrigationPrescription, t, system);

  return (
    <dl className={styles.kpi}>
      {kpiData.map((dlTileProps) => (
        <DescriptionListTile {...dlTileProps} key={dlTileProps.label} />
      ))}
    </dl>
  );
};

export default IrrigationPrescriptionKPI;
