import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietyEntitiesSelector } from './cropVarietySlice';
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

const getExpiredFieldCrops = (fieldCrops, time) =>
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

const getCurrentFieldCrops = (fieldCrops, time) =>
  fieldCrops.filter(
    (fieldCrop) =>
      new Date(fieldCrop.end_date).getTime() >= time &&
      new Date(fieldCrop.start_date).getTime() <= time,
  );

export const plannedFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return getPlannedFieldCrops(fieldCrops, lastActiveDatetime);
  },
);

const getPlannedFieldCrops = (fieldCrops, time) =>
  fieldCrops.filter((fieldCrop) => new Date(fieldCrop.start_date).getTime() > time);

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

export const cropCataloguesSelector = createSelector(
  [fieldCropsSelector, cropCatalogueFilterDateSelector],
  (fieldCrops, cropCatalogFilterDate) => {
    const time = new Date(cropCatalogFilterDate).getTime();
    const fieldCropsByStatus = {
      active: getCurrentFieldCrops(fieldCrops, time),
      planned: getPlannedFieldCrops(fieldCrops, time),
      past: getExpiredFieldCrops(fieldCrops, time),
    };
    const fieldCropsByCommonName = {};
    for (const status in fieldCropsByStatus) {
      for (const fieldCrop of fieldCropsByStatus[status]) {
        if (!fieldCropsByCommonName.hasOwnProperty(fieldCrop.crop_common_name)) {
          fieldCropsByCommonName[fieldCrop.crop_common_name] = {
            active: [],
            planned: [],
            past: [],
            crop_common_name: fieldCrop.crop_common_name,
            crop_translation_key: fieldCrop.crop_translation_key,
            imageKey: fieldCrop.crop_translation_key?.toLowerCase(),
          };
        }
        fieldCropsByCommonName[fieldCrop.crop_common_name][status].push(fieldCrop);
      }
    }
    return Object.values(fieldCropsByCommonName);
  },
);

export const cropCataloguesStatusSelector = createSelector([cropCataloguesSelector], (crops) => {
  const cropCataloguesStatus = { active: 0, planned: 0, past: 0 };
  for (const fieldCropsByStatus of crops) {
    for (const status in fieldCropsByStatus) {
      cropCataloguesStatus[status] += fieldCropsByStatus[status].length;
    }
  }
  return {
    ...cropCataloguesStatus,
    sum: cropCataloguesStatus.active + cropCataloguesStatus.planned + cropCataloguesStatus.past,
  };
});
