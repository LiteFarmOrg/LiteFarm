import { SET_USER_IN_NOTIFICATION } from './constants';

const initialState = {
  user: null
};

function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER_IN_NOTIFICATION:
      return Object.assign({}, state,{
        user: action.user
      });
    default:
      return state
  }
}

export default notificationReducer;
