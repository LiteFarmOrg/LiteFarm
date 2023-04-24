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
import PureSensorDetail from '../../../../components/LocationDetailLayout/PointDetails/Sensor/index';
import { measurementSelector } from '../../../userFarmSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { sensorsSelector } from '../../../sensorSlice';
import { isAdminSelector } from '../../../userFarmSlice';
import { getSensorReadingTypes, getSensorBrand, retireSensor } from './saga';

export default function SensorDetail({ history, user, match }) {
  const dispatch = useDispatch();
  const location_id = match.params.location_id;
  const sensorInfo = useSelector(sensorsSelector(location_id));
  const system = useSelector(measurementSelector);
  const isAdmin = useSelector(isAdminSelector);

  useEffect(() => {
    if (sensorInfo === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      dispatch(getSensorReadingTypes({ location_id }));
      const partner_id = sensorInfo?.partner_id;
      dispatch(getSensorBrand({ location_id, partner_id }));
    }
  }, [sensorInfo]);

  const confirmRetire = () => {
    dispatch(retireSensor({ sensorInfo }));
  };

  return (
    <>
      {sensorInfo && !sensorInfo.deleted && (
        <PureSensorDetail
          history={history}
          isAdmin={isAdmin}
          system={system}
          sensorInfo={sensorInfo}
          handleRetire={confirmRetire}
        />
      )}
    </>
  );
}
