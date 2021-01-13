import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  isInvitationFlow: false,
};

const invitationSlice = createSlice({
  name: 'invitationReducer',
  initialState,
  reducers: {
    enterInvitationFlow: (state, {}) => {
      state.isInvitationFlow = true;
    },
    leaveInvitationFlow: (state, {}) => {
      state.isInvitationFlow = false;
    },
  },
});

export const { enterInvitationFlow, leaveInvitationFlow } = invitationSlice.actions;
export default invitationSlice.reducer;
export const invitationSelector = (state) =>
  state?.tempStateReducer[invitationSlice.name].isInvitationFlow;
