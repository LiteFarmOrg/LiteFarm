import {
  SET_FERTILIZERS
} from './constants';

const initialState = {
  fertilizers: null
};

function fertReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FERTILIZERS:
      return Object.assign({}, state, {
        fertilizers: action.fertilizers,
      });
    default:
      return state
  }
}

export default fertReducer;
