import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  switchFarm: false,
};

const switchFarmSlice = createSlice({
  name: 'switchFarmReducer',
  initialState,
  reducers: {
    switchFarmSuccess: (state, {payload: {farm_id}}) => {
      state.switchFarm = true
    },
  },
});


export const { switchFarmSuccess } = switchFarmSlice.actions;
export default switchFarmSlice.reducer;
export const switchFarmSelector = (state) => {
    return state.entitiesReducer[switchFarmSlice.name];
}