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

import { Request, Response } from 'express';
import baseController from './baseController.js';
import FarmModel from '../models/farmModel.js';
import weatherService from '../services/weatherService.js';
import { HttpError } from '../types.js';

const weatherController = {
  // GET /weather — backward-compatible superset. Served to the cached legacy
  // WeatherBoard bundle and the released WeatherForecast bundle, which both
  // request this URL. New bundles use getWeatherForecast below.
  async getWeather(req: Request, res: Response) {
    try {
      const farm_id = req.headers['farm_id'];
      const [row] = await baseController.getIndividual(FarmModel, farm_id);

      if (!row) {
        return res.sendStatus(404);
      }

      const weather = await weatherService.fetchLegacyForecast({
        lat: row.grid_points.lat,
        lon: row.grid_points.lng,
        units: row.units.measurement,
      });

      res.status(200).send(weather);
    } catch (error: unknown) {
      console.error(error);
      res.status((error as HttpError).status || 500).json({ error });
    }
  },

  async getWeatherForecast(req: Request, res: Response) {
    try {
      const farm_id = req.headers['farm_id'];
      const [row] = await baseController.getIndividual(FarmModel, farm_id);

      if (!row) {
        return res.sendStatus(404);
      }

      const weatherForecast = await weatherService.fetchForecast({
        lat: row.grid_points.lat,
        lon: row.grid_points.lng,
      });

      res.status(200).send(weatherForecast);
    } catch (error: unknown) {
      console.error(error);
      res.status((error as HttpError).status || 500).json({ error });
    }
  },
};

export default weatherController;
