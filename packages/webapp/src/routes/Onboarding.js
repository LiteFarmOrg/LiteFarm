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

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import RoleSelection from '../containers/RoleSelection';
import Outro from '../containers/Outro';
import ChooseFarm from '../containers/ChooseFarm';
import WelcomeScreen from '../containers/WelcomeScreen';
import AddFarm from '../containers/AddFarm';
import ConsentForm from '../containers/Consent';
import InterestedOrganic from '../containers/OrganicCertifierSurvey/InterestedOrganic';
import OrganicPartners from '../containers/OrganicCertifierSurvey/OrganicPartners';
import Home from '../containers/Home';
import { shallowEqual, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../containers/OrganicCertifierSurvey/slice';


function OnboardingFlow({ step_one, step_two, step_three, step_four, step_five, has_consent, farm_id }) {
  const { certifiers, interested } = useSelector(certifierSurveySelector, shallowEqual);
  return <Switch>
    <Route path="/farm_selection" exact component={() => <ChooseFarm/>}/>
    <Route path="/welcome" exact component={WelcomeScreen}/>
    {!step_one && <Route path="/add_farm" exact component={AddFarm}/>}
    {step_one && <Route path="/role_selection" exact component={RoleSelection}/>}
    {step_two && !step_five && <Route path="/consent" exact component={ConsentForm}/>}
    {step_five && !has_consent &&
    <Route path="/consent" exact component={() => <ConsentForm goBackTo={'/farm_selection'} goForwardTo={'/'}/>}/>}
    {step_three && <Route path="/interested_in_organic" exact component={InterestedOrganic}/>}
    {interested && <Route path="/organic_partners" exact component={OrganicPartners}/>}
    {step_four && <Route path="/outro" exact component={Outro}/>}
    {step_five && <Route path="/" exact component={Home}/>}
    <Route>
      <>
        {step_four && !has_consent && <Redirect to={'/consent'}/>}
        {(!farm_id || !step_one) && <Redirect to={'/farm_selection'}/>}
        {step_one && !step_two && <Redirect to={'/role_selection'}/>}
        {step_two && !step_three && <Redirect to={'/consent'}/>}
        {step_three && !step_four && !interested &&
        <Redirect to={'/interested_in_organic'}/>}
        {step_three && (!step_four || !certifiers?.length) && interested &&
        <Redirect to={'/organic_partners'}/>}
        {step_four && !step_five && !(interested && !certifiers?.length) &&
        <Redirect to={'/outro'}/>}
      </>
    </Route>
  </Switch>
}

export default OnboardingFlow;
