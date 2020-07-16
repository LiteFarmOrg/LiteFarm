import {
  SEND_FARM_DATA_REQUEST,
  GET_FARM_DATA_SCHEDULE,
  SET_FARM_DATA_SCHEDULE,

} from "./constants";

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

