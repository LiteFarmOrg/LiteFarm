import React from 'react';
import PureManagementPlanPlantingMethod from '../../../components/Crop/PlantingMethod/PureManagementPlanPlantingMethod';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PlantingMethod',
  decorators: decorators,
  component: PureManagementPlanPlantingMethod,
};

const Template = (args) => <PureManagementPlanPlantingMethod {...args} />;

export const SeedForHarvestTransplantFinal = Template.bind({});
SeedForHarvestTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: true,
      is_wild: undefined,
      for_cover: false,
      needs_transplant: true,
    },
  },
  system: 'metric',
};
SeedForHarvestTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedCovercropTransplantInitial = Template.bind({});
SeedCovercropTransplantInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: true,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          planting_method: 'BROADCAST_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedCovercropTransplantInitial.parameters = {
  ...chromaticSmallScreen,
};

export const SeedCovercropTransplantFinal = Template.bind({});
SeedCovercropTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: true,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'ROW_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedCovercropTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedForHarvestNoTransplantFinal = Template.bind({});
SeedForHarvestNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: true,
      is_wild: undefined,
      for_cover: false,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          planting_method: 'BED_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedForHarvestNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedCoverCropNoTransplantFinal = Template.bind({});
SeedCoverCropNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: true,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedCoverCropNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingForHarvestTransplantInitial = Template.bind({});
SeedlingForHarvestTransplantInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: false,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingForHarvestTransplantInitial.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingForHarvestTransplantFinal = Template.bind({});
SeedlingForHarvestTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: false,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingForHarvestTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingCoverCropTransplantInitial = Template.bind({});
SeedlingCoverCropTransplantInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingCoverCropTransplantInitial.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingCoverCropTransplantFinal = Template.bind({});
SeedlingCoverCropTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingCoverCropTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingForHarvestNoTransplantFinal = Template.bind({});
SeedlingForHarvestNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: false,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingForHarvestNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const SeedlingCoverCropNoTransplantFinal = Template.bind({});
SeedlingCoverCropNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: false,
      is_seed: false,
      is_wild: undefined,
      for_cover: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
SeedlingCoverCropNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestTransplantInitial = Template.bind({});
InGroundNotWildHarvestTransplantInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: false,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          is_planting_method_known: false,
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildHarvestTransplantInitial.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestTransplantMethodKnownInitial = Template.bind({});
InGroundNotWildHarvestTransplantMethodKnownInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: false,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          is_planting_method_known: true,
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildHarvestTransplantMethodKnownInitial.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestTransplantFinal = Template.bind({});
InGroundNotWildHarvestTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: false,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildHarvestTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropTransplantInitial = Template.bind({});
InGroundNotWildCoverCropTransplantInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          is_planting_method_known: false,
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildCoverCropTransplantInitial.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropTransplantMethodKnownInitial = Template.bind({});
InGroundNotWildCoverCropTransplantMethodKnownInitial.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: false,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        initial: {
          is_planting_method_known: true,
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildCoverCropTransplantMethodKnownInitial.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropTransplantFinal = Template.bind({});
InGroundNotWildCoverCropTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: true,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildCoverCropTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestNoTransplantFinal = Template.bind({});
InGroundNotWildHarvestNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: false,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          is_planting_method_known: false,
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildHarvestNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildHarvestNoTransplantMethodKnownFinal = Template.bind({});
InGroundNotWildHarvestNoTransplantMethodKnownFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: false,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          is_planting_method_known: true,
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildHarvestNoTransplantMethodKnownFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropNoTransplantFinal = Template.bind({});
InGroundNotWildCoverCropNoTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          is_planting_method_known: false,
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildCoverCropNoTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundNotWildCoverCropNoTransplantMethodKnownFinal = Template.bind({});
InGroundNotWildCoverCropNoTransplantMethodKnownFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: false,
      for_cover: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {
          is_planting_method_known: true,
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundNotWildCoverCropNoTransplantMethodKnownFinal.parameters = {
  ...chromaticSmallScreen,
};

export const InGroundWildTransplantFinal = Template.bind({});
InGroundWildTransplantFinal.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  isFinalPlantingMethod: true,
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      is_seed: undefined,
      is_wild: true,
      for_cover: undefined,
      needs_transplant: true,
      planting_management_plans: {
        final: {
          planting_method: 'CONTAINER_METHOD',
        },
      },
    },
  },
  system: 'metric',
};
InGroundWildTransplantFinal.parameters = {
  ...chromaticSmallScreen,
};
