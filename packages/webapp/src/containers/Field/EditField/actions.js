import { EDIT_FIELD_CROP } from '../constants';

export const editFieldCropAction = (
  field_crop_id,
  crop_id,
  field_id,
  start_date,
  end_date,
  area_used,
  estimated_production,
  variety,
  estimated_revenue,
  is_by_bed,
  bed_config = null,
) => {
  return {
    type: EDIT_FIELD_CROP,
    fieldCropId: field_crop_id,
    cropId: crop_id,
    fieldId: field_id,
    startDate: start_date,
    endDate: end_date,
    areaUsed: area_used,
    estimatedProduction: estimated_production,
    variety: variety,
    estimatedRevenue: estimated_revenue,
    is_by_bed,
    bed_config,
  };
};
