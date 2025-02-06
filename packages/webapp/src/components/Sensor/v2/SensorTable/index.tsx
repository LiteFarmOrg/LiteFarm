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

import i18n from '../../../../locales/i18n';
import Table from '../../../Table';
import Cell from '../../../Table/Cell';
import { Alignment, CellKind, TableKind, type TableV2Column } from '../../../Table/types';
import { SensorInSimpleTableFormat } from '../../../../containers/LocationDetails/PointDetails/SensorDetail/v2/types';
import styles from './styles.module.scss';

const SUPPORTED_DEVICE_TYPES = [
  'DRIP_LINE_PRESSURE_SENSOR',
  'IR_TEMPERATURE_SENSOR',
  'SOIL_WATER_POTENTIAL_SENSOR',
  'WEATHER_STATION',
  'WIND_SPEED_SENSOR',
];

export enum SensorTableVariant {
  SIMPLE = 'simple',
}

const commonColumns: TableV2Column[] = [
  {
    id: 'external_id',
    label: i18n.t('SENSOR.ESCI.ENSEMBLE_ESID'),
    sortable: false,
    format: (d) => (
      <Cell
        kind={CellKind.ICON_TEXT}
        iconName="SENSOR"
        text={d.external_id}
        className={styles.sensorIdCell}
      />
    ),
  },
  {
    id: 'deviceType',
    label: i18n.t('SENSOR.DETAIL.DEVICE_TYPE'),
    sortable: false,
    format: (d) => {
      const key = d.name.toUpperCase().replaceAll(' ', '_');
      // t('SENSOR.DEVICE_TYPES.DRIP_LINE_PRESSURE_SENSOR')
      // t('SENSOR.DEVICE_TYPES.IR_TEMPERATURE_SENSOR')
      // t('SENSOR.DEVICE_TYPES.SOIL_WATER_POTENTIAL_SENSOR')
      // t('SENSOR.DEVICE_TYPES.WEATHER_STATION')
      // t('SENSOR.DEVICE_TYPES.WIND_SPEED_SENSOR')
      return (
        <Cell
          kind={CellKind.PLAIN}
          className={styles.plainCell}
          text={
            SUPPORTED_DEVICE_TYPES.includes(key) ? i18n.t(`SENSOR.DEVICE_TYPES.${key}`) : d.name
          }
        />
      );
    },
  },
];

const simpleColumns: TableV2Column[] = [
  ...commonColumns,
  {
    id: 'formattedDepth',
    label: i18n.t('SENSOR.DEPTH'),
    align: Alignment.RIGHT,
    sortable: false,
    format: (d) => (
      <Cell kind={CellKind.PLAIN} className={styles.plainCell} text={d.formattedDepth} />
    ),
  },
];

const columns = {
  [SensorTableVariant.SIMPLE]: simpleColumns,
};

type SensorTableProps = {
  data: SensorInSimpleTableFormat[]; // Currently supports only the "SIMPLE" variant
  variant: SensorTableVariant;
  showHeader?: boolean;
};

const SensorTable = ({ data, variant, showHeader = true }: SensorTableProps) => {
  return (
    <Table
      kind={TableKind.V2}
      columns={columns[variant]}
      data={data}
      headerClass={styles.headerClass}
      tbodyClass={styles.tbodyClass}
      tableContainerClass={styles.tableContainerClass}
      showHeader={showHeader}
    />
  );
};

export default SensorTable;
