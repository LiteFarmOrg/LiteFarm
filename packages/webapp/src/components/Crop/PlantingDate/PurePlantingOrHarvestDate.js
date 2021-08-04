import React from 'react';
import PropTypes from 'prop-types';
import PureNextHarvest from './NextHarvest';
import PurePlantingDate from './PurePlantingDate';

export default function PurePlantingOrHarvestDate({
  system,
  persistedFormData,
  useHookFormPersist,
  variety_id,
  history,
}) {
  const props = {
    system,
    persistedFormData,
    useHookFormPersist,
    variety_id,
    history,
  };
  const { already_in_ground, is_wild } = persistedFormData.crop_management_plan;
  const showNextHarvestPage = already_in_ground && is_wild;
  return showNextHarvestPage ? <PureNextHarvest {...props} /> : <PurePlantingDate {...props} />;
}

PurePlantingOrHarvestDate.prototype = {
  system: PropTypes.string,
  persistedFormData: PropTypes.shape({
    crop_management_plan: PropTypes.shape({
      already_in_ground: PropTypes.bool,
      is_wild: PropTypes.bool,
      for_cover: PropTypes.bool,
      needs_transplant: PropTypes.bool,
      is_seed: PropTypes.bool,
      seed_date: PropTypes.string,
      plant_date: PropTypes.string,
      germination_date: PropTypes.string,
      transplant_date: PropTypes.string,
      termination_date: PropTypes.string,
      harvest_date: PropTypes.string,
      germination_days: PropTypes.number,
      transplant_days: PropTypes.number,
      termination_days: PropTypes.number,
      harvest_days: PropTypes.number,
    }),
  }),
  useHookFormPersist: PropTypes.func,
  variety_id: PropTypes.string,
  history: PropTypes.object,
};
