import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

export const initialState = {
  userEmail: '',
  userName: '',
};

const manualSignUpSlice = createSlice({
  name: 'manualSignUpReducer',
  initialState,
  reducers: {
    saveUserEmailSuccess: (state, {payload: email}) => {
      state.userEmail = email;
    },
    saveUserNameSuccess: (state, {payload: name}) => {
      state.userName = name;
      console.log("inside splice")
      console.log(state.userName)
    }
  },
});

export const { saveUserEmailSuccess, saveUserNameSuccess } = manualSignUpSlice.actions;

export default manualSignUpSlice.reducer;

export const manualSignUpReducerSelector = (state) => state?.entitiesReducer[manualSignUpSlice.name]; 

export const manualSignUpSelector = createSelector(
  [manualSignUpReducerSelector],
  ({ userEmail, userName }) => {
    return { userEmail, userName };
  },
);

