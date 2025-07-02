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

import cron from 'node-cron';
import axios from 'axios';
import jwt from 'jsonwebtoken';
const { sign } = jwt;

const apiUrl = process.env.API_URL || 'http://localhost:5001';
const mockTimer = !!process.env.MOCK_TIMER;

const endpointSchedules = [
  {
    type: 'IrrigationPrescriptionRequest',
    cron: '30 10 * * *', // 04:30 MDT (10:30 UTC)
    method: 'post',
    path: '/irrigation_prescription_request/scheduler',
    params: {
      shouldSend: true,
      allOrgs: true,
    },
  },
];

export default function scheduleApiRequests() {
  endpointSchedules.forEach(({ type, cron: cronExpression, method, path, params }) => {
    const schedule = mockTimer ? '* * * * *' : cronExpression;

    console.log(`Scheduling ${type} with cron: ${schedule}`);

    cron.schedule(schedule, async () => {
      try {
        const token = sign({ requestScheduledEndpoint: true }, process.env.JWT_SCHEDULER_SECRET, {
          expiresIn: '1d',
          algorithm: 'HS256',
        });

        const res = await axios.request({
          method,
          url: `${apiUrl}${path}`,
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`${type} success with status ${res.status}`);
      } catch (err) {
        console.error(`${type} request failed:`, err.message);

        if (err.response) {
          console.error(`Status: ${err.response.status}, Data:`, err.response.data);
        }
      }
    });
  });
}
