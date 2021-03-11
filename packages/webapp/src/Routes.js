/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (Routes.js) is part of LiteFarm.
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
import Spinner from './components/Spinner';

// Components that have already been set up with code splitting
import OnboardingFlow from './routes/Onboarding';
import CustomSignUp from './containers/CustomSignUp';
import { useSelector } from 'react-redux';
import { isAuthenticated } from './util/jwt';

// action
import { userFarmSelector } from './containers/userFarmSlice';
import { chooseFarmFlowSelector } from './containers/ChooseFarm/chooseFarmFlowSlice';

//dynamic imports
const Home = React.lazy(() => import('./containers/Home'));
const HelpRequest = React.lazy(() => import('./containers/Help'));
const Profile = React.lazy(() => import('./containers/Profile'));
const IntroSlide = React.lazy(() => import('./containers/IntroSlide'));
const ConsentForm = React.lazy(() => import('./containers/Consent'));
const Log = React.lazy(() => import('./containers/Log'));
const NewLog = React.lazy(() => import('./containers/Log/NewLog'));
const FertilizingLog = React.lazy(() => import('./containers/Log/FertilizingLog'));
const PestControlLog = React.lazy(() => import('./containers/Log/PestControlLog'));
const FieldWorkLog = React.lazy(() => import('./containers/Log/FieldWorkLog'));
const HarvestLog = React.lazy(() => import('./containers/Log/HarvestLog'));
const HarvestUseType = React.lazy(() => import('./containers/Log/HarvestUseType'));
const HarvestAllocation = React.lazy(() => import('./containers/Log/HarvestAllocation'));
const IrrigationLog = React.lazy(() => import('./containers/Log/IrrigationLog'));
const ScoutingLog = React.lazy(() => import('./containers/Log/ScoutingLog'));
const SeedingLog = React.lazy(() => import('./containers/Log/SeedingLog'));
const soilDataLog = React.lazy(() => import('./containers/Log/soilDataLog'));
const OtherLog = React.lazy(() => import('./containers/Log/OtherLog'));
const EditFertilizingLog = React.lazy(() => import('./containers/Log/EditLog/fertilizing'));
const EditPestControlLog = React.lazy(() => import('./containers/Log/EditLog/pestControl'));
const EditFieldWorkLog = React.lazy(() => import('./containers/Log/EditLog/fieldWork'));
const EditHarvestLog = React.lazy(() => import('./containers/Log/EditLog/harvest'));
const EditIrrigationLog = React.lazy(() => import('./containers/Log/EditLog/irrigation'));
const EditScoutingLog = React.lazy(() => import('./containers/Log/EditLog/scouting'));
const EditSeedingLog = React.lazy(() => import('./containers/Log/EditLog/seeding'));
const EditSoilDataLog = React.lazy(() => import('./containers/Log/EditLog/soilData'));
const EditOtherLog = React.lazy(() => import('./containers/Log/EditLog/other'));
const Shift = React.lazy(() => import('./containers/Shift'));
const Field = React.lazy(() => import('./containers/Field'));
const NewField = React.lazy(() => import('./containers/Field/NewField'));
const EditField = React.lazy(() => import('./containers/Field/EditField'));
const ShiftStepOne = React.lazy(() => import('./containers/Shift/StepOne/StepOne'));
const ShiftStepTwo = React.lazy(() => import('./containers/Shift/StepTwo/StepTwo'));
const Finances = React.lazy(() => import('./containers/Finances'));
const MyShift = React.lazy(() => import('./containers/Shift/MyShift'));
const EditShiftOne = React.lazy(() => import('./containers/Shift/EditShiftOne'));
const EditShiftTwo = React.lazy(() => import('./containers/Shift/EditShiftTwo'));
const ChooseFarm = React.lazy(() => import('./containers/ChooseFarm'));
const PasswordResetAccount = React.lazy(() => import('./containers/PasswordResetAccount'));
const InviteSignUp = React.lazy(() => import('./containers/InviteSignUp'));
const InvitedUserCreateAccount = React.lazy(() => import('./containers/InvitedUserCreateAccount'));
const Callback = React.lazy(() => import('./containers/Callback'));
const JoinFarmSuccessScreen = React.lazy(() => import('./containers/JoinFarmSuccessScreen'));
const InviteUser = React.lazy(() => import('./containers/InviteUser'));
// Insights imports
const Insights = React.lazy(() => import('./containers/Insights'));
const PeopleFed = React.lazy(() => import('./containers/Insights/PeopleFed'));
const SoilOM = React.lazy(() => import('./containers/Insights/SoilOM'));
const LabourHappiness = React.lazy(() => import('./containers/Insights/LabourHappiness'));
const Biodiversity = React.lazy(() => import('./containers/Insights/Biodiversity'));
const Prices = React.lazy(() => import('./containers/Insights/Prices'));
const WaterBalance = React.lazy(() => import('./containers/Insights/WaterBalance'));
const Erosion = React.lazy(() => import('./containers/Insights/Erosion'));
const NitrogenBalance = React.lazy(() => import('./containers/Insights/NitrogenBalance'));
const ContactForm = React.lazy(() => import('./containers/Contact'));
const SalesSummary = React.lazy(() => import('./containers/Finances/SalesSummary'));
const AddSale = React.lazy(() => import('./containers/Finances/AddSale'));
const EditSale = React.lazy(() => import('./containers/Finances/EditSale'));
const EstimatedRevenue = React.lazy(() => import('./containers/Finances/EstimatedRevenue'));
const Labour = React.lazy(() => import('./containers/Finances/Labour'));
const OtherExpense = React.lazy(() => import('./containers/Finances/OtherExpense'));
const ExpenseDetail = React.lazy(() => import('./containers/Finances/ExpenseDetail'));
const ExpenseCategories = React.lazy(() =>
  import('./containers/Finances/NewExpense/ExpenseCategories'),
);
const AddExpense = React.lazy(() => import('./containers/Finances/NewExpense/AddExpense'));
const TempEditExpense = React.lazy(() =>
  import('./containers/Finances/EditExpense/TempEditExpense'),
);
const LogDetail = React.lazy(() => import('./containers/Log/LogDetail'));
const SaleDetail = React.lazy(() => import('./containers/Finances/SaleDetail'));
const ExpiredTokenScreen = React.lazy(() => import('./containers/ExpiredTokenScreen'));
const Map = React.lazy(() => import('./containers/Map'));
const FarmSiteBoundary = React.lazy(() =>
  import('./containers/AreaDetailsLayout/FarmSiteBoundary'),
);
const AreaDetailsField = React.lazy(() => import('./containers/AreaDetailsLayout/Field'));
const Gate = React.lazy(() => import('./containers/PointDetailsLayout/Gate'));
const WaterValve = React.lazy(() => import('./containers/PointDetailsLayout/WaterValve'));

const Routes = () => {
  const userFarm = useSelector(
    userFarmSelector,
    (pre, next) =>
      pre.step_five === next.step_five &&
      pre.has_consent === next.has_consent &&
      pre.role_id === next.role_id &&
      pre.step_one === next.step_one &&
      pre.farm_id === next.farm_id &&
      pre.step_three === next.step_three,
  );
  const { isInvitationFlow } = useSelector(
    chooseFarmFlowSelector,
    (pre, next) => pre.isInvitationFlow === next.isInvitationFlow,
  );
  let { step_five, has_consent, role_id, status, step_one, farm_id, step_three } = userFarm;
  const hasSelectedFarm = !!farm_id;
  const hasFinishedOnBoardingFlow = step_five;
  if (isAuthenticated()) {
    role_id = Number(role_id);
    // TODO check every step
    if (isInvitationFlow) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route
              path="/consent"
              exact
              component={() => <ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
            />
            <Route path="/outro" exact component={JoinFarmSuccessScreen} />
            {!has_consent && <Redirect to={'/consent'} />}
          </Switch>
        </Suspense>
      );
    } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
      return <OnboardingFlow {...userFarm} />;
    } else if (!has_consent) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route
              path="/consent"
              exact
              component={() => <ConsentForm goForwardTo={'/'} goBackTo={null} />}
            />
            {!has_consent && <Redirect to={'/consent'} />}
          </Switch>
        </Suspense>
      );
    } else if (role_id === 1) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/home" exact component={Home} />
            <Route path="/profile" exact component={Profile} />
            <Route path="/intro" exact component={IntroSlide} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/log" exact component={Log} />
            <Route path="/new_log" exact component={NewLog} />
            <Route path="/fertilizing_log" exact component={FertilizingLog} />
            <Route path="/pest_control_log" exact component={PestControlLog} />
            <Route path="/field_work_log" exact component={FieldWorkLog} />
            <Route path="/harvest_log" exact component={HarvestLog} />
            <Route path="/harvest_use_type" exact component={HarvestUseType} />
            <Route path="/harvest_allocation" exact component={HarvestAllocation} />
            <Route path="/irrigation_log" exact component={IrrigationLog} />
            <Route path="/scouting_log" exact component={ScoutingLog} />
            <Route path="/seeding_log" exact component={SeedingLog} />
            <Route path="/soil_data_log" exact component={soilDataLog} />
            <Route path="/other_log" exact component={OtherLog} />
            <Route path="/seeding_log/edit" exact component={EditSeedingLog} />
            <Route path="/fertilizing_log/edit" exact component={EditFertilizingLog} />
            <Route path="/pest_control_log/edit" exact component={EditPestControlLog} />
            <Route path="/field_work_log/edit" exact component={EditFieldWorkLog} />
            <Route path="/harvest_log/edit" exact component={EditHarvestLog} />
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
            <Route path="/edit_shift_one" exact component={EditShiftOne} />
            <Route path="/edit_shift_two" exact component={EditShiftTwo} />
            <Route path="/field" exact component={Field} />
            <Route path="/new_field" exact component={NewField} />
            <Route path="/map" exact component={Map} />
            <Route path="/create_location/farm_bound" exact component={FarmSiteBoundary} />
            <Route path="/create_location/field" exact component={AreaDetailsField} />
            <Route path="/gate" exact component={Gate} />
            <Route path="/water_valve" exact component={WaterValve} />
            <Route path="/finances" exact component={Finances} />
            <Route path="/edit_field" exact component={EditField} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/peoplefed" exact component={PeopleFed} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/insights/waterbalance" exact component={WaterBalance} />
            <Route path="/insights/erosion" exact component={Erosion} />
            <Route path="/insights/nitrogenbalance" exact component={NitrogenBalance} />
            <Route path="/help" exact component={HelpRequest} />
            <Route path="/sales_summary" exact component={SalesSummary} />
            <Route path="/add_sale" exact component={AddSale} />
            <Route path="/edit_sale" exact component={EditSale} />
            <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
            <Route path="/labour" exact component={Labour} />
            <Route path="/other_expense" exact component={OtherExpense} />
            <Route path="/expense_detail" exact component={ExpenseDetail} />
            <Route path="/expense_categories" exact component={ExpenseCategories} />
            <Route path="/add_expense" exact component={AddExpense} />

            {/* TODO: use edit_expense_categories and edit_add_expense when restructuring edit expense */}
            {/* and remove edit_expense  */}
            {/* <Route path="/edit_expense_categories" exact component={EditExpenseCategories} /> */}
            {/* <Route path="/edit_add_expense" exact component={EditAddExpense} /> */}
            <Route path="/edit_expense" exact component={TempEditExpense} />

            {/*<Route path="/contact" exact component={ContactForm}/>*/}
            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            {/*<Route path="/callback" render={(props) => {*/}
            {/*  handleAuthentication(props, dispatchLoginSuccess);*/}
            {/*  return <Callback {...props} />*/}
            {/*}}/>*/}
            <Route path="/log_detail" exact component={LogDetail} />
            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/invite_user" exact component={InviteUser} />
            <Redirect
              to={'/'}
              //TODO change to 404
            />
          </Switch>
        </Suspense>
      );
    } else if (role_id === 2 || role_id === 5) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/home" exact component={Home} />
            <Route path="/profile" exact component={Profile} />
            <Route path="/intro" exact component={IntroSlide} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/log" exact component={Log} />
            <Route path="/new_log" exact component={NewLog} />
            <Route path="/fertilizing_log" exact component={FertilizingLog} />
            <Route path="/pest_control_log" exact component={PestControlLog} />
            <Route path="/field_work_log" exact component={FieldWorkLog} />
            <Route path="/harvest_log" exact component={HarvestLog} />
            <Route path="/harvest_use_type" exact component={HarvestUseType} />
            <Route path="/harvest_allocation" exact component={HarvestAllocation} />
            <Route path="/help" exact component={HelpRequest} />
            <Route path="/irrigation_log" exact component={IrrigationLog} />
            <Route path="/scouting_log" exact component={ScoutingLog} />
            <Route path="/seeding_log" exact component={SeedingLog} />
            <Route path="/soil_data_log" exact component={soilDataLog} />
            <Route path="/other_log" exact component={OtherLog} />
            <Route path="/seeding_log/edit" exact component={EditSeedingLog} />
            <Route path="/fertilizing_log/edit" exact component={EditFertilizingLog} />
            <Route path="/pest_control_log/edit" exact component={EditPestControlLog} />
            <Route path="/field_work_log/edit" exact component={EditFieldWorkLog} />
            <Route path="/harvest_log/edit" exact component={EditHarvestLog} />
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
            <Route path="/edit_shift_one" exact component={EditShiftOne} />
            <Route path="/edit_shift_two" exact component={EditShiftTwo} />
            <Route path="/field" exact component={Field} />
            <Route path="/new_field" exact component={NewField} />
            <Route path="/map" exact component={Map} />
            <Route path="/farm_site_boundary" exact component={FarmSiteBoundary} />
            <Route path="/area_details_field" exact component={AreaDetailsField} />
            <Route path="/gate" exact component={Gate} />
            <Route path="/water_valve" exact component={WaterValve} />
            <Route path="/finances" exact component={Finances} />
            <Route path="/sales_summary" exact component={SalesSummary} />
            <Route path="/add_sale" exact component={AddSale} />
            <Route path="/edit_sale" exact component={EditSale} />
            <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
            <Route path="/labour" exact component={Labour} />
            <Route path="/other_expense" exact component={OtherExpense} />
            <Route path="/expense_detail" exact component={ExpenseDetail} />
            <Route path="/expense_categories" exact component={ExpenseCategories} />
            <Route path="/add_expense" exact component={AddExpense} />

            {/* TODO: use edit_expense_categories and edit_add_expense when restructuring edit expense */}
            {/* and remove edit_expense  */}
            {/* <Route path="/edit_expense_categories" exact component={EditExpenseCategories} /> */}
            {/* <Route path="/edit_add_expense" exact component={EditAddExpense} /> */}
            <Route path="/edit_expense" exact component={TempEditExpense} />

            <Route path="/contact" exact component={ContactForm} />
            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/edit_field" exact component={EditField} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/peoplefed" exact component={PeopleFed} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/insights/waterbalance" exact component={WaterBalance} />
            <Route path="/insights/erosion" exact component={Erosion} />
            <Route path="/insights/nitrogenbalance" exact component={NitrogenBalance} />
            {/*<Route path="/contact" exact component={ContactForm}/>*/}
            <Route path="/farm_selection" exact component={ChooseFarm} />
            {/*<Route path="/callback" render={(props) => {*/}
            {/*  handleAuthentication(props, dispatchLoginSuccess);*/}
            {/*  return <Callback {...props} />*/}
            {/*}}/>*/}
            <Route path="/log_detail" exact component={LogDetail} />
            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/invite_user" exact component={InviteUser} />
            <Redirect to={'/'} />
          </Switch>
        </Suspense>
      );
    } else {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/home" exact component={Home} />
            <Route path="/profile" exact component={Profile} />
            <Route path="/intro" exact component={IntroSlide} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/field" exact component={Field} />
            <Route path="/edit_field" exact component={EditField} />
            <Route path="/map" exact component={Map} />
            <Route path="/farm_site_boundary" exact component={FarmSiteBoundary} />
            <Route path="/area_details_field" exact component={AreaDetailsField} />
            <Route path="/gate" exact component={Gate} />
            <Route path="/water_valve" exact component={WaterValve} />
            <Route path="/log" exact component={Log} />
            <Route path="/new_log" exact component={NewLog} />
            <Route path="/fertilizing_log" exact component={FertilizingLog} />
            <Route path="/pest_control_log" exact component={PestControlLog} />
            <Route path="/field_work_log" exact component={FieldWorkLog} />
            <Route path="/harvest_log" exact component={HarvestLog} />
            <Route path="/harvest_use_type" exact component={HarvestUseType} />
            <Route path="/harvest_allocation" exact component={HarvestAllocation} />
            <Route path="/irrigation_log" exact component={IrrigationLog} />
            <Route path="/scouting_log" exact component={ScoutingLog} />
            <Route path="/seeding_log" exact component={SeedingLog} />
            <Route path="/soil_data_log" exact component={soilDataLog} />
            <Route path="/other_log" exact component={OtherLog} />
            <Route path="/seeding_log/edit" exact component={EditSeedingLog} />
            <Route path="/fertilizing_log/edit" exact component={EditFertilizingLog} />
            <Route path="/pest_control_log/edit" exact component={EditPestControlLog} />
            <Route path="/field_work_log/edit" exact component={EditFieldWorkLog} />
            <Route path="/harvest_log/edit" exact component={EditHarvestLog} />
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
            <Route path="/edit_shift_one" exact component={EditShiftOne} />
            <Route path="/edit_shift_two" exact component={EditShiftTwo} />
            {/*<Route path="/contact" exact component={ContactForm}/>*/}
            <Route path="/log_detail" exact component={LogDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            {/*<Route path="/callback" render={(props) => {*/}
            {/*  handleAuthentication(props, dispatchLoginSuccess);*/}
            {/*  return <Callback {...props} />*/}
            {/*}}/>*/}
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/peoplefed" exact component={PeopleFed} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/insights/waterbalance" exact component={WaterBalance} />
            <Route path="/insights/erosion" exact component={Erosion} />
            <Route path="/insights/nitrogenbalance" exact component={NitrogenBalance} />

            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/help" exact component={HelpRequest} />
            <Redirect to={'/'} />
          </Switch>
        </Suspense>
      );
    }
  } else if (!isAuthenticated()) {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route path="/callback" component={Callback} />
          <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
          <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
          <Route path="/password_reset" component={PasswordResetAccount} />
          <Route path={'/expired'} component={ExpiredTokenScreen} />
          <Route path="/" exact component={CustomSignUp} />
          <Redirect
            to={'/'}
            //TODO change to 404
          />
        </Switch>
      </Suspense>
    );
  }
};

export default Routes;
