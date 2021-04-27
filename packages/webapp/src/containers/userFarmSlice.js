import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

export function onLoadingStart(state) {
  state.loading = true;
}

export function onLoadingFail(state, { payload: error }) {
  state.loading = false;
  state.error = error;
  state.loaded = true;
}

export function onLoadingSuccess(state) {
  state.loading = false;
  state.error = null;
  state.loaded = true;
}

const adminRoles = [1, 2, 5];

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
  loaded: false,
  farm_id: undefined,
  user_id: undefined,
};

const addUserFarm = (state, { payload: userFarm }) => {
  state.loading = false;
  state.error = null;
  const { farm_id, user_id } = userFarm;
  if (!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])) {
    state.farmIdUserIdTuple.push({ farm_id, user_id });
  }
  state.byFarmIdUserId[farm_id] = state.byFarmIdUserId[farm_id] || {};
  state.byFarmIdUserId[farm_id][user_id] = userFarm;
};

const removeUserFarm = (state, { payload: userFarm }) => {
  const { farm_id, user_id } = userFarm;
  if (state.byFarmIdUserId[farm_id]?.[user_id]) {
    delete state.byFarmIdUserId[farm_id]?.[user_id];
    state.farmIdUserIdTuple = state.farmIdUserIdTuple.filter(
      (farmIdUserIdTuple) =>
        farmIdUserIdTuple.farm_id !== farm_id && farmIdUserIdTuple.user_id !== user_id,
    );
  }
};

const userFarmSlice = createSlice({
  name: 'userFarmReducer',
  initialState,
  reducers: {
    onLoadingUserFarmsStart: onLoadingStart,
    onLoadingUserFarmsFail: onLoadingFail,
    loginSuccess: (state, { payload: { user_id } }) => {
      state.user_id = user_id;
    },
    selectFarmSuccess: (state, { payload: { farm_id } }) => {
      state.farm_id = farm_id;
    },
    logoutSuccess: (state) => {
      state.user_id = undefined;
      state.farm_id = undefined;
    },
    deselectFarmSuccess: (state) => (state.farm_id = undefined),
    getUserFarmsSuccess: (state, { payload: userFarms }) => {
      state.loading = false;
      state.error = null;
      state.loaded = true;
      userFarms.forEach((userFarm) => {
        const { farm_id, user_id } = userFarm;
        if (!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])) {
          state.farmIdUserIdTuple.push({ farm_id, user_id });
        }
        const prevUserFarms = state.byFarmIdUserId[farm_id] || {};
        state.byFarmIdUserId[farm_id] = prevUserFarms;
        state.byFarmIdUserId[farm_id][user_id] = prevUserFarms[user_id] || {};
        Object.assign(state.byFarmIdUserId[farm_id][user_id], userFarm);
      });
    },
    postFarmSuccess: addUserFarm,
    patchRoleStepTwoSuccess: (state, { payload }) => {
      const { step_two, step_two_end, role_id, farm_id, user_id, owner_operated, role } = payload;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_two,
        step_two_end,
        role_id,
        role,
        owner_operated,
      });
    },
    patchConsentStepThreeSuccess: (state, { payload }) => {
      const {
        step_three,
        step_three_end,
        has_consent,
        consent_version,
        farm_id,
        user_id,
      } = payload;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_three,
        step_three_end,
        has_consent,
        consent_version,
      });
    },
    patchStatusConsentSuccess: (state, { payload }) => {
      const { has_consent, consent_version, status, farm_id, user_id } = payload;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        has_consent,
        consent_version,
        status,
      });
    },
    patchStepFourSuccess: (state, { payload: { step_four, step_four_end, farm_id, user_id } }) => {
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_four,
        step_four_end,
      });
    },
    patchStepFiveSuccess: (state, { payload: { step_five, step_five_end, farm_id, user_id } }) => {
      Object.assign(state.byFarmIdUserId[farm_id][user_id], {
        step_five,
        step_five_end,
      });
    },
    putUserSuccess: (state, { payload: user }) => {
      const { farm_id, user_id } = user;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], user);
    },
    // TODO: add role: Manager/Worker after userFarm is created;
    postUserSuccess: addUserFarm,
    patchUserStatusSuccess: (state, { payload: { farm_id, user_id, status } }) => {
      state.byFarmIdUserId[farm_id][user_id].status = status;
    },
    patchFarmSuccess: (state, { payload: farm }) => {
      const { farm_id, user_id } = farm;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], farm);
    },
    acceptInvitationSuccess: (state, { payload: userFarm }) => {
      addUserFarm(state, { payload: userFarm });
      state.user_id = userFarm.user_id;
      state.farm_id = userFarm.farm_id;
    },
    invitePseudoUserSuccess: (state, { payload: { newUserFarm, pseudoUserFarm } }) => {
      removeUserFarm(state, { payload: pseudoUserFarm });
      addUserFarm(state, { payload: newUserFarm });
    },
    setLoadingStart: (state, {}) => {
      state.loading = true;
    },
    setLoadingEnd: (state, {}) => {
      state.loading = false;
    },
  },
});

export const {
  onLoadingUserFarmsStart,
  onLoadingUserFarmsFail,
  getUserFarmsSuccess,
  postFarmSuccess,
  patchRoleStepTwoSuccess,
  patchConsentStepThreeSuccess,
  patchStepFourSuccess,
  patchStepFiveSuccess,
  putUserSuccess,
  postUserSuccess,
  patchUserStatusSuccess,
  patchFarmSuccess,
  patchStatusConsentSuccess,
  deselectFarmSuccess,
  loginSuccess,
  logoutSuccess,
  selectFarmSuccess,
  acceptInvitationSuccess,
  invitePseudoUserSuccess,
  setLoadingStart,
  setLoadingEnd,
} = userFarmSlice.actions;
export default userFarmSlice.reducer;

export const userFarmReducerSelector = (state) => state.entitiesReducer[userFarmSlice.name];
export const loginSelector = createSelector(userFarmReducerSelector, ({ farm_id, user_id }) => ({
  farm_id,
  user_id,
}));
export const userFarmsByUserSelector = createSelector(
  [loginSelector, userFarmReducerSelector],
  ({ user_id }, { byFarmIdUserId, loading, error, ...rest }) => {
    return user_id ? getUserFarmsByUser(byFarmIdUserId, user_id) : [];
  },
);
export const userFarmsByFarmSelector = createSelector(
  [loginSelector, userFarmReducerSelector],
  ({ farm_id, user_id }, { byFarmIdUserId, loading, error, ...rest }) => {
    if (!farm_id) return [];
    return Object.values(byFarmIdUserId[farm_id]);
  },
);
export const userFarmSelector = createSelector(
  [loginSelector, userFarmReducerSelector],
  ({ farm_id, user_id }, { byFarmIdUserId, loading, error }) => {
    return farm_id && user_id
      ? {
          is_admin: adminRoles.includes(byFarmIdUserId[farm_id][user_id].role_id),
          ...byFarmIdUserId[farm_id][user_id],
        }
      : {};
  },
);
export const isAdminSelector = createSelector(
  [loginSelector, userFarmReducerSelector],
  ({ farm_id, user_id }, { byFarmIdUserId, loading, error }) => {
    return farm_id && user_id
      ? adminRoles.includes(byFarmIdUserId[farm_id][user_id].role_id)
      : false;
  },
);
export const userFarmStatusSelector = createSelector(
  userFarmReducerSelector,
  ({ loading, error, loaded }) => ({
    loading,
    error,
    loaded,
  }),
);
export const userFarmLengthSelector = createSelector(
  userFarmReducerSelector,
  ({ farmIdUserIdTuple }) => {
    return farmIdUserIdTuple.length;
  },
);
export const userFarmEntitiesSelector = createSelector(
  userFarmReducerSelector,
  ({ byFarmIdUserId }) => byFarmIdUserId,
);

export const measurementSelector = createSelector(
  userFarmSelector,
  (userFarm) => userFarm.units.measurement,
);

const getUserFarmsByUser = (byFarmIdUserId, user_id) => {
  let userFarms = [];
  for (let by_user of Object.values(byFarmIdUserId)) {
    by_user[user_id] && userFarms.push(by_user[user_id]);
  }
  //TODO order should be defined in farmIdUserIdTuple
  return userFarms.sort((userFarm1, userFarm2) =>
    userFarm1.farm_name > userFarm2.farm_name ? 1 : 0,
  );
};

export const getUserFarmSelector = (farmId, userId) => {
  return createSelector(userFarmReducerSelector, ({ byFarmIdUserId }) =>
    byFarmIdUserId[farmId] && byFarmIdUserId[farmId][userId] ? byFarmIdUserId[farmId][userId] : {},
  );
};
