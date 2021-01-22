import { store } from '../index';

const getStore = () => {
  return store;
};

export const getMeasurementFromStore = (store = getStore()) => {
  const userFarmReducer = store?.getState().entitiesReducer?.userFarmReducer;
  const { user_id, farm_id } = userFarmReducer;
  const measurement = userFarmReducer?.byFarmIdUserId?.[farm_id][user_id]?.units?.measurement;
  return measurement ? measurement : 'metric';
};

export const getCurrencyFromStore = (store = getStore()) => {
  const userFarmReducer = store?.getState().entitiesReducer?.userFarmReducer;
  const { user_id, farm_id } = userFarmReducer;
  const currency = userFarmReducer?.byFarmIdUserId?.[farm_id][user_id]?.units?.currency;
  return currency ? currency : 'USD';
};
