import {
  getPlantingLocationPaths,
  getPlantingMethodPaths,
  getPrevTransplantLocationPath,
} from '../../../components/Crop/getAddManagementPlanPath';
import produce from 'immer';
import {
  addManagementPlanNamePath,
  finalBedPath,
  finalBroadcastPath,
  finalContainerPath,
  finalLocationPath,
  finalPlantingMethodPath,
  finalRowPath,
  initialBedGuidancePath,
  initialBedPath,
  initialBroadcastPath,
  initialContainerPath,
  initialPlantingMethodPath,
  initialRowGuidancePath,
  initialRowPath,
} from '../../../components/Crop/addManagementPlanPaths';

const persistedFormList = [
  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: false,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: true,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: false,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: true,
      for_cover: true,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: true,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: false,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: false,
      is_wild: undefined,
      is_seed: false,
      for_cover: true,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: true,
      for_cover: false,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: false,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: true,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: true,
      needs_transplant: false,
    },
  },

  {
    crop_management_plan: {
      already_in_ground: true,
      is_wild: true,
      is_seed: undefined,
      for_cover: false,
      needs_transplant: false,
    },
  },
];

describe('add management plan path test', () => {
  describe('initial location test', () => {
    const getExpectedPaths = (variety_id) => [
      {
        submitPath: initialContainerPath(variety_id),
      },
      {
        submitPath: initialPlantingMethodPath(variety_id),
      },
      {},
      {},
      {
        submitPath: initialPlantingMethodPath(variety_id),
      },
      {
        submitPath: initialPlantingMethodPath(variety_id),
      },
      {},
      {},
      {
        submitPath: initialPlantingMethodPath(variety_id),
      },
      {
        submitPath: initialPlantingMethodPath(variety_id),
      },
      {},
      {},
      {
        submitPath: finalLocationPath(variety_id),
      },
      {
        submitPath: finalLocationPath(variety_id),
      },
      {},
      {},
    ];
    test('initial location test', () => {
      const variety_id = 'variety_id';
      const expectedPaths = getExpectedPaths(variety_id);
      for (const index in persistedFormList) {
        const persistedFormData = produce(
          persistedFormList[index],
          (persistedFormData) => {
            persistedFormData.planting_management_plans = {};
            persistedFormData.planting_management_plans.initial = {
              planting_method: 'CONTAINER_METHOD',
              is_planting_method_known: true,
            };
          }
        );
        if (persistedFormData.crop_management_plan.needs_transplant) {
          const { submitPath } = getPlantingLocationPaths(
            variety_id,
            persistedFormData,
            false
          );
          const { submitPath: expectedSubmitPath } = expectedPaths[index];
          expect(submitPath).toBe(expectedSubmitPath);
        }
      }
    });
  });
  describe('final location test', () => {
    describe('getPlantingLocationPaths test', () => {
      const getExpectedPaths = (variety_id) => [
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: finalPlantingMethodPath(variety_id),
        },
        {
          submitPath: addManagementPlanNamePath(variety_id),
        },
        {
          submitPath: addManagementPlanNamePath(variety_id),
        },
      ];
      test('final location test with initial container method', () => {
        const variety_id = 'variety_id';
        const expectedPaths = getExpectedPaths(variety_id);
        for (const index in persistedFormList) {
          const persistedFormData = produce(
            persistedFormList[index],
            (persistedFormData) => {
              persistedFormData.crop_management_plan.planting_management_plans =
                {};
              persistedFormData.crop_management_plan.planting_management_plans.initial =
                {
                  planting_method: 'CONTAINER_METHOD',
                  is_planting_method_known: true,
                };
            }
          );
          const { submitPath } = getPlantingLocationPaths(
            variety_id,
            persistedFormData,
            true
          );
          const { submitPath: expectedSubmitPath } = expectedPaths[index];
          expect(submitPath).toBe(expectedSubmitPath);
        }
      });
    });
    describe.skip('getPrevTransplantLocationPath', () => {
      const getTestDatas = (variety_id) => [
        {
          persistedFormData: {
            crop_management_plan: {
              planting_management_plans: {
                initial: {
                  planting_method: 'CONTAINER_METHOD',
                  is_planting_method_known: true,
                },
              },
            },
          },
          expected: initialContainerPath(variety_id),
        },
        {
          persistedFormData: {
            crop_management_plan: {
              planting_management_plans: {
                initial: {
                  planting_method: 'BED_METHOD',
                  is_planting_method_known: true,
                },
              },
            },
          },
          expected: initialBedGuidancePath(variety_id),
        },
        {
          persistedFormData: {
            crop_management_plan: {
              planting_management_plans: {
                initial: {
                  planting_method: 'BROADCAST_METHOD',
                  is_planting_method_known: true,
                },
              },
            },
          },
          expected: initialBroadcastPath(variety_id),
        },
        {
          persistedFormData: {
            crop_management_plan: {
              planting_management_plans: {
                initial: {
                  planting_method: 'ROW_METHOD',
                  is_planting_method_known: true,
                },
              },
            },
          },
          expected: initialRowGuidancePath(variety_id),
        },
        {
          persistedFormData: {
            crop_management_plan: {
              already_in_ground: true,
              planting_management_plans: {
                initial: {
                  planting_method: 'CONTAINER_METHOD',
                  is_planting_method_known: false,
                },
              },
            },
          },
          expected: initialPlantingMethodPath(variety_id),
        },
      ];
    });
  });

  describe('planting method paths test', () => {
    describe('initial planting method', () => {
      const getExpectedPaths = (variety_id) => [
        {},
        {
          submitPath: initialBroadcastPath(variety_id),
          planting_method: 'BROADCAST_METHOD',
          is_planting_method_known: false,
        },
        {},
        {},
        {
          submitPath: initialBedPath(variety_id),
          planting_method: 'BED_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: initialRowPath(variety_id),
          planting_method: 'ROW_METHOD',
          is_planting_method_known: true,
        },
        {},
        {},
        {
          submitPath: initialContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalLocationPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: false,
        },
        {},
        {},
        {},
        {},
        {},
        {},
      ];
      test('getPlantingMethodPaths test', () => {
        const variety_id = 'variety_id';
        const expected = getExpectedPaths(variety_id);
        for (const index in persistedFormList) {
          const persistedFormData = persistedFormList[index];
          const {
            submitPath: expectedSubmitPath,
            planting_method,
            is_planting_method_known,
          } = expected[index];
          if (expectedSubmitPath) {
            const { submitPath } = getPlantingMethodPaths(
              variety_id,
              persistedFormData,
              false,
              planting_method,
              is_planting_method_known
            );
            expect(submitPath).toBe(expectedSubmitPath);
          }
        }
      });
    });
    describe.skip('final planting method', () => {
      const getExpectedPaths = (variety_id) => [
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalBedPath(variety_id),
          planting_method: 'BED_METHOD',
          is_planting_method_known: false,
        },
        {
          submitPath: finalBroadcastPath(variety_id),
          planting_method: 'BROADCAST_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalRowPath(variety_id),
          planting_method: 'ROW_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: false,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: false,
        },
        {
          submitPath: finalContainerPath(variety_id),
          planting_method: 'CONTAINER_METHOD',
          is_planting_method_known: true,
        },
        {},
        {},
      ];

      test('getPlantingMethodPaths test', () => {
        const variety_id = 'variety_id';
        const expected = getExpectedPaths(variety_id);
        for (const index in persistedFormList) {
          const persistedFormData = persistedFormList[index];
          const {
            submitPath: expectedSubmitPath,
            planting_method,
            is_planting_method_known,
          } = expected[index];

          if (expectedSubmitPath) {
            const { submitPath } = getPlantingMethodPaths(
              variety_id,
              persistedFormData,
              true,
              planting_method,
              is_planting_method_known
            );
            expect(submitPath).toBe(expectedSubmitPath);
          }
        }
      });
    });
  });
});
