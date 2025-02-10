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

import { History } from 'history';
import Loading from '../../components/Form/ContextForm/Loading';
import PureEsciSensors from '../../components/Sensor/v2/EsciSensors';
import useGroupedSensors from '../Sensor/useGroupedSensors';
import { partnerIds } from '../LocationDetails/PointDetails/SensorDetail/v2/constants';

interface SensorListProps {
  isCompactSideMenu: boolean;
  history: History;
}

const SensorList = ({ isCompactSideMenu, history }: SensorListProps) => {
  const urlSearchParams = new URLSearchParams(history.location?.search);
  const partnerId = urlSearchParams.get('partner_id');

  // Filter sensors by partnerId once we support more than just Ensemble.
  const { isLoading, groupedSensors, sensorSummary } = useGroupedSensors();

  if (isLoading) {
    return <Loading isCompactSideMenu={isCompactSideMenu} />;
  }

  if (partnerId === null || !partnerIds.includes(+partnerId)) {
    return null;
  }

  // Should return the appropriate component based on partnerId (currently only supports Ensemble)
  return <PureEsciSensors groupedSensors={groupedSensors} summary={sensorSummary} />;
};

export default SensorList;
