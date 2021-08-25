import React from 'react';
import PurePlantingOrHarvestDate from '../../../components/Crop/PlantingDate/PurePlantingOrHarvestDate';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PlantingDate',
  decorators: decorators,
  component: PurePlantingOrHarvestDate,
};

const Template = (args) => <PurePlantingOrHarvestDate {...args} />;

const defaultDates = {
  seed_date: '2021-07-20',
  plant_date: '2021-07-21',
  germination_date: '2021-07-22',
  transplant_date: '2021-07-23',
  termination_date: '2021-07-24',
  harvest_date: '2021-07-25',
  germination_days: 2,
  transplant_days: 3,
  termination_days: 4,
  harvest_days: 5,
};

export const SeedForHarvestTransplant = Template.bind({});
SeedForHarvestTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
SeedForHarvestTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedCoverCropTransplant = Template.bind({});
SeedCoverCropTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: true,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
SeedCoverCropTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedForHarvestNoTransplant = Template.bind({});
SeedForHarvestNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: false,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
SeedForHarvestNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedCoverCropNoTransplant = Template.bind({});
SeedCoverCropNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: true,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
SeedCoverCropNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingForHarvestTransplant = Template.bind({});
SeedlingForHarvestTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
SeedlingForHarvestTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingCoverCropTransplant = Template.bind({});
SeedlingCoverCropTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: true,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
SeedlingCoverCropTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingForHarvestNoTransplant = Template.bind({});
SeedlingForHarvestNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
SeedlingForHarvestNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingCoverCropNoTransplant = Template.bind({});
SeedlingCoverCropNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: true,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
SeedlingCoverCropNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestTransplant = Template.bind({});
InGroundNotWildHarvestTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
InGroundNotWildHarvestTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropTransplant = Template.bind({});
InGroundNotWildCoverCropTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
InGroundNotWildCoverCropTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestNoTransplant = Template.bind({});
InGroundNotWildHarvestNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: true,
      for_cover: false,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
InGroundNotWildHarvestNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropNoTransplant = Template.bind({});
InGroundNotWildCoverCropNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
InGroundNotWildCoverCropNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundWildForHarvestTransplant = Template.bind({});
InGroundWildForHarvestTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
InGroundWildForHarvestTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundWildCoverCropTransplant = Template.bind({});
InGroundWildCoverCropTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: true,
      ...defaultDates,
    },
  },
};
InGroundWildCoverCropTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundWildCoverCropNoTransplant = Template.bind({});
InGroundWildCoverCropNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
InGroundWildCoverCropNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundWildForHarvestNoTransplant = Template.bind({});
InGroundWildForHarvestNoTransplant.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: false,
      ...defaultDates,
    },
  },
};
InGroundWildForHarvestNoTransplant.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingWithoutSeedingDate = Template.bind({});
SeedlingWithoutSeedingDate.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
      seed_date: undefined,
    },
  },
};
SeedlingWithoutSeedingDate.parameters = {
  ...chromaticSmallScreen,
};

export const TransplantDatePriorThanPlantingDateError = Template.bind({});
TransplantDatePriorThanPlantingDateError.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
      seed_date: '2021-07-20',
      plant_date: '2021-07-25',
      transplant_date: '2021-07-24',
    },
  },
};
TransplantDatePriorThanPlantingDateError.parameters = {
  ...chromaticSmallScreen,
};

export const HarvestDatePriorThanTransplantDateError = Template.bind({});
HarvestDatePriorThanTransplantDateError.args = {
  useHookFormPersist: () => ({}),
  system: 'imperial',
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: true,
      ...defaultDates,
      seed_date: '2021-07-20',
      plant_date: '2021-07-21',
      transplant_days: 3,
      harvest_days: 2,
    },
  },
};
HarvestDatePriorThanTransplantDateError.parameters = {
  ...chromaticSmallScreen,
};
