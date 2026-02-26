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

import { useLocation } from 'react-router-dom';
import Loading from '../../components/Form/ContextForm/Loading';
import PureEsciSensors from '../../components/Sensor/v2/EsciSensorList';
import useGroupedSensors from './useGroupedSensors';
import { partnerIds, PARTNERS } from '../AddSensors/constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';

interface SensorListProps {
  isCompactSideMenu: boolean;
}

const SensorList = ({ isCompactSideMenu }: SensorListProps) => {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location?.search);
  const partnerId = urlSearchParams.get('partner_id');
  const userFarm = useSelector(userFarmSelector);

  // Filter sensors by partnerId once we support more than just Ensemble.
  const { isLoading, groupedSensors, sensorSummary } = useGroupedSensors();

  if (isLoading) {
    const dataName = partnerId
      ? Object.values(PARTNERS).find(({ id }) => id === +partnerId)?.shortName
      : '';
    return <Loading dataName={dataName} isCompactSideMenu={isCompactSideMenu} />;
  }

  if (partnerId === null || !partnerIds.includes(+partnerId)) {
    return null;
  }

  // Should return the appropriate component based on partnerId (currently only supports Ensemble)
  return (
    <PureEsciSensors
      groupedSensors={groupedSensors}
      summary={sensorSummary}
      // @ts-expect-error - Selector return empty object without property
      userFarm={userFarm}
    />
  );
};

export default SensorList;
