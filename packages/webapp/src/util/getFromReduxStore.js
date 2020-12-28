import { store } from '../index';

const getStore = () => {
  return store;
};

export const getMeasurementFromStore = (store = getStore()) => {
  const measurement = store?.getState().baseReducer?.farm?.units?.measurement;
  return measurement ? measurement : 'metric';
};

export const getCurrencyFromStore = (store = getStore()) => {
  const currency = store?.getState().baseReducer?.farm?.units?.currency;
  return currency ? currency : 'USD';
};
