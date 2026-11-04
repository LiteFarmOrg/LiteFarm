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
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userFarmLengthSelector, userFarmStatusSelector } from '../containers/userFarmSlice';
import { hasConsentedSelector } from '../containers/consentSlice';
import { isMapLibreProvider } from '../util/mapProvider';

const RoleSelection = React.lazy(() => import('../containers/RoleSelection'));
const Outro = React.lazy(() => import('../containers/Outro'));
const ChooseFarm = React.lazy(() => import('../containers/ChooseFarm'));
const AddFarm = React.lazy(() =>
  isMapLibreProvider
    ? import('../containers/AddFarm/MapLibreAddFarm')
    : import('../containers/AddFarm'),
);
const ConsentForm = React.lazy(() => import('../containers/Consent'));

function OnboardingFlow(props) {
  const { step_one, step_two, step_five } = props;

  const hasUserFarms = useSelector(userFarmLengthSelector);
  const { loaded: farmsLoaded } = useSelector(userFarmStatusSelector);
  const hasConsented = useSelector(hasConsentedSelector);

  const requireConditionProps = { ...props, hasUserFarms, farmsLoaded, hasConsented };

  return (
    <Routes>
      <Route
        path="/farm_selection"
        element={
          <RequireCondition condition={hasConsented} {...requireConditionProps}>
            <ChooseFarm />
          </RequireCondition>
        }
      />
      <Route
        path="/add_farm"
        element={
          <RequireCondition condition={hasConsented} {...requireConditionProps}>
            <AddFarm />
          </RequireCondition>
        }
      />
      <Route
        path="/role_selection"
        element={
          <RequireCondition condition={step_one} {...requireConditionProps}>
            <RoleSelection />
          </RequireCondition>
        }
      />
      <Route
        path="/consent"
        element={
          <RequireCondition condition={!hasConsented} {...requireConditionProps}>
            <ConsentForm />
          </RequireCondition>
        }
      />
      <Route
        path="/outro"
        element={
          <RequireCondition condition={step_two && !step_five} {...requireConditionProps}>
            <Outro />
          </RequireCondition>
        }
      />
      {/* Fallback route - handles redirects when no other routes match */}
      <Route path="*" element={<RequireCondition {...requireConditionProps} />} />
    </Routes>
  );
}

// Reference: https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f#get-started-upgrading-today
const RequireCondition = ({
  condition,
  children,
  step_one,
  step_two,
  step_five,
  hasConsented,
  farm_id,
  hasUserFarms,
  farmsLoaded,
}) => {
  if (condition) {
    return children;
  }

  if (!hasConsented) {
    return <Navigate to="/consent" replace />;
  }

  if (step_two && !step_five) {
    return <Navigate to="/outro" replace />;
  }

  if (step_one && !step_two) {
    return <Navigate to="/role_selection" replace />;
  }

  if ((!farm_id || !step_one) && !hasUserFarms) {
    // hasUserFarms === 0 is ambiguous ("no farms" vs "list not fetched yet");
    // only treat it as "no farms" once the list has loaded, else route to /farm_selection,
    // where ChooseFarm owns the "no farms -> /add_farm" decision.
    const target = farmsLoaded ? '/add_farm' : '/farm_selection';
    return <Navigate to={target} replace />;
  }

  if (!farm_id && hasUserFarms) {
    return <Navigate to="/farm_selection" replace />;
  }

  if (!step_one) {
    return <Navigate to="/add_farm" replace />;
  }

  return null;
};

export default OnboardingFlow;
