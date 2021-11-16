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
import { Redirect, Route, Switch } from 'react-router-dom';

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
const InterestedOrganic = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/InterestedOrganic/OnboardingInterestedOrganic'),
);
const CertificationSelection = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/CertificationSelection/OnboradingCertificationSelection'
  ),
);

const CertifierSelectionMenu = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/CertifierSelectionMenu/OnboradingCertifierSelectionMenu'
  ),
);

const SetCertificationSummary = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/SetCertificationSummary/OnboardingSetCertificationSummary'
  ),
);

const RequestCertifier = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/RequestCertifier/OnboardingRequestCertifier'),
);

const SSOUserCreateAccountInfo = React.lazy(() => import('../containers/SSOUserCreateAccountInfo'));

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
    <Suspense fallback={<Spinner />}>
      <Switch>
        <Route path="/sso_signup_information" component={SSOUserCreateAccountInfo} />
        <Route path="/farm_selection" exact component={() => <ChooseFarm />} />
        <Route path="/welcome" exact component={WelcomeScreen} />
        <Route path="/add_farm" exact component={AddFarm} />

        {step_one && <Route path="/role_selection" exact component={RoleSelection} />}
        {step_two && !step_five && <Route path="/consent" exact component={ConsentForm} />}
        {step_five && !has_consent && (
          <Route
            path="/consent"
            exact
            component={() => <ConsentForm goBackTo={'/farm_selection'} goForwardTo={'/'} />}
          />
        )}
        {step_three && (
          <Route path="/certification/interested_in_organic" exact component={InterestedOrganic} />
        )}
        {(step_four || interested) && (
          <Route path="/certification/selection" exact component={CertificationSelection} />
        )}
        {(step_four || interested) && (
          <Route
            path="/certification/certifier/selection"
            exact
            component={CertifierSelectionMenu}
          />
        )}
        {(step_four || interested) && (
          <Route path="/certification/certifier/request" exact component={RequestCertifier} />
        )}
        {(step_four || interested) && (
          <Route path="/certification/summary" exact component={SetCertificationSummary} />
        )}
        {step_four && <Route path="/outro" exact component={Outro} />}

        <Route>
          <>
            {!step_one && <Redirect to={'/add_farm'} />}
            {step_four && !has_consent && <Redirect to={'/consent'} />}
            {!farm_id && hasUserFarms && <Redirect to={'/farm_selection'} />}
            {(!farm_id || !step_one) && !hasUserFarms && <Redirect to={'/welcome'} />}
            {step_one && !step_two && <Redirect to={'/role_selection'} />}
            {step_two && !step_three && <Redirect to={'/consent'} />}
            {step_one && step_three && !step_four && (
              <Redirect to={'/certification/interested_in_organic'} />
            )}
            {step_one && step_four && !step_five && <Redirect to={'/outro'} />}
          </>
        </Route>
      </Switch>
    </Suspense>
  );
}

export default OnboardingFlow;
