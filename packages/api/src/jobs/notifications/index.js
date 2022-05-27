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

const axios = require('axios');
const Queue = require('bull');
const { sign } = require('jsonwebtoken');
const apiUrl = process.env.API_URL || 'http://localhost:5001';

const sendOnSchedule = (queueConfig) => {
  const driverQueue = new Queue('Scheduled notifications', queueConfig);
  const apiQueue = new Queue('LiteFarm API requests', queueConfig);
  /*
  The following table shows: 1) time zones as offsets from UTC, 2) UTC hour of local 6am standard time, and 3) local 6am ST date offset from UTC.
  Example: at 1600 Monday UTC, it is 0600 Tuesday in UTC+14.

| UTC offset(s)  | -11,13 | -10,14 | -9  | -8  | -7  | -6  | -5  | -4  | -3  | -2  | -1  | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| -------------- | ------ | ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6am ST as UTC  | 17     | 16     | 15  | 14  | 13  | 12  | 11  | 10  | 9   | 8   | 7   | 6   | 5   | 4   | 3   | 2   | 1   | 0   | 23  | 22  | 21  | 20  | 19  | 18  |
| -------------- | ------ | ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Date offset    |  0,1   |  0,1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 1   | 1   | 1   |
*/

  // At the top of every hour ...
  driverQueue.process((_, done) => {
    // ... find the UTC offsets where it just became 6am ...
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcDay = now.getUTCDay();
    const SUNDAY = 0;
    const MONDAY = SUNDAY + 1;

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
      console.log(`  from ${start} to ${end}`);

      const reqConfig = { headers: { Authorization: `Bearer ${token}` } };
      axios
        .get(`${apiUrl}/farm/utc_offset_by_range/${start}/${end}`, reqConfig)
        .then(function (res) {
          // For each farm ...
          for (const farmId of res.data) {
            // ... send daily 6am notifications ...
            apiQueue.add({ farmId, type: 'Daily', reqConfig });

            // ... and Monday 6am notifications if appropriate.
            if ((utcDay === MONDAY && timeZone < 7) || (utcDay === SUNDAY && timeZone >= 7)) {
              apiQueue.add({ farmId, type: 'Weekly', reqConfig });
            }
          }
        });
    }
    done();
  });

  // Create a recurring schedule.
  driverQueue.add({}, { repeat: { cron: '0 * * * *' } });

  apiQueue.process((job, done) => {
    const { type, farmId, reqConfig } = job.data;
    const urls = {
      Daily: 'time_notification/daily_due_today_tasks',
      Weekly: 'time_notification/weekly_unassigned_tasks',
    };
    axios.post(`${apiUrl}/${urls[type]}/${farmId}`, {}, reqConfig).then(function (res) {
      console.log(`  ${type} notifications for farm ${farmId}: status ${res.status}, ${res.data}`);
    });
    done();
  });
};

module.exports = {
  sendOnSchedule,
};
