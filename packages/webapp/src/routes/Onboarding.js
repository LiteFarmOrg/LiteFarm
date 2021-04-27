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

import { shallowEqual, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../containers/OrganicCertifierSurvey/slice';
import { userFarmLengthSelector } from '../containers/userFarmSlice';
import Spinner from '../components/Spinner';
import { selectedCertificationTypeSelector } from '../containers/OrganicCertifierSurvey/organicCertifierSurveySlice';

const RoleSelection = React.lazy(() => import('../containers/RoleSelection'));
const Outro = React.lazy(() => import('../containers/Outro'));
const ChooseFarm = React.lazy(() => import('../containers/ChooseFarm'));
const WelcomeScreen = React.lazy(() => import('../containers/WelcomeScreen'));
const AddFarm = React.lazy(() => import('../containers/AddFarm'));
const ConsentForm = React.lazy(() => import('../containers/Consent'));
const InterestedOrganic = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/InterestedOrganic'),
);
const CertificationSelection = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/CertificationSelection'),
);

const CertifierSelectionMenu = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/CertifierSelectionMenu'),
);

const SetCertificationSummary = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/SetCertificationSummary'),
);

const RequestCertifier = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/RequestCertifier'),
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
  const { certifiers, interested } = useSelector(certifierSurveySelector, shallowEqual);
  const selected = useSelector(selectedCertificationTypeSelector);
  const hasUserFarms = useSelector(userFarmLengthSelector);
  return (
    <Suspense fallback={<Spinner />}>
      <Switch>
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
        {step_three && <Route path="/interested_in_organic" exact component={InterestedOrganic} />}
        {interested && (
          <Route path="/certification_selection" exact component={CertificationSelection} />
        )}
        {selected && (
          <>
            <Route path="/certifier_selection_menu" exact component={CertifierSelectionMenu} />
            <Route path="/requested_certifier" exact component={RequestCertifier} />
            <Route path="/certification_summary" exact component={SetCertificationSummary} />
            {step_four && <Route path="/outro" exact component={Outro} />}
          </>
        )}
        {!selected && step_four && <Route path="/outro" exact component={Outro} />}
        <Route>
          <>
            {step_four && !has_consent && <Redirect to={'/consent'} />}
            {(!farm_id || !step_one) && hasUserFarms && <Redirect to={'/farm_selection'} />}
            {(!farm_id || !step_one) && !hasUserFarms && <Redirect to={'/welcome'} />}
            {step_one && !step_two && <Redirect to={'/role_selection'} />}
            {step_two && !step_three && <Redirect to={'/consent'} />}
            {step_three && !step_four && !interested && <Redirect to={'/interested_in_organic'} />}
            {step_four && !step_five && !(interested && !certifiers?.length) && (
              <Redirect to={'/outro'} />
            )}
          </>
        </Route>
      </Switch>
    </Suspense>
  );
}

export default OnboardingFlow;
