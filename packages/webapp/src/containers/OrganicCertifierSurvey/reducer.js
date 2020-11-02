/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (reducer.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import {
  SET_ORGANIC_CERTIFIER_SURVEY_IN_STATE
} from './constants';

const initialState = {
  interested: false,
  certifiers: [],
  survey_id: undefined,
};

function certifierSurveyReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ORGANIC_CERTIFIER_SURVEY_IN_STATE:
      return Object.assign({}, state, { survey_id: action.survey.survey_id, interested: action.survey.interested, certifiers: action.survey.certifiers });
    default:
      return state
  }
}

export default certifierSurveyReducer;
