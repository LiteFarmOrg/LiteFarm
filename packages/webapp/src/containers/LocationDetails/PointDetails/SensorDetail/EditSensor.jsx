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
import EditSensor from '../../../../components/Sensor/EditSensor';
import { measurementSelector, userFarmSelector } from '../../../userFarmSlice';
import { useTranslation } from 'react-i18next';
import { sensorsSelector } from '../../../sensorSlice';
import { useRef } from 'react';
import produce from 'immer';
import { patchSensor } from './saga';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

export default function UpdateSensor() {
  let navigate = useNavigate();
  let { location_id } = useParams();
  const dispatch = useDispatch();
  const sensorInfo = useSelector(sensorsSelector(location_id));
  const system = useSelector(measurementSelector);
  const user = useSelector(userFarmSelector);

  const { t } = useTranslation();
  const filterRef = useRef({});

  const SOIL_WATER_CONTENT = 'SOIL_WATER_CONTENT';
  const SOIL_WATER_POTENTIAL = 'SOIL_WATER_POTENTIAL';
  const TEMPERATURE = 'TEMPERATURE';
  const STATUS = 'STATUS';

  const statuses = [SOIL_WATER_CONTENT, SOIL_WATER_POTENTIAL, TEMPERATURE];

  const initialReadingTypes = sensorInfo.sensor_reading_types;
  const contains_soil_water_content = initialReadingTypes.includes(SOIL_WATER_CONTENT.toLowerCase())
    ? true
    : false;
  const contains_soil_water_potential = initialReadingTypes.includes(
    SOIL_WATER_POTENTIAL.toLowerCase(),
  )
    ? true
    : false;
  const contains_temperature = initialReadingTypes.includes(TEMPERATURE.toLowerCase())
    ? true
    : false;

  const defaultReadings = {
    STATUS: {
      SOIL_WATER_CONTENT: { active: contains_soil_water_content },
      SOIL_WATER_POTENTIAL: { active: contains_soil_water_potential },
      TEMPERATURE: { active: contains_temperature },
    },
  };

  const filter = {
    subject: t('SENSOR.READING.TYPES'),
    filterKey: STATUS,
    options: statuses.map((status) => ({
      value: status.toLowerCase(),
      default: defaultReadings[STATUS][status].active,
      label: t(`SENSOR.READING.${status}`),
    })),
  };

  const onSubmit = (data) => {
    const sensorData = produce(data, (data) => {
      data.user_id = user.user_id;
      data.latitude = parseFloat(data.latitude);
      data.longtitude = parseFloat(data.longtitude);
      data.farm_id = sensorInfo.farm_id;
      data.location_id = sensorInfo.location_id;
    });
    dispatch(patchSensor(getProcessedFormData(sensorData)));
  };

  const onBack = () => {
    navigate(`/sensor/${location_id}/details`);
  };

  return (
    <>
      <EditSensor
        onSubmit={onSubmit}
        onBack={onBack}
        system={system}
        filter={filter}
        filterRef={filterRef}
        sensorInfo={sensorInfo}
      />
    </>
  );
}
