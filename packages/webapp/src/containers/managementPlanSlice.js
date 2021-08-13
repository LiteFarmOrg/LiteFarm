import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { cropVarietiesSelector, cropVarietyEntitiesSelector } from './cropVarietySlice';
import { cropCatalogueFilterDateSelector } from './filterSlice';
import { pick } from '../util/pick';
import { cropManagementPlanSelectors } from './cropManagementPlanSlice';
import { plantingManagementPlanEntitiesByManagementPlanIdSelector } from './plantingManagementPlanSlice';

export const getManagementPlan = (obj) => {
  return pick(obj, [
    'crop_variety_id',
    'management_plan_id',
    'notes',
    'name',
    'start_date',
    'complete_date',
    'abandon_date',
  ]);
};

const addOneManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  managementPlanAdapter.upsertOne(state, getManagementPlan(payload));
};

const updateOneManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  managementPlanAdapter.upsertOne(state, getManagementPlan(payload));
};

const addManyManagementPlan = (state, { payload: managementPlans }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  managementPlanAdapter.upsertMany(
    state,
    managementPlans.map((managementPlan) => getManagementPlan(managementPlan)),
  );
};

const managementPlanAdapter = createEntityAdapter({
  selectId: (managementPlan) => managementPlan.management_plan_id,
});

const managementPlanSlice = createSlice({
  name: 'managementPlanReducer',
  initialState: managementPlanAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingManagementPlanStart: onLoadingStart,
    onLoadingManagementPlanFail: onLoadingFail,
    getManagementPlansSuccess: addManyManagementPlan,
    deleteManagementPlanSuccess: managementPlanAdapter.removeOne,
    deleteManagementPlansSuccess: managementPlanAdapter.removeMany,
  },
});
export const {
  getManagementPlansSuccess,
  onLoadingManagementPlanStart,
  onLoadingManagementPlanFail,
  deleteManagementPlanSuccess,
  deleteManagementPlansSuccess,
} = managementPlanSlice.actions;
export default managementPlanSlice.reducer;

export const managementPlanReducerSelector = (state) =>
  state.entitiesReducer[managementPlanSlice.name];

const managementPlanSelectors = managementPlanAdapter.getSelectors(
  (state) => state.entitiesReducer[managementPlanSlice.name],
);
/**
 * {
 *
 *   management_plan_id:{
 *
 *     ...crop,
 *
 *     ...crop_variety,
 *
 *     ...management_plan,
 *
 *     ...crop_management_plan,
 *
 *     planting_management_plans: {
 *
 *       final: planting_management_plan
 *
 *       initial: planting_management_plan
 *
 *     },
 *
 *     crop,
 *
 *     crop_variety,
 *
 *   }
 * }
 */
const managementPlanEntitiesSelector = createSelector(
  [
    managementPlanSelectors.selectEntities,
    cropEntitiesSelector,
    cropVarietyEntitiesSelector,
    cropManagementPlanSelectors.selectEntities,
    plantingManagementPlanEntitiesByManagementPlanIdSelector,
  ],
  (
    managementPlanEntities,
    cropEntities,
    cropVarietyEntities,
    cropManagementPlanEntities,
    plantingManagementPlanEntities,
  ) => {
    const entities = {};
    for (const management_plan_id in managementPlanEntities) {
      const management_plan = managementPlanEntities[management_plan_id];
      const crop_management_plan = cropManagementPlanEntities[management_plan_id];
      const planting_management_plans = plantingManagementPlanEntities[management_plan_id];
      const crop_variety = cropVarietyEntities[management_plan.crop_variety_id];
      const crop = cropEntities[crop_variety.crop_id];

      entities[management_plan_id] = {
        ...crop,
        ...crop_variety,
        ...management_plan,
        ...crop_management_plan,
        planting_management_plans,
        crop,
        crop_variety,
      };
    }
    return entities;
  },
);
export const managementPlansSelector = createSelector(
  [managementPlanEntitiesSelector, loginSelector],
  (managementPlanEntities, { farm_id }) =>
    Object.values(managementPlanEntities).filter(
      (managementPlan) => managementPlan.crop_variety.farm_id === farm_id,
    ),
);

export const expiredManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getExpiredManagementPlans(managementPlans, lastActiveDatetime);
  },
);

/**
 *
 * @param {Object} managementPlan
 * @return {number}
 */

const getManagementPlanEndTime = (managementPlan) =>
  (managementPlan.abandon_date || managementPlan.complete_date) &&
  new Date(managementPlan.abandon_date || managementPlan.complete_date).getTime();

const isExpiredManagementPlan = (managementPlan, time) => {
  const endTime = getManagementPlanEndTime(managementPlan);
  return endTime && getManagementPlanEndTime(managementPlan) < time;
};

export const getExpiredManagementPlans = (managementPlans, time) =>
  managementPlans.filter((managementPlan) => isExpiredManagementPlan(managementPlan, time));

export const currentManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getCurrentManagementPlans(managementPlans, lastActiveDatetime);
  },
);

const isCurrentManagementPlan = (managementPlan, time) => {
  return (
    !isExpiredManagementPlan(managementPlan, time) &&
    managementPlan.start_date &&
    new Date(managementPlan.start_date).getTime() <= time
  );
};

export const getCurrentManagementPlans = (managementPlans, time) => {
  return managementPlans.filter((managementPlan) => isCurrentManagementPlan(managementPlan, time));
};

export const plannedManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getPlannedManagementPlans(managementPlans, lastActiveDatetime);
  },
);

const isPlannedManagementPlan = (managementPlan, time) => {
  return (
    !isExpiredManagementPlan(managementPlan, time) && !isCurrentManagementPlan(managementPlan, time)
  );
};

export const getPlannedManagementPlans = (managementPlans, time) => {
  return managementPlans.filter((managementPlan) => isPlannedManagementPlan(managementPlan, time));
};

export const currentAndPlannedManagementPlansSelector = createSelector(
  [plannedManagementPlansSelector, currentManagementPlansSelector],
  (planedManagementPlans, currentManagementPlans) => {
    return [...planedManagementPlans, ...currentManagementPlans];
  },
);

export const cropsWithVarietyWithoutManagementPlanSelector = createSelector(
  [managementPlansSelector, cropVarietiesSelector],
  (managementPlans, cropVarieties) => {
    const cropIds = new Set();
    for (const managementPlan of managementPlans) {
      cropIds.add(managementPlan.crop.crop_id);
    }
    return getUniqueEntities(
      cropVarieties.filter((cropVariety) => !cropIds.has(cropVariety.crop_id)),
      'crop_id',
    );
  },
);

export const cropVarietiesWithoutManagementPlanSelector = createSelector(
  [managementPlansSelector, cropVarietiesSelector],
  (managementPlans, cropVarieties) => {
    const cropVarietyIds = new Set();
    for (const managementPlan of managementPlans) {
      cropVarietyIds.add(managementPlan.crop_variety_id);
    }
    return cropVarieties.filter((cropVariety) => !cropVarietyIds.has(cropVariety.crop_variety_id));
  },
);

export const getLocationIdFromManagementPlan = (managementPlan) =>
  managementPlan.planting_management_plans?.final.location_id;

const filterManagementPlansByLocationId = (location_id, managementPlans) =>
  managementPlans.filter((managementPlan) => getLocationIdFromManagementPlan(managementPlan)) ===
  location_id;

//TODO: remove
export const cropTranslationKeyByManagementPlanSelector = createSelector(
  [managementPlansSelector, cropVarietiesSelector],
  (managementPlans, cropVarieties) => {
    const managementPlanIdToCropNameDict = {};
    for (const managementPlan of managementPlans) {
      const { crop_translation_key } = cropVarieties.find(
        ({ crop_variety_id }) => crop_variety_id === managementPlan.crop_variety_id,
      );
      managementPlanIdToCropNameDict[managementPlan.management_plan_id] = crop_translation_key;
    }
    return managementPlanIdToCropNameDict;
  },
);

export const managementPlansByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, managementPlansSelector], (location_id, managementPlans) =>
    filterManagementPlansByLocationId(location_id, managementPlans),
  );

export const expiredManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, expiredManagementPlansSelector],
    (location_id, managementPlans) =>
      filterManagementPlansByLocationId(location_id, managementPlans),
  );
export const currentAndPlannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, currentAndPlannedManagementPlansSelector],
    (location_id, managementPlans) =>
      filterManagementPlansByLocationId(location_id, managementPlans),
  );

export const currentAndPlannedManagementPlansByCropVarietySelector = (crop_variety) =>
  createSelector(
    [() => crop_variety, currentAndPlannedManagementPlansSelector],
    (crop_variety, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.crop_variety_id === crop_variety),
  );

export const currentManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, currentManagementPlansSelector],
    (location_id, managementPlans) =>
      filterManagementPlansByLocationId(location_id, managementPlans),
  );

export const plannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, plannedManagementPlansSelector],
    (location_id, managementPlans) =>
      filterManagementPlansByLocationId(location_id, managementPlans),
  );

export const managementPlanSelector = managementPlanSelectors.selectById;

export const managementPlanSelectorById = (management_plan_id) => (state) =>
  managementPlanSelectors.selectById(state, management_plan_id);

export const managementPlanStatusSelector = createSelector(
  [managementPlanReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);

const getManagementPlanLocationsFromManagementPlans = (managementPlans) => {
  const locationEntitiesWithManagementPlans = {};
  for (const managementPlan of managementPlans) {
    const location_id = getLocationIdFromManagementPlan(managementPlan);
    if (location_id && !locationEntitiesWithManagementPlans.hasOwnProperty(location_id)) {
      locationEntitiesWithManagementPlans[location_id] =
        managementPlan.planting_management_plans.final.location;
    }
  }
  return Object.values(locationEntitiesWithManagementPlans);
};

export const locationsWithManagementPlanSelector = createSelector(
  [managementPlansSelector],
  getManagementPlanLocationsFromManagementPlans,
);

export const locationsWithCurrentAndPlannedManagementPlanSelector = createSelector(
  [currentAndPlannedManagementPlansSelector],
  getManagementPlanLocationsFromManagementPlans,
);

export const managementPlanByCropIdSelector = (crop_id) =>
  createSelector([managementPlansSelector], (managementPlans) => {
    return managementPlans.filter((managementPlan) => managementPlan.crop.crop_id === crop_id);
  });

export const currentManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getCurrentManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const plannedManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getPlannedManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const expiredManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getExpiredManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const cropVarietiesWithoutManagementPlanByCropIdSelector = (crop_id) =>
  createSelector([cropVarietiesWithoutManagementPlanSelector], (cropVarieties) =>
    cropVarieties.filter((cropVariety) => cropVariety.crop_id === crop_id),
  );

export const getUniqueEntities = (entities, key) => {
  const entitiesByKey = {};
  for (const entity of entities) {
    entitiesByKey[entity[key]] = entity;
  }
  return Object.values(entitiesByKey);
};

export const currentCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([currentManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );
export const plannedCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([plannedManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );
export const expiredCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([expiredManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );

export const managementPlansByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector([managementPlansSelector], (managementPlans) => {
    return managementPlans.filter(
      (managementPlan) => managementPlan.crop_variety_id === crop_variety_id,
    );
  });

export const currentManagementPlanByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector(
    [managementPlansByCropVarietyIdSelector(crop_variety_id), lastActiveDatetimeSelector],
    (managementPlans, lastActiveDate) =>
      getCurrentManagementPlans(managementPlans, new Date(lastActiveDate).getTime()),
  );
export const plannedManagementPlanByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector(
    [managementPlansByCropVarietyIdSelector(crop_variety_id), lastActiveDatetimeSelector],
    (managementPlans, lastActiveDate) =>
      getPlannedManagementPlans(managementPlans, new Date(lastActiveDate).getTime()),
  );
export const expiredManagementPlanByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector(
    [managementPlansByCropVarietyIdSelector(crop_variety_id), lastActiveDatetimeSelector],
    (managementPlans, lastActiveDate) =>
      getExpiredManagementPlans(managementPlans, new Date(lastActiveDate).getTime()),
  );
