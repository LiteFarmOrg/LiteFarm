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

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
// import Callback from './components/Callback';
import Home from './containers/Home';
import PureEnterPasswordPage from './components/Signup/EnterPasswordPage';
import HelpRequest from './containers/Help';
import Profile from './containers/Profile';
import IntroSlide from './containers/IntroSlide';
import ConsentForm from './containers/Consent';
import Log from './containers/Log';
// import Login from './containers/Login';
import SignUp from './containers/SignUp';
import PureCreateUserAccount from './components/CreateUserAccount';
import NewLog from './containers/Log/NewLog';
import FertilizingLog from './containers/Log/FertilizingLog';
import PestControlLog from './containers/Log/PestControlLog';
import FieldWorkLog from './containers/Log/FieldWorkLog';
import HarvestLog from './containers/Log/HarvestLog';
import HarvestUseType from './containers/Log/HarvestUseType';
import HarvestAllocation from './containers/Log/HarvestAllocation';
import IrrigationLog from './containers/Log/IrrigationLog';
import ScoutingLog from './containers/Log/ScoutingLog';
import SeedingLog from './containers/Log/SeedingLog';
import soilDataLog from './containers/Log/soilDataLog';
import OtherLog from './containers/Log/OtherLog';
import EditFertilizingLog from './containers/Log/EditLog/fertilizing';
import EditPestControlLog from './containers/Log/EditLog/pestControl';
import EditFieldWorkLog from './containers/Log/EditLog/fieldWork';
import EditHarvestLog from './containers/Log/EditLog/harvest';
import EditIrrigationLog from './containers/Log/EditLog/irrigation';
import EditScoutingLog from './containers/Log/EditLog/scouting';
import EditSeedingLog from './containers/Log/EditLog/seeding';
import EditSoilDataLog from './containers/Log/EditLog/soilData';
import EditOtherLog from './containers/Log/EditLog/other';
import Shift from './containers/Shift';
import Field from './containers/Field';
import NewField from './containers/Field/NewField';
import EditField from './containers/Field/EditField';
import ShiftStepOne from './containers/Shift/StepOne';
import ShiftStepTwo from './containers/Shift/StepTwo';
import Finances from './containers/Finances';
import MyShift from './containers/Shift/MyShift';
import EditShiftOne from './containers/Shift/EditShiftOne';
import EditShiftTwo from './containers/Shift/EditShiftTwo';
import ChooseFarm from './containers/ChooseFarm';
// Insights imports
import Insights from './containers/Insights';
import PeopleFed from './containers/Insights/PeopleFed';
import SoilOM from './containers/Insights/SoilOM';
import LabourHappiness from './containers/Insights/LabourHappiness';
import Biodiversity from './containers/Insights/Biodiversity';
import Prices from './containers/Insights/Prices';
import WaterBalance from './containers/Insights/WaterBalance';
import Erosion from './containers/Insights/Erosion';
import NitrogenBalance from './containers/Insights/NitrogenBalance';
import ContactForm from './containers/Contact';

import SalesSummary from './containers/Finances/SalesSummary';
import AddSale from './containers/Finances/AddSale';
import EditSale from './containers/Finances/EditSale';
import EstimatedRevenue from './containers/Finances/EstimatedRevenue';
import Labour from './containers/Finances/Labour';
import OtherExpense from './containers/Finances/OtherExpense';
import ExpenseDetail from './containers/Finances/ExpenseDetail';
import ExpenseCategories from './containers/Finances/NewExpense/ExpenseCategories';
import AddExpense from './containers/Finances/NewExpense/AddExpense';
import EditAddExpense from './containers/Finances/EditExpense/EditAddExpense';
import EditExpenseCategories from './containers/Finances/EditExpense/EditExpenseCategories';

import NewFinances from './containers/NewFinances';
import Expenses from './containers/NewFinances/Expenses';
import NewExpenseCategories from './containers/NewFinances/Expenses/NewExpense/ExpenseCategories';
import NewExpenseAddExpense from './containers/NewFinances/Expenses/NewExpense/AddExpense';
import NewExpenseDetail from './containers/NewFinances/Expenses/ExpenseDetail';
import NewExpenseEditExpense from './containers/NewFinances/Expenses/EditExpense/EditAddExpense';
import NewExpenseEditCategories from './containers/NewFinances/Expenses/EditExpense/EditExpenseCategories';

import NewSaleEditSale from './containers/NewFinances/Sales/EditSale';
import NewSaleAddSale from './containers/NewFinances/Sales/AddSale';

import Sales from './containers/NewFinances/Sales';
import Balances from './containers/NewFinances/Balances';

import LogDetail from './containers/Log/LogDetail';
import SaleDetail from './containers/Finances/SaleDetail';

import CustomSignUp from './containers/CustomSignUp';
import ExpiredTokenScreen from './containers/ExpiredTokenScreen';

import { useSelector } from 'react-redux';
import OnboardingFlow from './routes/Onboarding';
import { isAuthenticated } from './util/jwt';

// action
import { loginSuccess } from './containers/userFarmSlice';
import { userFarmSelector } from './containers/userFarmSlice';
import PasswordResetAccount from './containers/PasswordResetAccount';
import InviteSignUp from './containers/InviteSignUp';
import InvitedUserCreateAccount from './containers/InvitedUserCreateAccount';
import Callback from './containers/Callback';
import JoinFarmSuccessScreen from './containers/JoinFarmSuccessScreen';
import history from './history';
import InviteUser from './containers/InviteUser';

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
  let { step_five, has_consent, role_id, status, step_one, farm_id, step_three } = userFarm;
  const hasSelectedFarm = !!farm_id;
  const hasFinishedOnBoardingFlow = step_five;
  if (isAuthenticated()) {
    role_id = Number(role_id);
    // TODO check every step
    if (history.location.state?.isInvitationFlow) {
      return (
        <Switch>
          <Route path="/farm_selection" exact component={ChooseFarm} />
          <Route
            path="/consent"
            exact
            component={() => <ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
          />
          <Route path="/outro" exact component={JoinFarmSuccessScreen} />}
          {!has_consent && <Redirect to={'/consent'} />}
        </Switch>
      );
    } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
      return <OnboardingFlow {...userFarm} />;
    } else if (!has_consent) {
      return (
        <Switch>
          <Route path="/farm_selection" exact component={ChooseFarm} />
          <Route
            path="/consent"
            exact
            component={() => <ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
          />
          {has_consent && (
            <Route
              path="/consent"
              exact
              component={() => <ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
            />
          )}
          {!has_consent && <Redirect to={'/consent'} />}
        </Switch>
      );
    } else if (role_id === 1) {
      return (
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
          <Route path="/newfinances" exact component={NewFinances} />
          <Route path="/newfinances/expenses" exact component={Expenses} />
          <Route path="/help" exact component={HelpRequest} />
          <Route
            path="/newfinances/expenses/expense_categories"
            exact
            component={NewExpenseCategories}
          />
          <Route path="/newfinances/expenses/add_expense" exact component={NewExpenseAddExpense} />
          <Route path="/newfinances/expenses/expense_detail" exact component={NewExpenseDetail} />
          <Route
            path="/newfinances/expenses/edit_add_expense"
            exact
            component={NewExpenseEditExpense}
          />
          <Route
            path="/newfinances/expenses/edit_expense_categories"
            exact
            component={NewExpenseEditCategories}
          />
          <Route path="/newfinances/sales" exact component={Sales} />
          <Route path="/newfinances/sales/edit_sale" exact component={NewSaleEditSale} />
          <Route path="/newfinances/sales/add_sale" exact component={NewSaleAddSale} />
          <Route path="/newfinances/balances" exact component={Balances} />
          <Route path="/sales_summary" exact component={SalesSummary} />
          <Route path="/add_sale" exact component={AddSale} />
          <Route path="/edit_sale" exact component={EditSale} />
          <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
          <Route path="/labour" exact component={Labour} />
          <Route path="/other_expense" exact component={OtherExpense} />
          <Route path="/expense_detail" exact component={ExpenseDetail} />
          <Route path="/expense_categories" exact component={ExpenseCategories} />
          <Route path="/add_expense" exact component={AddExpense} />
          <Route path="/edit_expense_categories" exact component={EditExpenseCategories} />
          <Route path="/edit_add_expense" exact component={EditAddExpense} />
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
      );
    } else if (role_id === 2 || role_id === 5) {
      return (
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
          <Route path="/finances" exact component={Finances} />
          <Route path="/newfinances" exact component={NewFinances} />
          <Route path="/newfinances/expenses" exact component={Expenses} />
          <Route
            path="/newfinances/expenses/expense_categories"
            exact
            component={NewExpenseCategories}
          />
          <Route path="/newfinances/expenses/add_expense" exact component={NewExpenseAddExpense} />
          <Route path="/newfinances/expenses/expense_detail" exact component={NewExpenseDetail} />
          <Route
            path="/newfinances/expenses/edit_add_expense"
            exact
            component={NewExpenseEditExpense}
          />
          <Route
            path="/newfinances/expenses/edit_expense_categories"
            exact
            component={NewExpenseEditCategories}
          />
          <Route path="/newfinances/sales" exact component={Sales} />
          <Route path="/newfinances/sales/edit_sale" exact component={NewSaleEditSale} />
          <Route path="/newfinances/sales/add_sale" exact component={NewSaleAddSale} />
          <Route path="/newfinances/balances" exact component={Balances} />
          <Route path="/sales_summary" exact component={SalesSummary} />
          <Route path="/add_sale" exact component={AddSale} />
          <Route path="/edit_sale" exact component={EditSale} />
          <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
          <Route path="/labour" exact component={Labour} />
          <Route path="/other_expense" exact component={OtherExpense} />
          <Route path="/expense_detail" exact component={ExpenseDetail} />
          <Route path="/expense_categories" exact component={ExpenseCategories} />
          <Route path="/add_expense" exact component={AddExpense} />
          <Route path="/edit_expense_categories" exact component={EditExpenseCategories} />
          <Route path="/edit_add_expense" exact component={EditAddExpense} />
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
      );
    } else {
      return (
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
          <Redirect to={'/'} />
        </Switch>
      );
    }
  } else if (!isAuthenticated()) {
    return (
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
    );
  }
};

export default Routes;
