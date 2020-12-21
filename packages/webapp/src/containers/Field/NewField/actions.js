import { CREATE_PRICE, CREATE_YIELD } from '../constants';

export const createYieldAction = (yieldData) => {
  return {
    type: CREATE_YIELD,
    yieldData,
  }
};

export const createPriceAction = (priceData) => {
  return {
    type: CREATE_PRICE,
    priceData,
  }
};
