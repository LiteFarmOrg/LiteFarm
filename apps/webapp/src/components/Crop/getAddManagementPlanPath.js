import {
  addManagementPlanNamePath,
  finalBedGuidancePath,
  finalBedPath,
  finalBroadcastPath,
  finalContainerPath,
  finalLocationPath,
  finalPlantingMethodPath,
  finalRowGuidancePath,
  finalRowPath,
  initialBedGuidancePath,
  initialBedPath,
  initialBroadcastPath,
  initialContainerPath,
  initialLocationPath,
  initialPlantingMethodPath,
  initialRowGuidancePath,
  initialRowPath,
  needsTransplantPath,
  plantingDatePath,
} from './addManagementPlanPaths';

export const getPlantedAlreadyPaths = (variety_id) => ({
  submitPath: needsTransplantPath(variety_id),
});

export const getTransplantPaths = (variety_id) => ({
  submitPath: plantingDatePath(variety_id),
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
    submitPath: needs_transplant ? initialLocationPath(variety_id) : finalLocationPath(variety_id),
  };
};

export const getNextHarvestPaths = getPlantingDatePaths;

export const getPrevTransplantLocationPath = (variety_id, persistedFormData) => {
  if (
    !persistedFormData.crop_management_plan?.planting_management_plans?.initial
      ?.is_planting_method_known &&
    persistedFormData.crop_management_plan?.already_in_ground
  ) {
    return initialPlantingMethodPath(variety_id);
  } else {
    const plantingMethodPathMap = {
      CONTAINER_METHOD: initialContainerPath(variety_id),
      BED_METHOD: initialBedGuidancePath(variety_id),
      BROADCAST_METHOD: initialBroadcastPath(variety_id),
      ROW_METHOD: initialRowGuidancePath(variety_id),
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


  const getSubmitPath = () => {
    if (already_in_ground && is_wild && !isFinalLocationPage) {
      return finalLocationPath(variety_id);
    } else if (!already_in_ground && is_seed && !for_cover && !isFinalLocationPage) {
      return initialContainerPath(variety_id);
    } else if (!isFinalLocationPage) {
      return initialPlantingMethodPath(variety_id);
    } else if (already_in_ground && is_wild && !needs_transplant) {
      return addManagementPlanNamePath(variety_id);
    } else {
      return finalPlantingMethodPath(variety_id);
    }
  };

  return {
    submitPath: getSubmitPath(),
  };
};
/**
 *
 * @param {string} variety_id
 * @param persistedFormData
 * @param {boolean} isFinalPlantingMethodPage
 * @param {string} planting_method
 * @param {boolean} is_planting_method_known
 * @return {{ submitPath: string}}
 */
export const getPlantingMethodPaths = (
  variety_id,
  persistedFormData,
  isFinalPlantingMethodPage,
  planting_method,
  is_planting_method_known = true,
) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
  } = persistedFormData.crop_management_plan;

  const plantingMethodPathMap = {
    CONTAINER_METHOD: isFinalPlantingMethodPage
      ? finalContainerPath(variety_id)
      : initialContainerPath(variety_id),
    BED_METHOD: isFinalPlantingMethodPage ? finalBedPath(variety_id) : initialBedPath(variety_id),
    BROADCAST_METHOD: isFinalPlantingMethodPage
      ? finalBroadcastPath(variety_id)
      : initialBroadcastPath(variety_id),
    ROW_METHOD: isFinalPlantingMethodPage ? finalRowPath(variety_id) : initialRowPath(variety_id),
  };

  const getSubmitPath = () => {
    if (already_in_ground && !is_wild && !needs_transplant && !is_planting_method_known) {
      return addManagementPlanNamePath(variety_id);
    } else if (
      already_in_ground &&
      !is_wild &&
      !isFinalPlantingMethodPage &&
      !is_planting_method_known
    ) {
      return finalLocationPath(variety_id);
    } else {
      return plantingMethodPathMap[planting_method];
    }
  };

  return {
    submitPath: getSubmitPath(),
  };
};

export const getBedMethodPaths = (variety_id, isFinalPage) => {
  return {
    submitPath: isFinalPage ? finalBedGuidancePath(variety_id) : initialBedGuidancePath(variety_id),
  };
};
export const getBedGuidancePaths = (variety_id, isFinalPage) => {
  return {
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
  };
};

export const getRowMethodPaths = (variety_id, isFinalPage) => {
  return {

    submitPath: isFinalPage ? finalRowGuidancePath(variety_id) : initialRowGuidancePath(variety_id),
  };
};

export const getRowGuidancePaths = (variety_id, isFinalPage) => {
  return {
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
  };
};

export const getBroadcastMethodPaths = (variety_id, isFinalPage) => {
  return {

    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
  };
};

export const getContainerMethodPaths = (variety_id, persistedFormData, isFinalPage) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
  } = persistedFormData.crop_management_plan;
  return {
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
  };
};

