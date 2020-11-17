import { SET_DISEASES, SET_PESTICIDES } from './constants';

const initialState = {
  pesticides: null,
  diseases: null
};

function pestControlReducer(state = initialState, action) {
  switch (action.type) {
    case SET_DISEASES:
      return Object.assign({}, state, {
        diseases: action.diseases,
      });
    case SET_PESTICIDES:
      return Object.assign({}, state, {
        pesticides: action.pesticides,
      });
    default:
      return state
  }
}

export default pestControlReducer;
