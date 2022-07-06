/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
import PureSensorDetail from '../../../../components/LocationDetailLayout/Sensor/SensorDetail/index';
import { measurementSelector } from '../../../userFarmSlice';
import { tasksFilterSelector } from '../../../filterSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { sensorsSelector } from '../../../sensorSlice';
import { isAdminSelector } from '../../../userFarmSlice';
import { getSensorReadingTypes, getSensorBrand } from './saga';

export default function SensorDetail({ history, user, match }) {
  const dispatch = useDispatch();
  const location_id = match.params.location_id;
  const sensorInfo = useSelector(sensorsSelector(location_id));

  const { sensor_id, partner_id } = sensorInfo;
  useEffect(() => {
    dispatch(getSensorReadingTypes({ location_id, sensor_id }));
    dispatch(getSensorBrand({ location_id, partner_id }));
  });

  const system = useSelector(measurementSelector);

  const { t } = useTranslation();

  const isAdmin = useSelector(isAdminSelector);

  return (
    <PureSensorDetail history={history} isAdmin={isAdmin} system={system} sensorInfo={sensorInfo} />
  );
}
