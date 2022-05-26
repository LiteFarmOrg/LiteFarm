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

// const http = require('http');
const Queue = require('bull');
// const { sign } = require('jsonwebtoken');

const sendOnSchedule = (queueConfig) => {
  // const token = sign({ requestTimedNotifications: true }, process.env.JWT_SCHEDULER_SECRET, {
  //   expiresIn: '1d',
  //   algorithm: 'HS256',
  // });

  // const apiCall = {
  //   method: 'POST',
  //   hostname: 'localhost',
  //   port: 5001,
  //   headers: { 'Authorization': `Bearer ${token}` },
  //   agent: false,  // Create a new agent just for this one request
  // };

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

  let utcHour = 0;
  let utcDay = 0;
  // At the top of every hour ...
  driverQueue.process(() => {
    // ... find the UTC offsets where it just became 6am ...
    // const now = new Date();
    // const utcHour = now.getUTCHours();
    // const utcDay = now.getUTCDay();
    const SUNDAY = 0;
    const MONDAY = SUNDAY + 1;

    const timeZones = [6 - utcHour];
    if (timeZones[0] < -11) timeZones[0] += 24;
    if (timeZones[0] === -10 || timeZones[0] === -11) timeZones[1] = timeZones[0] + 24;

    console.log(`UTC day ${utcDay}, ${utcHour}:00 - it's now 6am at UTC offset(s) ${timeZones}`);

    // ... and call the API to get farms for those offsets.
    for (const timeZone of timeZones) {
      const start = 3600 * timeZone; // hours to seconds
      const end = 3600 * (timeZone + 1);
      console.log(`  Get farms for UTC ${timeZone}: offsets of ${start} to ${end} seconds`);
      // const req = http.request({ ...apiCall, 'api url to get farms by utc'}, (res) => {
      const farmIds = /* req.body */ ['0742f4b2-dc62-11ec-8b99-117de431eaf4'];

      // For each farm ...
      for (const farmId of farmIds) {
        // ... send daily 6am notifications ...
        apiQueue.add({ path: `/time_notification/daily_due_today_tasks/${farmId}` });
        console.log('  daily');
        if ((utcDay === MONDAY && timeZone < 7) || (utcDay === SUNDAY && timeZone >= 7)) {
          // ... and Monday 6am notifications if appropriate.
          apiQueue.add({ path: `/time_notification/weekly_unassigned_tasks/${farmId}` });
          console.log('  weekly');
        }
      }
      //   });
      //   req.on('error', (err) => {
      //     console.error(`Problem getting farms by UTC: ${err.message}`);
      //   });
      //   req.end();
      // });
    }

    utcHour = (utcHour + 1) % 24; // TODO remove for real
    if (utcHour === 0) utcDay = ++utcDay % 7; // TODO remove for real
  });

  // Create a recurring schedule.
  driverQueue.add({}, { repeat: { every: 1000 } }); // TODO use top of every hour for real

  apiQueue.process((/* job */) => {
    //   const req = http.request({ ...apiCall, ...job.data }, (res) => {
    //     console.log('    ', res.statusCode, res.statusMessage, job.data?.path)
    //   });
    //   req.on('error', (err) => {
    //     console.error(`Problem with API request to ${job.data?.path}: ${err.message}`);
    //   });
    //   req.end();
  });
};

module.exports = {
  sendOnSchedule,
};
