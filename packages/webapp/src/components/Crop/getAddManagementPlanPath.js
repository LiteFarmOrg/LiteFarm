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
  plantedAlreadyPath,
  plantingDatePath,
} from './addManagementPlanPaths';

export const cancelAddManagementPlanPath = (variety_id) => `/crop/${variety_id}/management`;

export const getPlantedAlreadyPaths = (variety_id) => ({
  goBackPath: cancelAddManagementPlanPath(variety_id),
  submitPath: needsTransplantPath(variety_id),
  cancelPath: cancelAddManagementPlanPath(variety_id),
});

export const getTransplantPaths = (variety_id) => ({
  goBackPath: plantedAlreadyPath(variety_id),
  submitPath: plantingDatePath(variety_id),
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
    goBackPath: needsTransplantPath(variety_id),
    submitPath: needs_transplant ? initialLocationPath(variety_id) : finalLocationPath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
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
  const getGoBackPath = () => {
    if (!needs_transplant || !isFinalLocationPage) {
      return plantingDatePath(variety_id);
    } else if (already_in_ground && is_wild) {
      return initialLocationPath(variety_id);
    } else if (!already_in_ground && is_seed && !for_cover) {
      return initialContainerPath(variety_id);
    } else {
      return getPrevTransplantLocationPath(variety_id, persistedFormData);
    }
  };

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
    goBackPath: getGoBackPath(),
    submitPath: getSubmitPath(),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};
/**
 *
 * @param {string} variety_id
 * @param persistedFormData
 * @param {boolean} isFinalPlantingMethodPage
 * @param {string} planting_method
 * @param {boolean} is_planting_method_known
 * @return {{goBackPath: string, submitPath: string, cancelPath: string}}
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
    goBackPath: isFinalPlantingMethodPage
      ? finalLocationPath(variety_id)
      : initialLocationPath(variety_id),
    submitPath: getSubmitPath(),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getBedMethodPaths = (variety_id, isFinalPage) => {
  return {
    goBackPath: isFinalPage
      ? finalPlantingMethodPath(variety_id)
      : initialPlantingMethodPath(variety_id),
    submitPath: isFinalPage ? finalBedGuidancePath(variety_id) : initialBedGuidancePath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};
export const getBedGuidancePaths = (variety_id, isFinalPage) => {
  return {
    goBackPath: isFinalPage ? finalBedPath(variety_id) : initialBedPath(variety_id),
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getRowMethodPaths = (variety_id, isFinalPage) => {
  return {
    goBackPath: isFinalPage
      ? finalPlantingMethodPath(variety_id)
      : initialPlantingMethodPath(variety_id),
    submitPath: isFinalPage ? finalRowGuidancePath(variety_id) : initialRowGuidancePath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getRowGuidancePaths = (variety_id, isFinalPage) => {
  return {
    goBackPath: isFinalPage ? finalRowPath(variety_id) : initialRowPath(variety_id),
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getBroadcastMethodPaths = (variety_id, isFinalPage) => {
  return {
    goBackPath: isFinalPage
      ? finalPlantingMethodPath(variety_id)
      : initialPlantingMethodPath(variety_id),
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
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
  const getGoBackPath = () => {
    if (!already_in_ground && is_seed && !for_cover && !isFinalPage) {
      return initialLocationPath(variety_id);
    } else if (!isFinalPage) {
      return initialPlantingMethodPath(variety_id);
    } else {
      return finalPlantingMethodPath(variety_id);
    }
  };
  return {
    goBackPath: getGoBackPath(),
    submitPath: isFinalPage ? addManagementPlanNamePath(variety_id) : finalLocationPath(variety_id),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};

export const getAddManagementPlanNamePaths = (variety_id, persistedFormData) => {
  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
    planting_management_plans: { final, initial = {} },
  } = persistedFormData.crop_management_plan;
  const plantingMethodPathMap = {
    CONTAINER_METHOD: finalContainerPath(variety_id),
    BED_METHOD: finalBedGuidancePath(variety_id),
    BROADCAST_METHOD: finalBroadcastPath(variety_id),
    ROW_METHOD: finalRowGuidancePath(variety_id),
  };

  const getGoBackPath = () => {
    if (already_in_ground && !is_wild && !needs_transplant && !final.is_planting_method_known) {
      return finalPlantingMethodPath(variety_id);
    } else if (already_in_ground && is_wild && !needs_transplant) {
      return finalLocationPath(variety_id);
    } else {
      return plantingMethodPathMap[final.planting_method];
    }
  };
  return {
    goBackPath: getGoBackPath(),
    cancelPath: cancelAddManagementPlanPath(variety_id),
  };
};
