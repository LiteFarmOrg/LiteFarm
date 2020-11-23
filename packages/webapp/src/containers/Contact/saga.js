/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
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

import { call, select, takeEvery } from 'redux-saga/effects';
import { SEND_CONTACT_FORM } from './constants';
import { toastr } from 'react-redux-toastr';
import { loginSelector } from '../loginSlice';
import { getHeader } from '../saga';

const axios = require('axios');

export function* sendContactForm(action) {
  let { farm_id } = yield select(loginSelector);

  const contactDetails = action.contactDetails;
  const data = {
    email: contactDetails.email,
    farm_id: farm_id,
    body: contactDetails.body,
  };

  try {
    const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLSfstT0bLmhp-DlJu_Iz9hcc58FTNcnT3HwBm8ZW6Q3Sb3seOg/formResponse';
    const GOOGLE_FORM_EMAIL_ID = 'emailAddress';
    const GOOGLE_FORM_MESSAGE_ID = 'entry.1602744550';
    const CORS_FIX = 'https://cors-anywhere.herokuapp.com/';

    const formData = new FormData();
    formData.append(GOOGLE_FORM_MESSAGE_ID, data.body);
    formData.append(GOOGLE_FORM_EMAIL_ID, data.email);
    const result = yield call(axios.post, CORS_FIX + GOOGLE_FORM_ACTION_URL, formData);
    if (result) {
      toastr.success('Submitted Contact Form!')
    }
  } catch (e) {
    toastr.error("Error, Could Not Submit A Contact Form");
    console.log("Unsuccessful in Sending Contact Form");
  }
}

export default function* contactSaga() {
  yield takeEvery(SEND_CONTACT_FORM, sendContactForm);
}