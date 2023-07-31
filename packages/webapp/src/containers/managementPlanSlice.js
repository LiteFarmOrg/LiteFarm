import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { cropVarietiesSelector, cropVarietyEntitiesSelector } from './cropVarietySlice';
import { cropCatalogueFilterDateSelector } from './filterSlice';
import { pick } from '../util/pick';
import { cropManagementPlanSelectors } from './cropManagementPlanSlice';

export const getManagementPlan = (obj) => {
  return pick(
    { ...obj, rating: obj.rating === null ? undefined : Number(obj.rating) || undefined },
    [
      'crop_variety_id',
      'management_plan_id',
      'notes',
      'name',
      'start_date',
      'complete_date',
      'abandon_date',
      'rating',
      'complete_notes',
      'abandon_reason',
      'management_plan_group_id',
      'repetition_number',
      'management_plan_group',
    ],
  );
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
  managementPlanAdapter.setAll(
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
    updateManagementPlanSuccess: updateOneManagementPlan,
  },
});
export const {
  getManagementPlansSuccess,
  onLoadingManagementPlanStart,
  onLoadingManagementPlanFail,
  deleteManagementPlanSuccess,
  deleteManagementPlansSuccess,
  updateManagementPlanSuccess,
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
 *     crop,
 *
 *     crop_variety,
 *
 *   }
 * }
 */
export const managementPlanEntitiesSelector = createSelector(
  [
    managementPlanSelectors.selectEntities,
    cropVarietyEntitiesSelector,
    cropManagementPlanSelectors.selectEntities,
  ],
  (managementPlanEntities, cropVarietyEntities, cropManagementPlanEntities) => {
    const entities = {};
    for (const management_plan_id in managementPlanEntities) {
      const management_plan = managementPlanEntities[management_plan_id];
      const crop_management_plan = cropManagementPlanEntities[management_plan_id];
      const crop_variety = cropVarietyEntities[management_plan.crop_variety_id];

      entities[management_plan_id] = {
        ...crop_variety,
        ...management_plan,
        ...crop_management_plan,
        crop_management_plan,
        crop_variety,
      };
    }
    return entities;
  },
);

export const managementPlanSelector = (management_plan_id) =>
  createSelector(
    managementPlanEntitiesSelector,
    (managementPlanEntities) => managementPlanEntities[management_plan_id],
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

export const completedManagementPlansSelector = createSelector(
  [managementPlansSelector],
  (managementPlans) => {
    return getCompletedManagementPlans(managementPlans);
  },
);

export const abandonedManagementPlansSelector = createSelector(
  [managementPlansSelector],
  (managementPlans) => {
    return getAbandonedManagementPlans(managementPlans);
  },
);

export const isAbandonedManagementPlan = (managementPlan) => {
  return managementPlan.abandon_date && managementPlan.abandon_reason;
};

export const getAbandonedManagementPlans = (managementPlans) => {
  return managementPlans.filter((managementPlan) => isAbandonedManagementPlan(managementPlan));
};

/**
 *
 * @param {Object} managementPlan
 * @return {number}
 */

const getManagementPlanEndTime = (managementPlan) => {
  const date =
    (managementPlan.abandon_date || managementPlan.complete_date) &&
    new Date(managementPlan.abandon_date || managementPlan.complete_date);
  date?.setUTCHours(0, 0, 0, 0);
  return date?.getTime();
};

export const isExpiredManagementPlan = (managementPlan, time) => {
  const endTime = getManagementPlanEndTime(managementPlan);
  return endTime && endTime <= time;
};

export const getExpiredManagementPlans = (managementPlans, time) =>
  managementPlans.filter((managementPlan) => isExpiredManagementPlan(managementPlan, time));

export const isCompletedManagementPlan = (managementPlan) => {
  return managementPlan.complete_date;
};

export const getCompletedManagementPlans = (managementPlans) =>
  managementPlans.filter((managementPlan) => isCompletedManagementPlan(managementPlan));

export const currentManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getCurrentManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const isCurrentManagementPlan = (managementPlan, time) => {
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

export const isPlannedManagementPlan = (managementPlan, time) => {
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

export const currentAndPlannedManagementPlansByCropVarietySelector = (crop_variety) =>
  createSelector(
    [() => crop_variety, currentAndPlannedManagementPlansSelector],
    (crop_variety, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.crop_variety_id === crop_variety),
  );

export const managementPlanStatusSelector = createSelector(
  [managementPlanReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
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

export const abandonedManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans) => getAbandonedManagementPlans(managementPlans),
  );

export const completedManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans) => getCompletedManagementPlans(managementPlans),
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

export const abandonedCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([abandonedManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );

export const completedCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([completedManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
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

export const abandonedManagementPlanByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector(
    [managementPlansByCropVarietyIdSelector(crop_variety_id), lastActiveDatetimeSelector],
    (managementPlans, lastActiveDate) =>
      getAbandonedManagementPlans(managementPlans, new Date(lastActiveDate).getTime()),
  );

export const completedManagementPlanByCropVarietyIdSelector = (crop_variety_id) =>
  createSelector(
    [managementPlansByCropVarietyIdSelector(crop_variety_id), lastActiveDatetimeSelector],
    (managementPlans, lastActiveDate) =>
      getCompletedManagementPlans(managementPlans, new Date(lastActiveDate).getTime()),
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
