import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  switchFarm: false,
};

const switchFarmSlice = createSlice({
  name: 'switchFarmReducer',
  initialState,
  reducers: {
    switchFarmSuccess: (state) => {
      state.switchFarm = true
    },
    switchFarmCloseSuccess: (state) => {
        state.switchFarm = false
      },
  },
});


export const { switchFarmSuccess, switchFarmCloseSuccess } = switchFarmSlice.actions;
export default switchFarmSlice.reducer;
export const switchFarmSelector = (state) => {
    return state.entitiesReducer[switchFarmSlice.name];
}
export const switchFarmCloseSelector = (state) => {
    return state.entitiesReducer[switchFarmSlice.name];
}