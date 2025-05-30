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

import { getEnsembleSensors, getEnsembleSensorReadings } from '../util/ensemble.js';

const sensorController = {
  async getSensors(req, res) {
    const { farm_id } = req.headers;
    try {
      const { sensors, sensor_arrays } = await getEnsembleSensors(farm_id);

      return res.status(200).send({
        sensors,
        sensor_arrays,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status || 400).json({
        error: error.message || error,
      });
    }
  },
  async getSensorReadings(req, res) {
    const { farm_id } = req.headers;
    const { esids, startTime, endTime, truncPeriod } = req.query;

    try {
      const data = await getEnsembleSensorReadings({
        farm_id,
        esids,
        startTime,
        endTime,
        truncPeriod,
      });

      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      const status = error.status || error.code || 400;

      return res.status(status).json({
        error: error.message || error,
      });
    }
  },
};

export default sensorController;
