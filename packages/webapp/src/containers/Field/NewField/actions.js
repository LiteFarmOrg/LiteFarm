import { CREATE_FIELD_CROP, CREATE_PRICE, CREATE_YIELD } from '../constants';

export const createFieldCropAction = (crop_id, field_id, start_date, end_date, area_used, estimated_production, estimated_revenue, is_by_bed, bed_config=null) => {
  return {
    type: CREATE_FIELD_CROP,
    cropId: crop_id,
    fieldId: field_id,
    startDate: start_date,
    endDate: end_date,
    areaUsed: area_used,
    estimatedProduction: estimated_production,
    estimatedRevenue: estimated_revenue,
    is_by_bed,
    bed_config,
  }
};

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
