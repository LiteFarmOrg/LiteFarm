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

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../../../Table';
import Cell from '../../../Table/Cell';
import { ReactComponent as SensorIcon } from '../../../../assets/images/map/signal-01.svg';
import { Alignment, CellKind, TableKind, type TableV2Column } from '../../../Table/types';
import { type SensorInSimpleTableFormat } from '../../../../containers/AddSensors/types';
import styles from './styles.module.scss';
import { getDeviceType } from '../constants';

export enum SensorTableVariant {
  SIMPLE = 'simple',
}

type SensorTableProps = {
  data: SensorInSimpleTableFormat[]; // Currently supports only the "SIMPLE" variant
  variant: SensorTableVariant;
  showHeader?: boolean;
  isCompact: boolean;
};

const SensorTable = ({ data, variant, showHeader = true, isCompact }: SensorTableProps) => {
  const { t } = useTranslation();

  const commonColumns: TableV2Column[] = useMemo(() => {
    if (isCompact) {
      return [
        {
          id: 'external_id',
          label: t('SENSOR.ESCI.ENSEMBLE_ESID'),
          sortable: false,
          className: styles.idDeviceTypeCell,
          format: (d) => (
            <div className={styles.idDeviceTypeCellContent}>
              <div className={styles.idWithIcon}>
                <SensorIcon />
                <span>{d.external_id}</span>
              </div>
              <div className={styles.deviceType}>{getDeviceType(d.deviceTypeKey)}</div>
            </div>
          ),
        },
      ];
    }

    return [
      {
        id: 'external_id',
        label: t('SENSOR.ESCI.ENSEMBLE_ESID'),
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
        label: t('SENSOR.DETAIL.DEVICE_TYPE'),
        sortable: false,
        format: (d) => (
          <Cell
            kind={CellKind.PLAIN}
            className={styles.plainCell}
            text={getDeviceType(d.deviceTypeKey)}
          />
        ),
      },
    ];
  }, [isCompact, t]);

  const getColumns = (): TableV2Column[] => {
    if (variant === SensorTableVariant.SIMPLE) {
      return [
        ...commonColumns,
        {
          id: 'formattedDepth',
          label: t('SENSOR.DEPTH'),
          align: Alignment.RIGHT,
          sortable: false,
          className: styles.depthColumn,
          format: (d) => (
            <Cell kind={CellKind.PLAIN} className={styles.plainCell} text={d.formattedDepth} />
          ),
        },
      ];
    }
    return [];
  };

  return (
    <Table
      kind={TableKind.V2}
      columns={getColumns()}
      data={data}
      headerClass={styles.headerClass}
      tbodyClass={styles.tbodyClass}
      tableContainerClass={styles.tableContainerClass}
      showHeader={showHeader}
    />
  );
};

export default SensorTable;
