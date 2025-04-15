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
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import Table from '../Table';
import Cell from '../Table/Cell';
import { Alignment, CellKind, TableKind } from '../Table/types';
import { IRRIGATION_ZONE_COLOURS } from './constants';
import type { IrrigationPrescriptionTableInfo } from './types';

interface IrrigationPrescriptionTableProps {
  data: IrrigationPrescriptionTableInfo[];
}

export default function IrrigationPrescriptionTable({ data }: IrrigationPrescriptionTableProps) {
  const { t } = useTranslation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const vriZonesPresent = data && data.length > 1;

  const irrigationPrescriptionColumns = useMemo(
    () => [
      {
        id: vriZonesPresent ? 'zone' : null,
        label: t('IRRIGATION_PRESCRIPTION.IRRIGATION_ZONE'),
        format: (d: IrrigationPrescriptionTableInfo) => {
          const zoneColour = getZoneColour(d.id);
          return (
            <Cell
              iconName={'DOT'}
              kind={CellKind.ICON_TEXT}
              text={`${t('IRRIGATION_PRESCRIPTION.ZONE')} ${d.id + 1}`}
              className={styles.irrigationZoneCell}
              style={{ '--zone-colour': zoneColour } as React.CSSProperties}
            />
          );
        },
        sortable: false,
      },
      {
        id: !vriZonesPresent || !isMobile ? 'soil_moisture_deficit' : null,
        label: t('IRRIGATION_PRESCRIPTION.SOIL_MOISTURE_DEFICIT'),
        format: (d: IrrigationPrescriptionTableInfo) => (
          <Cell
            kind={CellKind.PLAIN}
            text={`${d.soil_moisture_deficit}%`}
            className={styles.tableText}
          />
        ),
        sortable: false,
        align: vriZonesPresent ? Alignment.RIGHT : Alignment.LEFT,
      },
      {
        id: 'application_depth',
        label: t('IRRIGATION_PRESCRIPTION.APPLICATION_DEPTH'),
        format: (d: IrrigationPrescriptionTableInfo) => (
          <Cell
            kind={CellKind.PLAIN}
            text={`${d.application_depth}${d.application_depth_unit}`}
            className={styles.tableText}
          />
        ),
        sortable: false,
        align: vriZonesPresent || isMobile ? Alignment.RIGHT : Alignment.LEFT,
      },
    ],
    [isMobile, vriZonesPresent],
  );

  return (
    <Table
      kind={TableKind.V2}
      columns={irrigationPrescriptionColumns}
      data={data}
      headerClass={styles.tableHeader}
      tbodyClass={styles.tableBody}
      alternatingRowColor={true}
      shouldFixTableLayout={true}
    />
  );
}

const getZoneColour = (id: number): string =>
  IRRIGATION_ZONE_COLOURS[id % IRRIGATION_ZONE_COLOURS.length];
