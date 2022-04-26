import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { getDateInputFormat } from '../util/moment';
import i18n from '../locales/i18n';

const initialCropCatalogueFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
  date: undefined,
};
const initialDocumentsFilter = {
  TYPE: {},
  VALID_ON: undefined,
};
const intialTasksFilter = {
  STATUS: {},
  TYPE: {},
  LOCATION: {},
  CROP: {},
  ASSIGNEE: {},
  FROM_DATE: undefined,
  TO_DATE: undefined,
  IS_ASCENDING: false,
};

export const initialState = {
  cropCatalogue: initialCropCatalogueFilter,
  documents: initialDocumentsFilter,
  tasks: intialTasksFilter,
};

const filterSliceReducer = createSlice({
  name: 'filterReducer',
  initialState,
  reducers: {
    resetFilters: (state) => initialState,
    resetCropCatalogueFilter: (state) => {
      state.cropCatalogue = initialCropCatalogueFilter;
    },
    setCropCatalogueFilter: (state, { payload: cropCatalogueFilter }) => {
      Object.assign(state.cropCatalogue, cropCatalogueFilter);
    },
    setCropCatalogueFilterDate: (state, { payload: date }) => {
      state.cropCatalogue.date = date;
    },
    setCropVarietyFilterDefault: (state, { payload: cropId }) => {
      state[`${cropId}`] = initialCropCatalogueFilter;
    },
    setCropVarietyFilter: (state, { payload: { cropId, cropVarietyFilter } }) => {
      Object.assign(state[`${cropId}`], cropVarietyFilter);
    },
    removeFilter: (state, { payload: { pageFilterKey, filterKey, value } }) => {
      state[pageFilterKey][filterKey][value].active = false;
    },
    removeNonFilterValue: (state, { payload: { pageFilterKey, filterKey } }) => {
      state[pageFilterKey][filterKey] = undefined;
    },
    resetDocumentsFilter: (state) => {
      state.documents = initialDocumentsFilter;
    },
    setDocumentsFilter: (state, { payload: documentsFilter }) => {
      Object.assign(state.documents, documentsFilter);
    },
    resetTasksFilter: (state, { payload: { user_id, userFarms } }) => {
      state.tasks = {
        ...intialTasksFilter,
        ASSIGNEE: userFarms.reduce((assignees, userFarm) => {
          assignees[userFarm.user_id] = {
            active: false,
            label: `${userFarm.first_name} ${userFarm.last_name}`,
          };
          return assignees;
        }, {}),
      };
      state.tasks.ASSIGNEE[user_id].active = true;
      state.tasks.ASSIGNEE['unassigned'] = {
        active: false,
        label: i18n.t('TASK.UNASSIGNED'),
      };
    },
    setTasksFilter: (state, { payload: tasksFilter }) => {
      Object.assign(state.tasks, tasksFilter);
    },
  },
});

export const {
  resetFilters,
  resetCropCatalogueFilter,
  setCropCatalogueFilter,
  setCropCatalogueFilterDate,
  setCropVarietyFilterDefault,
  setCropVarietyFilter,
  removeFilter,
  removeNonFilterValue,
  resetDocumentsFilter,
  setDocumentsFilter,
  resetTasksFilter,
  setTasksFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;

const filterReducerSelector = (state) => {
  return state?.tempStateReducer[filterSliceReducer.name];
};

export const cropCatalogueFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.cropCatalogue,
);
export const cropVarietyFilterSelector = (cropId) => {
  return createSelector([filterReducerSelector], (filterReducer) => filterReducer[`${cropId}`]);
};
export const documentsFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.documents,
);
export const tasksFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.tasks,
);
export const cropCatalogueFilterDateSelector = createSelector(
  [cropCatalogueFilterSelector],
  (cropCatalogueFilter) => cropCatalogueFilter.date || getDateInputFormat(new Date()),
);

export const isFilterCurrentlyActiveSelector = (pageFilterKey) => {
  return createSelector([filterReducerSelector], (filterReducer) => {
    const targetPageFilter = filterReducer[pageFilterKey];
    let isActive = false;

    for (const filterKey in targetPageFilter) {
      const filter = targetPageFilter[filterKey];
      const filterType = typeof filter;

      if (filterType === 'object') {
        isActive = Object.values(filter).reduce((acc, curr) => {
          return acc || curr.active;
        }, isActive);
      } else {
        isActive = isActive || filterType === 'string';
      }
    }

    return isActive;
  });
};
