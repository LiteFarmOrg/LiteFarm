import { SET_FARM_ID_IN_PEOPLE, SET_ROLES_IN_PEOPLE, SET_USERS_IN_PEOPLE } from './constants';

const initialState = {
  workers: [],
  admins: [],
  farm_id: null,
  addedUser: false,
  owners: [],
  managers: [],
  extensionOfficers: [],
  pseudoWorkers: [],
  roles: [],
};

function peopleReducer(state = initialState, action) {
  let users = {};
  switch (action.type) {
    case SET_USERS_IN_PEOPLE:
      const roleMap = {
        "Worker Without Account": "pseudoWorkers",
        "Extension Officer": "extensionOfficers",
        "Owner": "owners",
        "Manager": "managers",
        "Worker": "workers"
      }
      action.users.forEach(user => {
        const role = roleMap[user.role];
        if (!users[role]) {
          // if the current user role does not exist, create a new array for it
          users[role] = [];
        }
        users[role].push(user);
      });
      let temp_state = JSON.parse(JSON.stringify(state));

      delete temp_state.workers;
      delete temp_state.owners;
      delete temp_state.managers;
      delete temp_state.extensionOfficers;
      delete temp_state.pseudoWorkers;
      if(temp_state.hasOwnProperty('worker without accounts')){
        delete temp_state['worker without accounts'];
      }

      return Object.assign({}, temp_state, users);
    case SET_FARM_ID_IN_PEOPLE:
      return Object.assign({}, state, {
        farm_id: action.farm_id,
      });
    case SET_ROLES_IN_PEOPLE:
      return Object.assign({}, state, { roles: action.roles });
    default:
      return state
  }
}

export default peopleReducer;
