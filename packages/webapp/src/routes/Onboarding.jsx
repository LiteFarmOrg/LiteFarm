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

/* eslint-disable react/no-children-prop */
import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { userFarmLengthSelector } from '../containers/userFarmSlice';
import Spinner from '../components/Spinner';
import { hookFormPersistSelector } from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import RequireCondition from './RequireCondition';

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
        <Route path="/farm_selection" exact children={<ChooseFarm />} />
        <Route path="/welcome" exact children={<WelcomeScreen />} />
        <Route path="/add_farm" exact children={<AddFarm />} />

        <Route
          path="/role_selection"
          exact
          children={
            <RequireCondition condition={step_one}>
              <RoleSelection />
            </RequireCondition>
          }
        />
        <Route
          path="/consent"
          exact
          children={
            <RequireCondition condition={step_two && !step_five}>
              <ConsentForm />
            </RequireCondition>
          }
        />
        <Route
          path="/consent"
          exact
          children={
            <RequireCondition condition={step_five && !has_consent}>
              <ConsentForm goBackTo={'/farm_selection'} goForwardTo={'/'} />
            </RequireCondition>
          }
        />

        <Route
          path="/certification/interested_in_organic"
          exact
          children={
            <RequireCondition condition={step_three}>
              <InterestedOrganic />
            </RequireCondition>
          }
        />
        <Route
          path="/certification/selection"
          exact
          children={
            <RequireCondition condition={step_four || interested}>
              <CertificationSelection />
            </RequireCondition>
          }
        />
        <Route
          path="/certification/certifier/selection"
          exact
          children={
            <RequireCondition condition={step_four || interested}>
              <CertifierSelectionMenu />
            </RequireCondition>
          }
        />
        <Route
          path="/certification/certifier/request"
          exact
          children={
            <RequireCondition condition={step_four || interested}>
              <RequestCertifier />
            </RequireCondition>
          }
        />
        <Route
          path="/certification/summary"
          exact
          children={
            <RequireCondition condition={step_four || interested}>
              <SetCertificationSummary />
            </RequireCondition>
          }
        />
        <Route
          path="/outro"
          exact
          children={
            <RequireCondition condition={step_four}>
              <Outro />
            </RequireCondition>
          }
        />

        <Route
          render={() => {
            if (!step_one) {
              return <Redirect to="/add_farm" />;
            }

            if (step_four && !has_consent) {
              return <Redirect to="/consent" />;
            }

            if (!farm_id && hasUserFarms) {
              return <Redirect to="/farm_selection" />;
            }

            if ((!farm_id || !step_one) && !hasUserFarms) {
              return <Redirect to="/welcome" />;
            }

            if (step_one && !step_two) {
              return <Redirect to="/role_selection" />;
            }

            if (step_two && !step_three) {
              return <Redirect to="/consent" />;
            }

            if (step_one && step_three && !step_four) {
              return <Redirect to="/certification/interested_in_organic" />;
            }

            if (step_one && step_four && !step_five) {
              return <Redirect to="/outro" />;
            }

            return null;
          }}
        />
      </Switch>
    </Suspense>
  );
}

export default OnboardingFlow;
