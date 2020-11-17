import { GET_FARM_DATA_SCHEDULE, SEND_FARM_DATA_REQUEST, SET_FARM_DATA_SCHEDULE } from './constants';

export const sendFarmDataRequst = () => {
  return {
    type: SEND_FARM_DATA_REQUEST,
  }
};

export const getFarmSchedule = () => {
  return {
    type: GET_FARM_DATA_SCHEDULE,
  }
};

export const setFarmSchedule = (data) => {
  return {
    type: SET_FARM_DATA_SCHEDULE,
    data
  }
};

