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

import layoutStyles from '../Layout/layout.module.scss';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { getIntlDate } from '../../util/date-migrate-TS';
import { Variant } from '../RouterTab/Tab';
import Table from '../Table';
import { Alignment, CellKind, TableKind, type TableV2Column } from '../Table/types';
import { History } from 'history';
import { IrrigationPrescription } from '../../store/api/types';
import Cell from '../Table/Cell';
import { partnerEntities } from '../../containers/AddSensors/constants';
import clsx from 'clsx';
import { Location } from '../../types';
import { LocationTab } from '../../containers/LocationDetails/types';
import CardLayout from '../Layout/CardLayout';

type LocationIrrigationProps = {
  location: Location;
  history: History;
  irrigationPrescriptions: IrrigationPrescription[];
  routerTabs: LocationTab[];
  isCompact: boolean;
};

export default function PureLocationIrrigation({
  location,
  history,
  irrigationPrescriptions,
  routerTabs,
  isCompact,
}: LocationIrrigationProps) {
  const { t } = useTranslation();

  const getPartnerName = (id: number) => {
    const partner = partnerEntities.find((partner) => id === partner.id);
    return partner ? partner.shortName : ' — ';
  };

  const getColumns = (): TableV2Column[] => {
    return [
      {
        id: 'prescriptionDate',
        label: t('IRRIGATION_PRESCRIPTION.PRESCRIPTION_DATE').toLocaleUpperCase(),
        sortable: false,
        className: styles.tableCell,
        format: (data) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            iconName="CALENDAR"
            className={styles.dateCell}
            text={getIntlDate(data.recommended_start_datetime)}
          />
        ),
      },
      {
        id: 'partnerName',
        label: t('IRRIGATION_PRESCRIPTION.DATA_FROM').toLocaleUpperCase(),
        sortable: false,
        className: styles.tableCell,
        format: (data) => <Cell kind={CellKind.PLAIN} text={getPartnerName(data.partner_id)} />,
      },
      {
        id: 'taskStatus',
        label: t('IRRIGATION_PRESCRIPTION.TASK_STATUS').toLocaleUpperCase(),
        sortable: false,
        // text only alignment
        align: isCompact ? Alignment.RIGHT : Alignment.LEFT,
        // compact right alignment
        className: clsx(styles.tableCell, isCompact && styles.compactTableCell),
        format: (data) =>
          data.task ? (
            <Cell
              kind={CellKind.TASK_STATUS_INDICATOR_PILL}
              color={data.task.status}
              label={t(`TASK.STATUS.${data.task.status.toUpperCase()}`)}
              taskId={data.task.task_id}
            />
          ) : (
            <Cell kind={CellKind.PLAIN} text={'—'} />
          ),
      },
      {
        id: 'irrigationPrescriptionLink',
        align: Alignment.RIGHT,
        sortable: false,
        className: styles.tableCell,
        format: (data) => (
          <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={`/irrigation_prescription/${data.id}`} />
        ),
      },
    ];
  };

  return (
    <CardLayout className={layoutStyles.paperContainer}>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        tabs={routerTabs}
        variant={Variant.UNDERLINE}
      />
      <h2 className={styles.subtitle}>{t('IRRIGATION_PRESCRIPTION.IRRIGATION_PRESCRIPTIONS')}</h2>
      <Table
        kind={TableKind.V2}
        columns={getColumns()}
        data={irrigationPrescriptions}
        dense={false}
        tableContainerClass={styles.tableContainer}
        headerClass={styles.tableHeader}
        rowClass={styles.tableRow}
        tbodyClass={styles.tableBody}
        showHeader={isCompact ? false : true}
      />
    </CardLayout>
  );
}
