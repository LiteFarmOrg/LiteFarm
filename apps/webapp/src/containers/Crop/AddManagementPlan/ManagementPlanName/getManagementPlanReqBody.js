import produce from 'immer';
import { pick } from '../../../../util/pick';
import { addDaysToDate, getDateInputFormat } from '../../../../util/moment';

const getContainerMethodReqBody = (container_method) =>
  produce(container_method, (container_method) => {
    if (!container_method.in_ground) {
      delete container_method.total_plants;
      delete container_method.plant_spacing;
      delete container_method.plant_spacing_unit;
    } else {
      delete container_method.number_of_containers;
      delete container_method.plants_per_container;
      delete container_method.planting_soil;
      delete container_method.container_type;
    }
    return container_method;
  });

const getRowMethodReqBody = (row_method) =>
  produce(row_method, (row_method) => {
    if (row_method.same_length) {
      delete row_method.total_rows_length;
    } else {
      delete row_method.number_of_rows;
      delete row_method.row_length;
      delete row_method.row_length_unit;
    }
    return row_method;
  });

const getBroadcastMethodReqBody = (broadcast_method) =>
  produce(broadcast_method, (broadcast_method) => {
    delete broadcast_method.location_size;
    delete broadcast_method.location_size_unit;
  });

const plantingManagementPlanPropertiesV0 = [
  'notes',
  'planting_method',
  'location_id',
  'estimated_seeds',
  'estimated_seeds_unit',
];

export const getPlantingMethodReqBody = (plantingManagementPlan, propertiesOverWrite = {}) => {
  if (plantingManagementPlan.planting_method === 'CONTAINER_METHOD') {
    return {
      container_method: getContainerMethodReqBody(plantingManagementPlan.container_method),
      ...pick(plantingManagementPlan, plantingManagementPlanPropertiesV0),
      ...propertiesOverWrite,
    };
  } else if (plantingManagementPlan.planting_method === 'ROW_METHOD') {
    return {
      row_method: getRowMethodReqBody(plantingManagementPlan.row_method),
      ...pick(plantingManagementPlan, plantingManagementPlanPropertiesV0),
      ...propertiesOverWrite,
    };
  } else if (plantingManagementPlan.planting_method === 'BROADCAST_METHOD') {
    return {
      broadcast_method: getBroadcastMethodReqBody(plantingManagementPlan.broadcast_method),
      ...pick(plantingManagementPlan, plantingManagementPlanPropertiesV0),
      ...propertiesOverWrite,
    };
  } else {
    return {
      [plantingManagementPlan.planting_method.toLowerCase()]:
        plantingManagementPlan[plantingManagementPlan.planting_method.toLowerCase()],
      ...pick(plantingManagementPlan, plantingManagementPlanPropertiesV0),
      ...propertiesOverWrite,
    };
  }
};

export const getPlantingManagementPlansReqBody = (crop_management_plan) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
    planting_management_plans: { final, initial = {} },
  } = crop_management_plan;
  const planting_management_plans = [];
  if (!already_in_ground && is_seed && !for_cover && needs_transplant) {
    planting_management_plans.push({
      ...pick(initial, plantingManagementPlanPropertiesV0),
      container_method: getContainerMethodReqBody(initial.container_method),
      is_final_planting_management_plan: false,
      planting_task_type: 'PLANT_TASK',
      planting_method: 'CONTAINER_METHOD',
    });
    planting_management_plans.push(
      getPlantingMethodReqBody(final, {
        is_final_planting_management_plan: true,
        planting_task_type: 'TRANSPLANT_TASK',
      }),
    );
  } else if (!already_in_ground) {
    planting_management_plans.push(
      getPlantingMethodReqBody(final, {
        is_final_planting_management_plan: true,
        planting_task_type: needs_transplant ? 'TRANSPLANT_TASK' : 'PLANT_TASK',
      }),
    );
    needs_transplant &&
      planting_management_plans.push(
        getPlantingMethodReqBody(initial, {
          is_final_planting_management_plan: false,
          planting_task_type: 'PLANT_TASK',
        }),
      );
  } else if (already_in_ground && !is_wild && needs_transplant) {
    planting_management_plans.push(
      getPlantingMethodReqBody(final, {
        is_final_planting_management_plan: true,
        planting_task_type: 'TRANSPLANT_TASK',
      }),
    );
    planting_management_plans.push(
      initial.is_planting_method_known
        ? getPlantingMethodReqBody(initial, {
            is_final_planting_management_plan: false,
            is_planting_method_known: true,
          })
        : {
            location_id: initial.location_id,
            is_planting_method_known: false,
            is_final_planting_management_plan: false,
          },
    );
  } else if (already_in_ground && !is_wild && !needs_transplant) {
    planting_management_plans.push(
      final.is_planting_method_known
        ? getPlantingMethodReqBody(final, {
            is_final_planting_management_plan: true,
            is_planting_method_known: true,
          })
        : {
            location_id: final.location_id,
            is_planting_method_known: false,
            is_final_planting_management_plan: true,
          },
    );
  } else {
    planting_management_plans.push(
      needs_transplant
        ? getPlantingMethodReqBody(final, {
            is_final_planting_management_plan: true,
            planting_task_type: 'TRANSPLANT_TASK',
          })
        : {
            pin_coordinate: final.pin_coordinate,
            location_id: final.location_id,
            is_final_planting_management_plan: true,
          },
    );
    needs_transplant &&
      planting_management_plans.push({
        pin_coordinate: initial.pin_coordinate,
        location_id: initial.location_id,
        is_final_planting_management_plan: false,
      });
  }
  return planting_management_plans;
};

const getCropManagementPlanReqBody = (crop_management_plan) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
    estimated_yield,
    estimated_yield_unit,
    estimated_price_per_mass,
    estimated_price_per_mass_unit,
  } = crop_management_plan;
  return {
    needs_transplant,
    for_cover,
    already_in_ground,
    is_wild: already_in_ground ? is_wild : undefined,
    is_seed: already_in_ground ? undefined : is_seed,
    seed_date: crop_management_plan.seed_date,
    plant_date: !already_in_ground && !is_seed ? crop_management_plan.plant_date : undefined,
    transplant_date: needs_transplant ? crop_management_plan.transplant_date : undefined,
    germination_date:
      !already_in_ground && (is_seed || (needs_transplant && !for_cover))
        ? crop_management_plan.germination_date
        : undefined,
    termination_date: for_cover ? crop_management_plan.termination_date : undefined,
    harvest_date: for_cover ? undefined : crop_management_plan.harvest_date,
    estimated_yield: for_cover ? undefined : estimated_yield,
    estimated_yield_unit: for_cover ? undefined : estimated_yield_unit,
    estimated_price_per_mass,
    estimated_price_per_mass_unit,
    planting_management_plans: getPlantingManagementPlansReqBody(crop_management_plan),
  };
};

const getManagementPlanReqBody = (formData) => ({
  crop_management_plan: getCropManagementPlanReqBody(formData.crop_management_plan),
  crop_variety_id: formData.crop_variety_id,
  notes: formData.notes,
  name: formData.name,
  start_date: formData.crop_management_plan.already_in_ground
    ? getDateInputFormat(
        addDaysToDate(new Date(), -formData.crop_management_plan.crop_age, { toUTC: false }),
      )
    : undefined,
});

export const getDefaultLocationReqBody = (formData) => {
  const { already_in_ground, is_wild, for_cover, needs_transplant, is_seed } =
    formData.crop_management_plan;
  return {
    farm:
      needs_transplant &&
      !(already_in_ground && is_wild) &&
      formData?.farm?.default_initial_location_id
        ? formData.farm
        : undefined,
    management_plan: getManagementPlanReqBody(formData),
  };
};
