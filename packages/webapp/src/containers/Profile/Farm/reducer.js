import { SET_FARM_DATA_SCHEDULE, } from './constants';

const initialState = {
 farm_data_schedule: null,
};

function farmReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FARM_DATA_SCHEDULE:
      return Object.assign({}, state, {
        farm_data_schedule: action.data,
      });
    default:
      return state
  }
}

export default farmReducer;
