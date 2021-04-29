import { convertFromMetric, roundToTwoDecimal } from '../../../util';

export const grabQuantityAmount = (cropSale, unit) => {
  let quantityAmount = null;
  let saleAmount = null;
  cropSale.forEach((cs) => {
    quantityAmount = roundToTwoDecimal(
      convertFromMetric(cs.quantity_kg.toString(), unit, 'kg').toString(),
    );
    saleAmount = cs.sale_value;
  });
  return { quantityAmount, saleAmount };
};
