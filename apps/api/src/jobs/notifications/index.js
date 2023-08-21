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

import axios from 'axios';

import Queue from 'bull';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
const apiUrl = process.env.API_URL || 'http://localhost:5001';
const mockTimer = !!process.env.MOCK_TIMER;

// UTC day to send weeklies for zones >= 7
// (Zero is Sunday.)
const WEEKLY_NOTIFICATION_DAY_EARLIER_ZONES =
  process.env.WEEKLY_NOTIFICATION_DAY_EARLIER_ZONES || 0;
// UTC day to send weeklies for zones < 7
const WEEKLY_NOTIFICATION_DAY_LATER_ZONES = (WEEKLY_NOTIFICATION_DAY_EARLIER_ZONES + 1) % 7;

const ONE_DAY = mockTimer ? 1000 * 60 * 24 : 1000 * 60 * 60 * 24;
let utcDay = mockTimer ? WEEKLY_NOTIFICATION_DAY_EARLIER_ZONES : undefined;
let utcHour = mockTimer ? 5 : undefined; // mock starts 2 "hours" before day shifts

/*
  The following table shows: 1) time zones as offsets from UTC, 2) UTC hour of local 6am standard time, and 3) local 6am ST date offset from UTC.
  Example: at 1600 Monday UTC, it is 0600 Tuesday in UTC+14.

| UTC offset(s)  | -11,13 | -10,14 | -9  | -8  | -7  | -6  | -5  | -4  | -3  | -2  | -1  | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| -------------- | ------ | ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6am ST as UTC  | 17     | 16     | 15  | 14  | 13  | 12  | 11  | 10  | 9   | 8   | 7   | 6   | 5   | 4   | 3   | 2   | 1   | 0   | 23  | 22  | 21  | 20  | 19  | 18  |
| -------------- | ------ | ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Date offset    |  0,1   |  0,1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 1   | 1   | 1   |
*/

const sendOnSchedule = (queueConfig) => {
  const driverQueue = new Queue('Schedule driver ', queueConfig);
  const apiQueue = new Queue('Notification API requests', queueConfig);

  // At the top of every hour ...
  driverQueue.process((job, done) => {
    // ... clean completed and failed API requests that have been in queue for 1 day ...
    apiQueue.clean(ONE_DAY);
    apiQueue.clean(ONE_DAY, 'failed');

    // ... find the UTC offsets where it just became 6am ...
    if (!mockTimer) {
      const now = new Date();
      utcDay = now.getUTCDay();
      utcHour = now.getUTCHours();
    }
    const timeZones = [6 - utcHour];
    if (timeZones[0] < -11) timeZones[0] += 24;
    if (timeZones[0] === -10 || timeZones[0] === -11) timeZones[1] = timeZones[0] + 24;

    console.log(
      `Scheduled notifications: UTC day ${utcDay}, ${utcHour}:00. It's now 6am at UTC offset(s) ${timeZones}`,
    );

    // ... and call the API to get farms for those offsets.
    const token = sign({ requestTimedNotifications: true }, process.env.JWT_SCHEDULER_SECRET, {
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    for (const timeZone of timeZones) {
      const start = 3600 * timeZone; // hours to seconds
      const end = 3600 * (timeZone + 1) - 1;
      console.log(`  offset range is ${start} to ${end} seconds`);

      const reqConfig = { headers: { Authorization: `Bearer ${token}` } };
      axios
        .get(`${apiUrl}/farm/utc_offset_by_range/${start}/${end}`, reqConfig)
        .then(function (res) {
          // For each farm ...
          for (const farmId of res.data) {
            // ... send daily 6am notifications ...
            apiQueue.add(
              { farmId, type: 'Daily', reqConfig, isDayLaterThanUtc: timeZone >= 7 },
              { jobId: `Daily-${utcDay}-${utcHour}-${farmId}` },
            );

            // ... and weekly 6am notifications if appropriate.
            if (
              (utcDay === WEEKLY_NOTIFICATION_DAY_LATER_ZONES && timeZone < 7) ||
              (utcDay === WEEKLY_NOTIFICATION_DAY_EARLIER_ZONES && timeZone >= 7)
            ) {
              apiQueue.add(
                { farmId, type: 'Weekly', reqConfig, isDayLaterThanUtc: timeZone >= 7 },
                { jobId: `Weekly-${utcDay}-${utcHour}-${farmId}` },
              );
            }
          }
        });
    }
    if (mockTimer && ++utcHour === 24) {
      utcHour = 0;
      utcDay = ++utcDay % 7;
    }

    done();
  });

  // Create a recurring schedule: top of each hour.
  // (Mock timer treats one real minute as one simulated hour.)
  driverQueue.add({}, { repeat: { cron: `${mockTimer ? '*' : '0'} * * * *` } });

  // Process a job for each API request.
  apiQueue.process((job, done) => {
    const { type, farmId, reqConfig, isDayLaterThanUtc } = job.data;
    const urls = {
      Daily: 'time_notification/daily_due_today_tasks',
      Weekly: 'time_notification/weekly_unassigned_tasks',
    };
    axios
      .post(`${apiUrl}/${urls[type]}/${farmId}`, { isDayLaterThanUtc }, reqConfig)
      .then(function (res) {
        if ([200, 201].includes(res.status)) {
          console.log(
            `  ${type} notifications for farm ${farmId}: status ${res.status}, ${res.data}`,
          );
          done();
        } else {
          console.log(`Retrying job ${job.jobId}`);
          job.retry();
        }
      });
  });
};

export default sendOnSchedule;
