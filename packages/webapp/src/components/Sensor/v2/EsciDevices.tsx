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

import { TFunction, useTranslation } from 'react-i18next';
import { VscLocation } from 'react-icons/vsc';
import Table from '../../Table';
import { Alignment, TableKind, TableV2Column } from '../../Table/types';
import { ReactComponent as SensorIcon } from '../../../assets/images/farmMapFilter/Sensor.svg';
import { Main } from '../../Typography';
import TextButton from '../../Form/Button/TextButton';
import { Location } from '../../../types';
import styles from './styles.module.scss';

function createData(id: string, deviceType: string, depth: string) {
  return { id, deviceType, depth };
}

const rows = [
  createData('5N626V', 'Soil Water Potential Sensor', '10cm'),
  createData('9MIVGN', 'Soil Water Potential Sensor', '20cm'),
  createData('BFIVBK', 'Soil Water Potential Sensor', '30cm'),
  createData('EBX5XQ', 'Soil Water Potential Sensor', '40cm'),
];

const SensorTable = ({
  data,
  columns,
}: {
  data: { id: string; deviceType: string; depth: string }[];
  columns: TableV2Column[];
}) => {
  return (
    <Table
      kind={TableKind.V2}
      columns={columns}
      data={data}
      headerClass={styles.headerClass}
      tbodyClass={styles.tbodyClass}
      tableContainerClass={styles.tableContainerClass}
    />
  );
};

const DetectedFields = ({ locations = [], t }: { locations: Location[]; t: TFunction }) => {
  if (!locations.length) {
    return null;
  }
  return (
    <div>
      <Main className={styles.fieldListLead}>{t('SENSOR.DETAIL.DITECTED_FIELD')}</Main>
      <ul className={styles.fieldList}>
        {locations.map(({ name }) => {
          return <li key={name}>{name}</li>;
        })}
      </ul>
    </div>
  );
};

const EsciDevices = () => {
  const { t } = useTranslation();

  const columns: TableV2Column[] = [
    {
      id: 'id',
      label: t('SENSOR.ESCI.ENSEMBLE_ESID'),
      sortable: false,
      format: (d) => (
        <div className={styles.sensorIdCell}>
          <SensorIcon />
          {d.id}
        </div>
      ),
    },
    {
      id: 'deviceType',
      label: t('SENSOR.DETAIL.DEVICE_TYPE'),
      sortable: false,
    },
    {
      id: 'depth',
      label: t('SENSOR.DEPTH'),
      align: Alignment.RIGHT,
      sortable: false,
    },
  ];

  return (
    <div className={styles.diviceInfo}>
      <SensorTable columns={columns} data={rows} />
      <DetectedFields
        t={t}
        locations={[
          { name: 'North-West field', location_id: 'id' },
          { name: 'Apple field', location_id: 'id' },
        ]}
      />
      <TextButton className={styles.seeOnMapButton}>
        <VscLocation size={24} className={styles.mapPinIcon} />
        {t('common:SEE_ON_MAP')}
      </TextButton>
    </div>
  );
};

export default EsciDevices;
