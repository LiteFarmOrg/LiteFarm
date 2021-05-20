import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietiesSelector, cropVarietyEntitiesSelector } from './cropVarietySlice';
import { cropCatalogueFilterDateSelector } from './filterSlice';

const getFieldCrop = (obj) => {
  return pick(obj, [
    'field_crop_id',
    'crop_variety_id',
    'location_id',
    'start_date',
    'end_date',
    'area_used',
    'estimated_production',
    'variety',
    'estimated_revenue',
    'is_by_bed',
    'bed_config',
  ]);
};

const addOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
};

const updateOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
};

const addManyFieldCrop = (state, { payload: fieldCrops }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  fieldCropAdapter.upsertMany(
    state,
    fieldCrops.map((fieldCrop) => getFieldCrop(fieldCrop)),
  );
};

const fieldCropAdapter = createEntityAdapter({
  selectId: (fieldCrop) => fieldCrop.field_crop_id,
});

const fieldCropSlice = createSlice({
  name: 'fieldCropReducer',
  initialState: fieldCropAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldCropStart: onLoadingStart,
    onLoadingFieldCropFail: onLoadingFail,
    getFieldCropsSuccess: addManyFieldCrop,
    postFieldCropSuccess: addOneFieldCrop,
    putFieldCropSuccess(state, { payload: fieldCrop }) {
      fieldCropAdapter.updateOne(state, { changes: fieldCrop, id: fieldCrop.field_crop_id });
    },
    deleteFieldCropSuccess: fieldCropAdapter.removeOne,
    selectFieldCropSuccess(state, { payload: fieldCrop_id }) {
      state.fieldCrop_id = fieldCrop_id;
    },
  },
});
export const {
  getFieldCropsSuccess,
  postFieldCropSuccess,
  putFieldCropSuccess,
  onLoadingFieldCropStart,
  onLoadingFieldCropFail,
  deleteFieldCropSuccess,
} = fieldCropSlice.actions;
export default fieldCropSlice.reducer;

export const fieldCropReducerSelector = (state) => state.entitiesReducer[fieldCropSlice.name];

const fieldCropSelectors = fieldCropAdapter.getSelectors(
  (state) => state.entitiesReducer[fieldCropSlice.name],
);

export const fieldCropsSelector = createSelector(
  [
    fieldCropSelectors.selectAll,
    cropLocationEntitiesSelector,
    cropEntitiesSelector,
    cropVarietyEntitiesSelector,
    loginSelector,
  ],
  (fieldCrops, cropLocationEntities, cropEntities, cropVarietyEntities, { farm_id }) => {
    const fieldCropsOfCurrentFarm = fieldCrops.filter(
      (fieldCrop) => cropLocationEntities[fieldCrop.location_id]?.farm_id === farm_id,
    );
    return fieldCropsOfCurrentFarm.map((fieldCrop) => {
      const cropVariety = cropVarietyEntities[fieldCrop.crop_variety_id];
      return {
        ...cropEntities[cropVariety.crop_id],
        ...cropVariety,
        location: cropLocationEntities[fieldCrop.location_id],
        ...fieldCrop,
      };
    });
  },
);

export const expiredFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return getExpiredFieldCrops(fieldCrops, lastActiveDatetime);
  },
);

export const getExpiredFieldCrops = (fieldCrops, time) =>
  fieldCrops.filter((fieldCrop) => new Date(fieldCrop.end_date).getTime() < time);

export const currentAndPlannedFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return fieldCrops.filter(
      (fieldCrop) => new Date(fieldCrop.end_date).getTime() >= lastActiveDatetime,
    );
  },
);

export const currentFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return getCurrentFieldCrops(fieldCrops, lastActiveDatetime);
  },
);

export const getCurrentFieldCrops = (fieldCrops, time) => {
  return fieldCrops.filter(
    (fieldCrop) =>
      new Date(fieldCrop.end_date).getTime() >= time &&
      new Date(fieldCrop.start_date).getTime() <= time,
  );
};

export const plannedFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return getPlannedFieldCrops(fieldCrops, lastActiveDatetime);
  },
);

export const getPlannedFieldCrops = (fieldCrops, time) =>
  fieldCrops.filter((fieldCrop) => new Date(fieldCrop.start_date).getTime() > time);

export const cropsWithVarietyWithoutManagementPlanSelector = createSelector(
  [fieldCropsSelector, cropVarietiesSelector],
  (fieldCrops, cropVarieties) => {
    const cropIds = new Set();
    for (const fieldCrop of fieldCrops) {
      cropIds.add(fieldCrop.crop_id);
    }
    return getUniqueEntities(
      cropVarieties.filter((cropVariety) => !cropIds.has(cropVariety.crop_id)),
      'crop_id',
    );
  },
);

export const cropVarietiesWithoutManagementPlanSelector = createSelector(
  [fieldCropsSelector, cropVarietiesSelector],
  (fieldCrops, cropVarieties) => {
    const cropVarietyIds = new Set();
    for (const fieldCrop of fieldCrops) {
      cropVarietyIds.add(fieldCrop.crop_variety_id);
    }
    return cropVarieties.filter((cropVariety) => !cropVarietyIds.has(cropVariety.crop_variety_id));
  },
);

export const fieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, fieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const expiredFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, expiredFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );
export const currentAndPlannedFieldCropsByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, currentAndPlannedFieldCropsSelector],
    (location_id, fieldCrops) =>
      fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const currentFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, currentFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const plannedFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, plannedFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const fieldCropSelector = fieldCropSelectors.selectById;

export const fieldCropStatusSelector = createSelector(
  [fieldCropReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);

const getFieldCropLocationsFromFieldCrops = (fieldCrops) => {
  const locationEntitiesWithFieldCrops = {};
  for (const fieldCrop of fieldCrops) {
    if (
      fieldCrop.location_id &&
      !locationEntitiesWithFieldCrops.hasOwnProperty(fieldCrop.location_id)
    ) {
      locationEntitiesWithFieldCrops[fieldCrop.location_id] = fieldCrop.location;
    }
  }
  return Object.values(locationEntitiesWithFieldCrops);
};

export const locationsWithFieldCropSelector = createSelector(
  [fieldCropsSelector],
  getFieldCropLocationsFromFieldCrops,
);

export const locationsWithCurrentAndPlannedFieldCropSelector = createSelector(
  [currentAndPlannedFieldCropsSelector],
  getFieldCropLocationsFromFieldCrops,
);

export const fieldCropByCropIdSelector = (crop_id) =>
  createSelector([fieldCropsSelector], (fieldCrops) => {
    return fieldCrops.filter((fieldCrop) => fieldCrop.crop_id === crop_id);
  });

export const currentFieldCropByCropIdSelector = (crop_id) =>
  createSelector(
    [fieldCropByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (fieldCrops, cropCatalogFilterDate) =>
      getCurrentFieldCrops(fieldCrops, new Date(cropCatalogFilterDate).getTime()),
  );
export const plannedFieldCropByCropIdSelector = (crop_id) =>
  createSelector(
    [fieldCropByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (fieldCrops, cropCatalogFilterDate) =>
      getPlannedFieldCrops(fieldCrops, new Date(cropCatalogFilterDate).getTime()),
  );
export const expiredFieldCropByCropIdSelector = (crop_id) =>
  createSelector(
    [fieldCropByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (fieldCrops, cropCatalogFilterDate) =>
      getExpiredFieldCrops(fieldCrops, new Date(cropCatalogFilterDate).getTime()),
  );
export const cropVarietiesWithoutManagementPlanByCropIdSelector = (crop_id) =>
  createSelector([cropVarietiesWithoutManagementPlanSelector], (cropVarieties) =>
    cropVarieties.filter((cropVariety) => cropVariety.crop_id === crop_id),
  );

const getUniqueEntities = (entities, key) => {
  const entitiesByKey = {};
  for (const entity of entities) {
    entitiesByKey[entity[key]] = entity;
  }
  return Object.values(entitiesByKey);
};

export const currentCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([currentFieldCropByCropIdSelector(crop_id)], (fieldCrops) =>
    getUniqueEntities(fieldCrops, 'crop_variety_id'),
  );
export const plannedCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([plannedFieldCropByCropIdSelector(crop_id)], (fieldCrops) =>
    getUniqueEntities(fieldCrops, 'crop_variety_id'),
  );
export const expiredCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([expiredFieldCropByCropIdSelector(crop_id)], (fieldCrops) =>
    getUniqueEntities(fieldCrops, 'crop_variety_id'),
  );
