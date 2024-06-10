// https://redux-toolkit.js.org/tutorials/typescript#define-slice-state-and-action-types
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import type { RootState } from '../store/store';
import { AxiosError } from 'axios';
import { CONSENT_VERSION } from '../util/constants';

export interface Units {
  currency: string;
  measurement: 'metric' | 'imperial';
}

interface UserFarm {
  farm_id: string;
  user_id: string;
  units: Units;

  // https://www.typescriptlang.org/glossary#index-signatures
  [key: string]: any;
}

type SagaError = Error & Partial<AxiosError>;

interface UserFarmState {
  farmIdUserIdTuple: Array<{ farm_id: string; user_id: string }>;
  byFarmIdUserId: {
    [farmId: string]: {
      [userId: string]: UserFarm;
    };
  };
  loading: boolean;
  error?: SagaError | null;
  loaded: boolean;
  farm_id?: string;
  user_id?: string;
}

interface InvitePseudoUserSuccessPayload {
  newUserFarm: UserFarm;
  pseudoUserFarm: UserFarm;
}

export function onLoadingStart(state: UserFarmState) {
  state.loading = true;
}

export function onLoadingFail(state: UserFarmState, action: PayloadAction<SagaError>) {
  const { payload: error } = action;
  state.loading = false;
  state.error = error;
  state.loaded = true;
}

export function onLoadingSuccess(state: UserFarmState) {
  state.loading = false;
  state.error = null;
  state.loaded = true;
}

const adminRoles = [1, 2, 5];

export const initialState: UserFarmState = {
  farmIdUserIdTuple: [],
  byFarmIdUserId: {},
  loading: false,
  error: undefined,
  loaded: false,
  farm_id: undefined,
  user_id: undefined,
};

const addUserFarm = (state: UserFarmState, action: PayloadAction<UserFarm>) => {
  const { payload: userFarm } = action;
  state.loading = false;
  state.error = null;
  const { farm_id, user_id } = userFarm;
  if (!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])) {
    state.farmIdUserIdTuple.push({ farm_id, user_id });
  }
  state.byFarmIdUserId[farm_id] = state.byFarmIdUserId[farm_id] || {};
  state.byFarmIdUserId[farm_id][user_id] = userFarm;
  delete state.byFarmIdUserId[farm_id][user_id].role;
};

const removeUserFarm = (state: UserFarmState, action: PayloadAction<UserFarm>) => {
  const { payload: userFarm } = action;
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
      userFarms.forEach((userFarm: UserFarm) => {
        const { farm_id, user_id } = userFarm;
        if (!(state.byFarmIdUserId[farm_id] && state.byFarmIdUserId[farm_id][user_id])) {
          state.farmIdUserIdTuple.push({ farm_id, user_id });
        }
        const prevUserFarms = state.byFarmIdUserId[farm_id] || {};
        state.byFarmIdUserId[farm_id] = prevUserFarms;
        state.byFarmIdUserId[farm_id][user_id] = prevUserFarms[user_id] || {};

        const { has_consent, consent_version } = userFarm;
        userFarm.has_consent = has_consent && consent_version === CONSENT_VERSION;

        Object.assign(state.byFarmIdUserId[farm_id][user_id], userFarm);
        delete state.byFarmIdUserId[farm_id][user_id].role;
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
      const { step_three, step_three_end, has_consent, consent_version, farm_id, user_id } =
        payload;
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
    patchFarmSuccess: (state, { payload: userFarm }) => {
      const { farm_id, user_id } = userFarm;
      Object.assign(state.byFarmIdUserId[farm_id][user_id], userFarm);
    },
    acceptInvitationSuccess: (state: UserFarmState, action: PayloadAction<UserFarm>) => {
      const { payload: userFarm } = action;
      addUserFarm(state, { payload: userFarm } as PayloadAction<UserFarm>);
      state.user_id = userFarm.user_id;
      state.farm_id = userFarm.farm_id;
    },
    invitePseudoUserSuccess: (state, action: PayloadAction<InvitePseudoUserSuccessPayload>) => {
      const {
        payload: { newUserFarm, pseudoUserFarm },
      } = action;
      removeUserFarm(state, { payload: pseudoUserFarm } as PayloadAction<UserFarm>);
      addUserFarm(state, { payload: newUserFarm } as PayloadAction<UserFarm>);
    },
    setLoadingStart: (state) => {
      state.loading = true;
    },
    setLoadingEnd: (state) => {
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

export const userFarmReducerSelector = (state: RootState) =>
  state.entitiesReducer[userFarmSlice.name];
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
  (userFarm) => (userFarm as UserFarm).units.measurement,
);

export const currencySelector = createSelector(
  userFarmSelector,
  (userFarm) => (userFarm as UserFarm).units.currency || 'USD',
);

const getUserFarmsByUser = (byFarmIdUserId: UserFarmState['byFarmIdUserId'], user_id: string) => {
  let userFarms = [];
  for (let by_user of Object.values(byFarmIdUserId)) {
    by_user[user_id] && userFarms.push(by_user[user_id]);
  }
  return userFarms.sort((userFarm1, userFarm2) =>
    userFarm1.farm_name > userFarm2.farm_name ? 1 : 0,
  );
};

export const getUserFarmSelector = (farmId: string, userId: string) => {
  return createSelector(userFarmReducerSelector, ({ byFarmIdUserId }) =>
    byFarmIdUserId[farmId] && byFarmIdUserId[farmId][userId] ? byFarmIdUserId[farmId][userId] : {},
  );
};
