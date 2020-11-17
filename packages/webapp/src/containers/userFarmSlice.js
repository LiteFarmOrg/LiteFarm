import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail, loginSelector } from './loginSlice';
import { createSelector } from 'reselect';

export const initialState = {
  all_farm_id_user_id: {
    // farm_id1:[user_id1, user_id2],
    // farm_id2:[user_id1, user_id2],
  },
  by_farm_id_user_id: {
    // farm_id1:{
    //   user_id1:{...userFarm},
    //   user_id2:{...userFarm},
    // },
    // farm_id2:{
    //   user_id1:{...userFarm},
    //   user_id2:{...userFarm},
    // }
  },
  loading: false,
  error: undefined,
};

const userFarmSlice = createSlice({
  name: 'userFarmReducer',
  initialState,
  reducers: {
    onLoadingUserFarmsStart: onLoadingStart,
    onLoadingUserFarmsFail: onLoadingFail,
    getUserFarmsSuccess: (state, { payload: { userFarms } }) => {
      state.loading = false;
      state.error = null;
      userFarms.forEach(userFarm => {
        const prevUserFarms = state.by_farm_id_user_id[userFarm.farm_id] || {};
        state.by_farm_id_user_id[userFarm.farm_id] = prevUserFarms;
        state.by_farm_id_user_id[userFarm.farm_id][userFarm.user_id] = prevUserFarms[userFarm.farm_id] || {};
        Object.assign(state.by_farm_id_user_id[userFarm.farm_id][userFarm.user_id], userFarm);
      });
      for (let [farm_id, by_user_id] of Object.entries(state.by_farm_id_user_id)) {
        state.all_farm_id_user_id[farm_id] = Object.keys(by_user_id);
      }
    },
    postFarmSuccess: (state, { payload: { userFarm } }) => {
      state.loading = false;
      state.error = null;
      state.by_farm_id_user_id[userFarm.farm_id] = {};
      state.by_farm_id_user_id[userFarm.farm_id][userFarm.user_id] = userFarm;
    },
    patchRoleStepTwoSuccess: (state, { payload }) => {
      const { step_two, step_two_end, role_id, farm_id, user_id } = payload;
      Object.assign(state.by_farm_id_user_id[farm_id][user_id], { step_two, step_two_end, role_id });
    },
    patchConsentStepThreeSuccess: (state, { payload }) => {
      const { step_three, step_three_end, has_consent, consent_version, farm_id, user_id } = payload;
      Object.assign(state.by_farm_id_user_id[farm_id][user_id], {
        step_three,
        step_three_end,
        has_consent,
        consent_version,
      });
    },
    patchStepFourSuccess: (state, { payload: { step_four, step_four_end, farm_id, user_id } }) => {
      Object.assign(state.by_farm_id_user_id[farm_id][user_id], {
        step_four, step_four_end,
      });
    },
    patchStepFiveSuccess: (state, { payload: { step_five, step_five_end, farm_id, user_id } }) => {
      Object.assign(state.by_farm_id_user_id[farm_id][user_id], {
        step_five, step_five_end,
      });
    },
  },
});

export const { onLoadingUserFarmsStart, onLoadingUserFarmsFail, getUserFarmsSuccess, postFarmSuccess, patchRoleStepTwoSuccess,
  patchConsentStepThreeSuccess, patchStepFourSuccess, patchStepFiveSuccess } = userFarmSlice.actions;
export default userFarmSlice.reducer;


export const userFarmReducerSelector = state => state.entitiesReducer[userFarmSlice.name];
export const userFarmsByUserSelector = createSelector([loginSelector, userFarmReducerSelector], ({ user_id }, { by_farm_id_user_id, loading, error, ...rest }) => {
  return user_id ? {
    userFarms: getUserFarmsByUser(by_farm_id_user_id, user_id),
    loading,
    error,
    by_farm_id_user_id, ...rest,
  } : { loading, error, userFarms: [] };
});
export const userFarmsByFarmSelector = createSelector([loginSelector, userFarmReducerSelector], ({ farm_id }, { by_farm_id_user_id, loading, error, ...rest }) => {
  return farm_id ? {
    userFarms: Object.values(by_farm_id_user_id[farm_id]),
    loading,
    error,
    by_farm_id_user_id, ...rest,
  } : { loading, error, userFarms: [] };
});
export const userFarmSelector = createSelector([loginSelector, userFarmReducerSelector], ({ farm_id, user_id }, { by_farm_id_user_id, loading, error }) => {
  return (farm_id && user_id) ? { userFarm: by_farm_id_user_id[farm_id][user_id], loading, error } : {
    loading,
    error,
    userFarm: {},
  };
});

const getUserFarmsByUser = (by_farm_id_user_id, user_id) => {
  let userFarms = [];
  for (let by_user of Object.values(by_farm_id_user_id)) {
    userFarms = [...userFarms, by_user[user_id]];
  }
  return userFarms.sort((userFarm1, userFarm2) => userFarm1.farm_name > userFarm2.farm_name ? 1 : 0);
}
