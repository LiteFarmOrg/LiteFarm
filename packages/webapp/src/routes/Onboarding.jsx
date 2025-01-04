/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (Routes.js) is part of Lite
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

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';

import { useSelector } from 'react-redux';
import { userFarmLengthSelector } from '../containers/userFarmSlice';
import Spinner from '../components/Spinner';
import { hookFormPersistSelector } from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';

const RoleSelection = React.lazy(() => import('../containers/RoleSelection'));
const Outro = React.lazy(() => import('../containers/Outro'));
const ChooseFarm = React.lazy(() => import('../containers/ChooseFarm'));
const WelcomeScreen = React.lazy(() => import('../containers/WelcomeScreen'));
const AddFarm = React.lazy(() => import('../containers/AddFarm'));
const ConsentForm = React.lazy(() => import('../containers/Consent'));
const InterestedOrganic = React.lazy(
  () =>
    import('../containers/OrganicCertifierSurvey/InterestedOrganic/OnboardingInterestedOrganic'),
);
const CertificationSelection = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/CertificationSelection/OnboradingCertificationSelection'
    ),
);

const CertifierSelectionMenu = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/CertifierSelectionMenu/OnboradingCertifierSelectionMenu'
    ),
);

const SetCertificationSummary = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/SetCertificationSummary/OnboardingSetCertificationSummary'
    ),
);

const RequestCertifier = React.lazy(
  () => import('../containers/OrganicCertifierSurvey/RequestCertifier/OnboardingRequestCertifier'),
);

function OnboardingFlow({
  step_one,
  step_two,
  step_three,
  step_four,
  step_five,
  has_consent,
  farm_id,
}) {
  const { interested } = useSelector(
    hookFormPersistSelector,
    (pre, next) => pre.interested === next.interested,
  );

  const hasUserFarms = useSelector(userFarmLengthSelector);
  return (
    // <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/farm_selection" element={<ChooseFarm />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/add_farm" element={<AddFarm />} />

      {step_one && <Route path="/role_selection" element={<RoleSelection />} />}
      {step_two && !step_five && <Route path="/consent" element={<ConsentForm />} />}
      {step_five && !has_consent && (
        <Route path="/consent">
          <ConsentForm goBackTo={'/farm_selection'} goForwardTo={'/'} />
        </Route>
      )}
      {step_three && (
        <Route path="/certification/interested_in_organic" element={<InterestedOrganic />} />
      )}
      {(step_four || interested) && (
        <Route path="/certification/selection" element={<CertificationSelection />} />
      )}
      {(step_four || interested) && (
        <Route path="/certification/certifier/selection" element={<CertifierSelectionMenu />} />
      )}
      {(step_four || interested) && (
        <Route path="/certification/certifier/request" element={<RequestCertifier />} />
      )}
      {(step_four || interested) && (
        <Route path="/certification/summary" element={<SetCertificationSummary />} />
      )}
      {step_four && <Route path="/outro" element={<Outro />} />}

      {/* <Route>
          <>
            {!step_one && <Route render={() => <Navigate to={'/add_farm'} />} />}
            {step_four && !has_consent && (
              <Route render={() => <Navigate to={'/consent'} />} />
            )}
            {!farm_id && hasUserFarms && (
              <Route render={() => <Navigate to={'/farm_selection'} />} />
            )}
            {(!farm_id || !step_one) && !hasUserFarms && (
              <Route render={() => <Navigate to={'/welcome'} />} />
            )}
            {step_one && !step_two && (
              <Route render={() => <Navigate to={'/role_selection'} />} />
            )}
            {step_two && !step_three && <Route render={() => <Navigate to={'/consent'} />} />}
            {step_one && step_three && !step_four && (
              <Route
                render={() => <Navigate to={'/certification/interested_in_organic'} />}
              />
            )}
            {step_one && step_four && !step_five && (
              <Route render={() => <Navigate to={'/outro'} />} />
            )}
          </>
        </Route> */}
    </Routes>
    // </Suspense>
  );
}

export default OnboardingFlow;
