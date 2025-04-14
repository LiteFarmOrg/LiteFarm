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
// @ts-nocheck

import Layout from '../Layout';
import layoutStyles from '../Layout/layout.module.scss';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import List from '../List';
import SensorListItem from '../List/ListItems/IconDescription/SensorListItem';
import { Status } from '../StatusIndicatorPill';
import { isLessThanTwelveHrsAgo } from '../../util/date-migrate-TS';
import { getDeviceType } from '../Sensor/v2/constants';
import { Variant } from '../RouterTab/Tab';
import { locationEnum } from '../../containers/Map/constants';
import ManageESciSection from '../ManageESciSection';
import Table from '../Table';
import { CellKind, TableKind, type TableV2Column } from '../Table/types';
import { History, Location } from 'history';
import { match } from 'react-router-dom';
import { IrrigationPrescription } from '../../store/api/types';
import Cell from '../Table/Cell';
import { partnerEntities } from '../../containers/AddSensors/constants';

type Tab = {};

type LocationIrrigationProps = {
  location: Location;
  history: History;
  match: match;
  irrigationPrescriptions: IrrigationPrescription[];
  handleClick: () => void;
  routerTabs: Tab[];
};

export default function PureLocationIrrigation({
  location,
  history,
  match,
  irrigationPrescriptions,
  routerTabs,
  handleClick,
}) {
  const { t } = useTranslation();

  const getPartnerName = (id) => {
    const partner = partnerEntities.find((partner) => id === partner.id);
    return partner ? partner.shortName : ' -- ';
  };

  const getColumns = (): TableV2Column[] => {
    return [
      {
        id: 'prescriptionDate',
        label: t('IRRIGATION_PRESCRIPTION.PRESCRIPTION_DATE').toLocaleUpperCase(),
        align: undefined,
        sortable: false,
        className: undefined,
        format: (data) => (
          <Cell kind={CellKind.PLAIN} className={undefined} text={data.prescription_date} />
        ),
      },
      {
        id: 'partnerName',
        label: t('IRRIGATION_PRESCRIPTION.DATA_FROM').toLocaleUpperCase(),
        align: undefined,
        sortable: false,
        className: undefined,
        format: (data) => (
          <Cell
            kind={CellKind.PLAIN}
            className={undefined}
            text={getPartnerName(data.partner_id)}
          />
        ),
      },
      {
        id: 'taskStatus',
        label: t('IRRIGATION_PRESCRIPTION.TASK_STATUS').toLocaleUpperCase(),
        align: undefined,
        sortable: false,
        className: undefined,
        format: (data) => <Cell kind={CellKind.PLAIN} className={undefined} text={'status'} />,
      },
      {
        id: 'irrigationPrescriptionLink',
        label: undefined,
        align: undefined,
        sortable: false,
        className: undefined,
        format: (data) => (
          <Cell kind={CellKind.RIGHT_CHEVRON_LINK} className={undefined} path={handleClick} />
        ),
      },
    ];
  };

  return (
    <Layout className={layoutStyles.paperContainer}>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
        variant={Variant.UNDERLINE}
      />
      <div className={styles.subtitle}>{t('IRRIGATION_PRESCRIPTION.IRRIGATION_PRESCRIPTIONS')}</div>
      <Table
        kind={TableKind.V2}
        columns={getColumns()}
        data={irrigationPrescriptions}
        headerClass={styles.headerClass}
        tbodyClass={styles.tbodyClass}
        tableContainerClass={styles.tableContainerClass}
        showHeader={true}
      />
    </Layout>
  );
}
