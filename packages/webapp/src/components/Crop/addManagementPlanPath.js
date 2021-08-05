export const cancelAddManagementPlanPath = (variety_id) => `/crop/${variety_id}/management`;

export const getPlantedAlreadyPaths = (variety_id) => ({
  goBackPath: `/crop/${variety_id}/management`,
  submitPath: `/crop/${variety_id}/add_management_plan/needs_transplant`,
  cancelPath: cancelAddManagementPlanPath(variety_id),
});

export const getTransplantPaths = (variety_id) => ({
  goBackPath: `/crop/${variety_id}/add_management_plan/planted_already`,
  submitPath: `/crop/${variety_id}/add_management_plan/plant_date`,
  cancelPath: cancelAddManagementPlanPath(variety_id),
});

export const getPlantingDatePaths = (variety_id, persistedFormData) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
  } = persistedFormData.crop_management_plan;
  return {
    goBackPath: `/crop/${variety_id}/add_management_plan/needs_transplant`,
    submitPath: `/crop/${variety_id}/add_management_plan/choose_${
      needs_transplant ? 'initial' : 'final'
    }_planting_location`,
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getNextHarvestPaths = getPlantingDatePaths;

export const getPrevTransplantLocationPath = (variety_id, persistedFormData) => {
  if (
    !persistedFormData.crop_management_plan?.planting_management_plans?.initial
      ?.is_planting_method_known
  ) {
    return `/crop/${variety_id}/add_management_plan/initial_planting_method`;
  } else {
    const plantingMethodPathMap = {
      CONTAINER_METHOD: `/crop/${variety_id}/add_management_plan/initial_container_method`,
      BED_METHOD: `/crop/${variety_id}/add_management_plan/initial_bed_guidance`,
      BROADCAST_METHOD: `/crop/${variety_id}/add_management_plan/initial_broadcast_method`,
      ROW_METHOD: `/crop/${variety_id}/add_management_plan/initial_row_method`,
    };
    return plantingMethodPathMap[
      persistedFormData.crop_management_plan?.planting_management_plans?.initial?.planting_method
    ];
  }
};

export const getPlantingLocationPaths = (variety_id, persistedFormData, isFinalLocationPage) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
  } = persistedFormData.crop_management_plan;
  const getGoBackPath = () => {
    if (!needs_transplant || !isFinalLocationPage) {
      return `/crop/${variety_id}/add_management_plan/plant_date`;
    } else if (already_in_ground && is_wild) {
      return `/crop/${variety_id}/add_management_plan/choose_initial_planting_location`;
    } else if (is_seed && !for_cover) {
      return `/crop/${variety_id}/add_management_plan/initial_container_method`;
    } else {
      return getPrevTransplantLocationPath(variety_id, persistedFormData);
    }
  };

  const getSubmitPath = () => {
    if (already_in_ground && is_wild && !isFinalLocationPage) {
      return `/crop/${variety_id}/add_management_plan/choose_final_planting_location`;
    } else if (is_seed && !for_cover && !isFinalLocationPage) {
      return `/crop/${variety_id}/add_management_plan/initial_container_method`;
    } else if (!isFinalLocationPage) {
      return `/crop/${variety_id}/add_management_plan/initial_planting_method`;
    } else if (already_in_ground && is_wild && !needs_transplant) {
      return `/crop/${variety_id}/add_management_plan/name`;
    } else {
      return `/crop/${variety_id}/add_management_plan/final_planting_method`;
    }
  };

  return {
    goBackPath: getGoBackPath(),
    submitPath: getSubmitPath(),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};
