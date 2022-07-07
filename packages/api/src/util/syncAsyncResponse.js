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

/**
 * This has an internal timer and returns a function which will send the appropriate response based on the timer.
 * @param {Object} res - the response object for the route.
 * @param {Number} time - the number of milliseconds before it switches to the async response.
 * @return {{sendResponse: ((function(function, function): Promise<*>)|*)}}
 */
const syncAsyncResponse = (res, time = 5000) => {
  let hasTimedOut = false;
  const timer = setTimeout(() => {
    hasTimedOut = true;
    res.status(202).send({
      message:
        'Processing is taking longer than expected. We will send a notification when this is finished.',
    });
  }, time);
  const sendResponse = async (syncCallback, asyncCallback) => {
    if (hasTimedOut) {
      return await asyncCallback();
    } else {
      clearTimeout(timer);
      return await syncCallback();
    }
  };
  return { sendResponse };
};

module.exports = syncAsyncResponse;
