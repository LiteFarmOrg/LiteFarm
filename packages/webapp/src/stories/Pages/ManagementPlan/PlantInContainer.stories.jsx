import React from 'react';
import PurePlantInContainer from '../../../components/Crop/PlantInContainer';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PurePlantInContainer',
  decorators: decorators,
  component: PurePlantInContainer,
};

const Template = (args) => <PurePlantInContainer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: { already_in_ground: false, planting_management_plans: { final: {} } },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const FinalContainer = Template.bind({});
FinalContainer.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      planting_management_plans: {
        final: {
          container_method: {
            planting_depth: 0.99,
            number_of_containers: 10,
            plants_per_container: 10,
            in_ground: false,
          },
        },
      },
    },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: true,
};
FinalContainer.parameters = {
  ...chromaticSmallScreen,
};

export const FinalInGround = Template.bind({});
FinalInGround.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      planting_management_plans: {
        final: { container_method: { plant_spacing: 1, total_plants: 3, in_ground: true } },
      },
    },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: true,
};
FinalInGround.parameters = {
  ...chromaticSmallScreen,
};

export const InitialContainer = Template.bind({});
InitialContainer.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      planting_management_plans: {
        initial: {
          container_method: {
            planting_depth: 0.99,
            number_of_containers: 10,
            plants_per_container: 10,
            in_ground: false,
          },
        },
      },
    },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: false,
};
InitialContainer.parameters = {
  ...chromaticSmallScreen,
};

export const HistoricalInitial = Template.bind({});
HistoricalInitial.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          container_method: {
            plant_spacing: 1,
            total_plants: 3,
            in_ground: true,
          },
        },
      },
    },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: false,
};
HistoricalInitial.parameters = {
  ...chromaticSmallScreen,
};

export const HistoricalFinal = Template.bind({});
HistoricalFinal.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          container_method: {
            plant_spacing: 1,
            total_plants: 3,
            in_ground: true,
          },
        },
      },
    },
  },
  system: 'metric',
  crop_variety: {
    average_seed_weight: 10,
    yield_per_plant: 10,
    crop_variety_id: 'crop_variety_id',
  },
  isFinalPage: true,
};
HistoricalFinal.parameters = {
  ...chromaticSmallScreen,
};
