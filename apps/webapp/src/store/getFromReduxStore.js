import { store } from './store';

const getStore = () => {
  return store;
};

/**
 * @deprecated do not use in functional component
 */
export const getMeasurementFromStore = (store = getStore()) => {
  const userFarmReducer = store?.getState().entitiesReducer?.userFarmReducer;
  const { user_id, farm_id } = userFarmReducer;
  const measurement = userFarmReducer?.byFarmIdUserId?.[farm_id]?.[user_id]?.units?.measurement;
  return measurement ? measurement : 'metric';
};
/**
 * @deprecated do not use in functional component
 */
export const getCurrencyFromStore = (store = getStore()) => {
  const userFarmReducer = store?.getState().entitiesReducer?.userFarmReducer;
  const { user_id, farm_id } = userFarmReducer;
  const currency = userFarmReducer?.byFarmIdUserId?.[farm_id]?.[user_id]?.units?.currency;
  return currency ? currency : 'USD';
};
