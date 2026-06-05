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
import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { userFarmLengthSelector, userFarmStatusSelector } from '../containers/userFarmSlice';
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

function OnboardingFlow(props) {
  const { step_one, step_two, step_three, step_four, step_five, has_consent } = props;

  const { interested } = useSelector(
    hookFormPersistSelector,
    (pre, next) => pre.interested === next.interested,
  );

  const hasUserFarms = useSelector(userFarmLengthSelector);
  // FIX: the routes guard needs the farm-list load status. Uncomment this and
  // add userFarmStatusSelector to the userFarmSlice import above.
  const { loaded: farmsLoaded } = useSelector(userFarmStatusSelector);

  // TEMP welcome-trace. useLocation() exposes the React Router location so the log
  // can flag when it doesn't match window.location
  const location = useLocation();
  console.log('[welcome-trace] OnboardingFlow render', {
    routerLocation: location.pathname,
    windowLocation: window.location.pathname,
    MISMATCH: location.pathname !== window.location.pathname,
    hasUserFarms,
    farmsLoaded,
  }); // TEMP welcome-trace

  const requireConditionProps = { ...props, hasUserFarms, farmsLoaded };

  return (
    <Switch>
      <Route path="/farm_selection" exact children={<ChooseFarm />} />
      <Route path="/welcome" exact children={<WelcomeScreen />} />
      <Route path="/add_farm" exact children={<AddFarm />} />

      <Route
        path="/role_selection"
        exact
        children={
          <RequireCondition condition={step_one} {...requireConditionProps}>
            <RoleSelection />
          </RequireCondition>
        }
      />
      <Route
        path="/consent"
        exact
        children={
          <RequireCondition condition={step_two && !step_five} {...requireConditionProps}>
            <ConsentForm />
          </RequireCondition>
        }
      />
      <Route
        path="/consent"
        exact
        children={
          <RequireCondition condition={step_five && !has_consent} {...requireConditionProps}>
            <ConsentForm goBackTo={'/farm_selection'} goForwardTo={'/'} />
          </RequireCondition>
        }
      />

      <Route
        path="/certification/interested_in_organic"
        exact
        children={
          <RequireCondition condition={step_three} {...requireConditionProps}>
            <InterestedOrganic />
          </RequireCondition>
        }
      />
      <Route
        path="/certification/selection"
        exact
        children={
          <RequireCondition condition={step_four || interested} {...requireConditionProps}>
            <CertificationSelection />
          </RequireCondition>
        }
      />
      <Route
        path="/certification/certifier/selection"
        exact
        children={
          <RequireCondition condition={step_four || interested} {...requireConditionProps}>
            <CertifierSelectionMenu />
          </RequireCondition>
        }
      />
      <Route
        path="/certification/certifier/request"
        exact
        children={
          <RequireCondition condition={step_four || interested} {...requireConditionProps}>
            <RequestCertifier />
          </RequireCondition>
        }
      />
      <Route
        path="/certification/summary"
        exact
        children={
          <RequireCondition condition={step_four || interested} {...requireConditionProps}>
            <SetCertificationSummary />
          </RequireCondition>
        }
      />
      <Route
        path="/outro"
        exact
        children={
          <RequireCondition condition={step_four} {...requireConditionProps}>
            <Outro />
          </RequireCondition>
        }
      />
      {/* Fallback route - handles redirects when no other routes match */}
      <Route render={() => <RequireCondition {...requireConditionProps} />} />
    </Switch>
  );
}

// Reference: https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f#get-started-upgrading-today
const RequireCondition = ({
  condition,
  children,
  step_one,
  step_two,
  step_three,
  step_four,
  step_five,
  has_consent,
  farm_id,
  hasUserFarms,
  farmsLoaded, // FIX (commit 3): uncomment for the routes guard
}) => {
  if (condition) {
    return children;
  }

  if (step_one && step_four && !step_five) {
    return <Redirect to="/outro" />;
  }

  if (step_one && step_three && !step_four) {
    return <Redirect to="/certification/interested_in_organic" />;
  }

  if (step_two && !step_three) {
    return <Redirect to="/consent" />;
  }

  if (step_one && !step_two) {
    return <Redirect to="/role_selection" />;
  }

  if ((!farm_id || !step_one) && !hasUserFarms) {
    // TEMP welcome-trace: observes the hardcoded redirect below
    console.log('[welcome-trace] HISTORY.PUSH #B (RequireCondition) -> /welcome', {
      windowPath: window.location.pathname,
      hasUserFarms,
      farmsLoaded,
    }); // TEMP welcome-trace

    // FIX: uncomment the two lines below, delete the hardcoded redirect, and
    // wire up farmsLoaded (selector + prop + destructure). hasUserFarms === 0 is ambiguous
    // ("no farms" vs "list not fetched yet"); only treat it as "no farms" once the list has
    // loaded, else route to /farm_selection, where ChooseFarm owns the
    // "no farms -> /welcome" decision.
    const target = farmsLoaded ? '/welcome' : '/farm_selection';
    return <Redirect to={target} />;
  }

  if (!farm_id && hasUserFarms) {
    return <Redirect to="/farm_selection" />;
  }

  if (step_four && !has_consent) {
    return <Redirect to="/consent" />;
  }

  if (!step_one) {
    return <Redirect to="/add_farm" />;
  }

  return null;
};

export default OnboardingFlow;
