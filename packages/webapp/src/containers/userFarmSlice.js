import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail, loginSelector } from './loginSlice';
import { createSelector } from 'reselect';

export const initialState = {
  farmIdUserIdTuple: [
    // {farm_id, user_id}
  ],
  byFarmIdUserId: {
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

const addUserFarm = (state, { payload: userFarm }) => {
  state.loading = false;
  state.error = null;
  const { farm_id, user_id } = userFarm;
  if(!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])){
    state.farmIdUserIdTuple.push({ farm_id, user_id });
  }
  state.byFarmIdUserId[farm_id] = state.byFarmIdUserId[farm_id] || {};
  state.byFarmIdUserId[farm_id][user_id] = userFarm;
}

const userFarmSlice = createSlice({
  name: 'userFarmReducer',
  initialState,
  reducers: {
    onLoadingUserFarmsStart: onLoadingStart,
    onLoadingUserFarmsFail: onLoadingFail,
    getUserFarmsSuccess: (state, { payload: userFarms }) => {
      state.loading = false;
      state.error = null;
      userFarms.forEach(userFarm => {
        const { farm_id, user_id } = userFarm;
        if(!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])){
          state.farmIdUserIdTuple.push({ farm_id, user_id });
        }
        const prevUserFarms = state.byFarmIdUserId[farm_id] || {};
        state.byFarmIdUserId[farm_id] = prevUserFarms;
        state.byFarmIdUserId[farm_id][user_id] = prevUserFarms[farm_id] || {};
        Object.assign(state.byFarmIdUserId[farm_id][user_id], userFarm);
      });
    },
    postFarmSuccess: addUserFarm,
    patchRoleStepTwoSuccess: (state, { payload }) => {
      const { step_two, step_two_end, role_id, farm_id, user_id } = payload;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], { step_two, step_two_end, role_id });
    },
    patchConsentStepThreeSuccess: (state, { payload }) => {
      const { step_three, step_three_end, has_consent, consent_version, farm_id, user_id } = payload;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_three,
        step_three_end,
        has_consent,
        consent_version,
      });
    },
    patchStepFourSuccess: (state, { payload: { step_four, step_four_end, farm_id, user_id } }) => {
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_four, step_four_end,
      });
    },
    patchStepFiveSuccess: (state, { payload: { step_five, step_five_end, farm_id, user_id } }) => {
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_five, step_five_end,
      });
    },
    putUserSuccess: (state, { payload: user }) => {
      const { farm_id, user_id } = user;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], user);
    },
    postUserSuccess: addUserFarm,
    patchUserStatusSuccess: (state, { payload: { farm_id, user_id, status } }) => {
      state.byFarmIdUserId[farm_id][user_id].status = status;
    },
  },
});

export const {
  onLoadingUserFarmsStart, onLoadingUserFarmsFail, getUserFarmsSuccess, postFarmSuccess, patchRoleStepTwoSuccess,
  patchConsentStepThreeSuccess, patchStepFourSuccess, patchStepFiveSuccess, putUserSuccess, postUserSuccess, patchUserStatusSuccess,
} = userFarmSlice.actions;
export default userFarmSlice.reducer;


export const userFarmReducerSelector = state => state.entitiesReducer[userFarmSlice.name];
export const userFarmsByUserSelector = createSelector([loginSelector, userFarmReducerSelector], ({ user_id }, { byFarmIdUserId, loading, error, ...rest }) => {
  return user_id ? getUserFarmsByUser(byFarmIdUserId, user_id) : [];
});
export const userFarmsByFarmSelector = createSelector([loginSelector, userFarmReducerSelector], ({ farm_id }, { byFarmIdUserId, loading, error, ...rest }) => {
  return farm_id ? Object.values(byFarmIdUserId[farm_id]) : [];
});
export const userFarmSelector = createSelector([loginSelector, userFarmReducerSelector], ({ farm_id, user_id }, { byFarmIdUserId, loading, error }) => {
  return (farm_id && user_id) ? byFarmIdUserId[farm_id][user_id] : {};
});
export const userFarmStatusSelector = createSelector(userFarmReducerSelector, ({ loading, error }) => ({
  loading,
  error,
}));

const getUserFarmsByUser = (byFarmIdUserId, user_id) => {
  let userFarms = [];
  for (let by_user of Object.values(byFarmIdUserId)) {
    by_user[user_id] && userFarms.push(by_user[user_id]);
  }
  return userFarms.sort((userFarm1, userFarm2) => userFarm1.farm_name > userFarm2.farm_name ? 1 : 0);
}
