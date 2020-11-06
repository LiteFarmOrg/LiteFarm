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

import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import RoleSelection from '../containers/RoleSelection';
import Outro from '../containers/Outro';
import ChooseFarm from '../containers/ChooseFarm';
import WelcomeScreen from '../containers/WelcomeScreen';
import AddFarm from '../containers/AddFarm/temp.index';
import ConsentForm from '../containers/Consent';
import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../containers/OrganicCertifierSurvey/selector';
import InterestedOrganic from '../containers/OrganicCertifierSurvey/InterestedOrganic';
import OrganicPartners from '../containers/OrganicCertifierSurvey/OrganicPartners';
import { farmSelector, userInfoSelector } from '../containers/selector';
import Home from '../containers/Home';
import { getUserInfo } from '../containers/actions';

function OnboardingFlow() {
  const organicCertifierForm = useSelector(certifierSurveySelector);
  const farm = useSelector(farmSelector);
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(!user){
      dispatch(getUserInfo());
    }
  },[user])
  console.log('onboarding');
  const {step_one, step_two, step_three, step_four, step_five} = farm || {};
  return <Switch>
    <Route path="/farm_selection" exact component={ChooseFarm}/>
    <Route path="/welcome" exact component={WelcomeScreen}/>
    {!farm?.step_one && <Route path="/add_farm" exact component={AddFarm}/>}
    {farm?.step_one && <Route path="/role_selection" exact component={RoleSelection}/>}
    {farm?.step_two && <Route path="/consent" exact component={ConsentForm}/>}
    {farm?.step_three && <Route path="/interested_in_organic" exact component={InterestedOrganic}/>}
    {organicCertifierForm?.interested && <Route path="/organic_partners" exact component={OrganicPartners}/>}
    {farm?.step_four && <Route path="/outro" exact component={Outro}/>}
    {farm?.step_four && <Route path="/" exact component={Home}/>}
    <Route>
      <>
        {(!farm || !step_one) && <Redirect to={'/farm_selection'}/>}
        {step_one && !step_two && <Redirect to={'/role_selection'}/>}
        {step_two && !step_three && <Redirect to={'/consent'}/>}
        {step_three && !step_four && !organicCertifierForm?.interested &&
        <Redirect to={'/interested_in_organic'}/>}
        {step_three && !step_four && organicCertifierForm?.interested &&
        <Redirect to={'/organic_partners'}/>}
        {step_four && !step_five && <Redirect to={'/outro'}/>}
      </>
    </Route>
  </Switch>
}

export default OnboardingFlow;
