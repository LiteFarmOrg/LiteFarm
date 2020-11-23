/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (components.test.js) is part of LiteFarm.
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

import { takeEvery } from 'redux-saga/effects';
import { patchOutroStepSaga } from '../containers/Outro/saga';

describe('patchOutroStep', () => {
    const genObject = patchOutroStepSaga();

    it('should wait for FINISH_ONBOARDING action and call patchOutroStepSaga', () => {
        expect(genObject.next().value).toEqual(takeEvery('FINISH_ONBOARDING', patchOutroStepSaga))
    })
})