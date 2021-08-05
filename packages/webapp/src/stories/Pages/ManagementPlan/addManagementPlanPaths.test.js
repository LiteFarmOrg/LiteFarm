import {
  getPlantingLocationPaths,
  getPrevTransplantLocationPath,
} from '../../../components/Crop/addManagementPlanPath';
import produce from 'immer';

const persistedFormDatas = [
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
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
      },
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
      },
      {},
      {},
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
      },
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
      },
      {},
      {},
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
      },
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
      },
      {},
      {},
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/choose_final_planting_location`,
      },
      {
        goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
        submitPath: `/crop/${variety_id}/add_management_plan/choose_final_planting_location`,
      },
      {},
      {},
    ];
    test('initial location test', () => {
      const variety_id = 'variety_id';
      const expectedPaths = getExpectedPaths(variety_id);
      for (const index in persistedFormDatas) {
        const persistedFormData = produce(persistedFormDatas[index], (persistedFormData) => {
          persistedFormData.planting_management_plans = {};
          persistedFormData.planting_management_plans.initial = {
            planting_method: 'CONTAINER_METHOD',
            is_planting_method_known: true,
          };
        });
        if (persistedFormData.crop_management_plan.needs_transplant) {
          const { goBackPath, submitPath } = getPlantingLocationPaths(
            variety_id,
            persistedFormData,
            false,
          );
          const { goBackPath: expectedGoBackPath, submitPath: expectedSubmitPath } = expectedPaths[
            index
          ];
          expect(goBackPath).toBe(expectedGoBackPath);
          expect(submitPath).toBe(expectedSubmitPath);
        }
      }
    });
  });
  describe('final location test', () => {
    describe('getPlantingLocationPaths test', () => {
      const getExpectedPaths = (variety_id) => [
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/initial_container_method`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/choose_initial_planting_location`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/choose_initial_planting_location`,
          submitPath: `/crop/${variety_id}/add_management_plan/final_planting_method`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/name`,
        },
        {
          goBackPath: `/crop/${variety_id}/add_management_plan/plant_date`,
          submitPath: `/crop/${variety_id}/add_management_plan/name`,
        },
      ];
      test('final location test with initial container method', () => {
        const variety_id = 'variety_id';
        const expectedPaths = getExpectedPaths(variety_id);
        for (const index in persistedFormDatas) {
          const persistedFormData = produce(persistedFormDatas[index], (persistedFormData) => {
            persistedFormData.crop_management_plan.planting_management_plans = {};
            persistedFormData.crop_management_plan.planting_management_plans.initial = {
              planting_method: 'CONTAINER_METHOD',
              is_planting_method_known: true,
            };
          });
          const { goBackPath, submitPath } = getPlantingLocationPaths(
            variety_id,
            persistedFormData,
            true,
          );
          const { goBackPath: expectedGoBackPath, submitPath: expectedSubmitPath } = expectedPaths[
            index
          ];
          expect(goBackPath).toBe(expectedGoBackPath);
          expect(submitPath).toBe(expectedSubmitPath);
        }
      });
    });
    describe('getPrevTransplantLocationPath', () => {
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
          expected: `/crop/${variety_id}/add_management_plan/initial_container_method`,
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
          expected: `/crop/${variety_id}/add_management_plan/initial_bed_guidance`,
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
          expected: `/crop/${variety_id}/add_management_plan/initial_broadcast_method`,
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
          expected: `/crop/${variety_id}/add_management_plan/initial_row_method`,
        },
        {
          persistedFormData: {
            crop_management_plan: {
              planting_management_plans: {
                initial: {
                  planting_method: 'CONTAINER_METHOD',
                  is_planting_method_known: false,
                },
              },
            },
          },
          expected: `/crop/${variety_id}/add_management_plan/initial_planting_method`,
        },
      ];
      test('getPrevTransplantLocationPath test', () => {
        const variety_id = 'variety_id';
        for (const { persistedFormData, expected } of getTestDatas(variety_id)) {
          const goBackPath = getPrevTransplantLocationPath(variety_id, persistedFormData);
          expect(goBackPath).toBe(expected);
        }
      });
    });
  });
});

// const getPrevPaths = variety_id => [
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
//   {    goBackPath: ,
//     submitPath:},
// ]
