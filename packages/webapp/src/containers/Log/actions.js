/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (actions.js) is part of LiteFarm.
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

import {
  GET_LOGS,
  SET_LOGS_IN_STATE,
  SET_SELECTED_LOG,
} from "./constants";

export const getLogs = () => {
  return {
    type: GET_LOGS,
  }
};

export const setLogsInState = (logs) => {
  return {
    type: SET_LOGS_IN_STATE,
    logs
  }
};

export const setSelectedLog = (log) => {
  return {
    type: SET_SELECTED_LOG,
    log
  }
};
