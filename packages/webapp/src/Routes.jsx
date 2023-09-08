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
import useScrollToTop from './containers/hooks/useScrollToTop';
import { useReduxSnackbar } from './containers/Snackbar/useReduxSnackbar';

//dynamic imports
const Home = React.lazy(() => import('./containers/Home'));
const HelpRequest = React.lazy(() => import('./containers/Help'));
const Account = React.lazy(() => import('./containers/Profile/Account'));
const Farm = React.lazy(() => import('./containers/Profile/Farm/Farm'));
const People = React.lazy(() => import('./containers/Profile/People/People'));
const EditUser = React.lazy(() => import('./containers/Profile/EditUser'));
const ConsentForm = React.lazy(() => import('./containers/Consent'));
const Finances = React.lazy(() => import('./containers/Finances'));
const ChooseFarm = React.lazy(() => import('./containers/ChooseFarm'));
const PasswordResetAccount = React.lazy(() => import('./containers/PasswordResetAccount'));
const InviteSignUp = React.lazy(() => import('./containers/InviteSignUp'));
const InvitedUserCreateAccount = React.lazy(() => import('./containers/InvitedUserCreateAccount'));
const Callback = React.lazy(() => import('./containers/Callback'));
const JoinFarmSuccessScreen = React.lazy(() => import('./containers/JoinFarmSuccessScreen'));
const InviteUser = React.lazy(() => import('./containers/InviteUser'));
// Insights imports
const Insights = React.lazy(() => import('./containers/Insights'));
const SoilOM = React.lazy(() => import('./containers/Insights/SoilOM'));
const LabourHappiness = React.lazy(() => import('./containers/Insights/LabourHappiness'));
const Biodiversity = React.lazy(() => import('./containers/Insights/Biodiversity'));
const Prices = React.lazy(() => import('./containers/Insights/Prices'));
const RevenueTypes = React.lazy(() => import('./containers/Finances/AddSale/RevenueTypes'));
const AddSale = React.lazy(() => import('./containers/Finances/AddSale'));
const EditSale = React.lazy(() => import('./containers/Finances/EditSale'));
const LegacyEstimatedRevenue = React.lazy(() =>
  import('./containers/Finances/LegacyEstimatedRevenue'),
);
const EstimatedRevenue = React.lazy(() => import('./containers/Finances/EstimatedRevenue'));
const Labour = React.lazy(() => import('./containers/Finances/Labour'));
const OtherExpense = React.lazy(() => import('./containers/Finances/OtherExpense'));
const ExpenseDetail = React.lazy(() => import('./containers/Finances/ExpenseDetail'));
const ExpenseCategories = React.lazy(() =>
  import('./containers/Finances/NewExpense/ExpenseCategories'),
);
const AddExpense = React.lazy(() => import('./containers/Finances/NewExpense/AddExpense'));
const AddCustomExpense = React.lazy(() =>
  import('./containers/Finances/CustomExpenseType/AddSimpleCustomExpense'),
);
const ReadOnlyCustomExpense = React.lazy(() =>
  import('./containers/Finances/CustomExpenseType/ReadOnlySimpleCustomExpense'),
);
const EditCustomExpense = React.lazy(() =>
  import('./containers/Finances/CustomExpenseType/EditSimpleCustomExpense'),
);
const TempEditExpense = React.lazy(() =>
  import('./containers/Finances/EditExpense/TempEditExpense'),
);
const SaleDetail = React.lazy(() => import('./containers/Finances/SaleDetail'));
const ExpiredTokenScreen = React.lazy(() => import('./containers/ExpiredTokenScreen'));
const Map = React.lazy(() => import('./containers/Map'));
const MapVideo = React.lazy(() => import('./components/Map/Videos'));
const PostFarmSiteBoundaryForm = React.lazy(() =>
  import(
    './containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/PostFarmSiteBoundary'
  ),
);
const FarmSiteBoundaryDetails = React.lazy(() => import('./routes/FarmSiteBoundaryDetailsRoutes'));

const PostFieldForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/FieldDetailForm/PostField'),
);
const FieldDetails = React.lazy(() => import('./routes/FieldDetailsRoutes'));

const PostGardenForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/GardenDetailForm/PostGarden'),
);
const GardenDetails = React.lazy(() => import('./routes/GardenDetailsRoutes'));

const PostGateForm = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/GateDetailForm/PostGate'),
);
const GateDetails = React.lazy(() => import('./routes/GateDetailsRoutes'));

const PostWaterValveForm = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/WaterValveDetailForm/PostWaterValve'),
);
const WaterValveDetails = React.lazy(() => import('./routes/WaterValveDetailsRoutes'));
const SensorDetail = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/SensorDetail/index'),
);
const EditSensor = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/SensorDetail/EditSensor'),
);

const PostBarnForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/BarnDetailForm/PostBarn'),
);
const BarnDetails = React.lazy(() => import('./routes/BarnDetailsRoutes'));

const PostNaturalAreaForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/PostNaturalArea'),
);
const NaturalAreaDetails = React.lazy(() => import('./routes/NaturalAreaDetailsRoutes'));

const PostSurfaceWaterForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/PostSurfaceWater'),
);
const SurfaceWaterDetails = React.lazy(() => import('./routes/SurfaceWaterDetailsRoutes'));

const PostResidenceForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/ResidenceDetailForm/PostResidence'),
);
const ResidenceDetails = React.lazy(() => import('./routes/ResidenceDetailsRoutes'));

const PostCeremonialForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/PostCeremonialArea'),
);
const CeremonialAreaDetails = React.lazy(() => import('./routes/CeremonialAreaDetailsRoutes'));

const PostGreenhouseForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/GreenhouseDetailForm/PostGreenhouse'),
);
const GreenhouseDetails = React.lazy(() => import('./routes/GreenhouseDetailsRoutes'));

const CropManagement = React.lazy(() => import('./containers/Crop/CropManagement'));
const CropDetail = React.lazy(() => import('./containers/Crop/CropDetail/index'));

const PostFenceForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/FenceDetailForm/PostFence'),
);
const FenceDetails = React.lazy(() => import('./routes/FenceDetailsRoutes'));

const PostBufferZoneForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/BufferZoneDetailForm/PostBufferZone'),
);
const BufferZoneDetails = React.lazy(() => import('./routes/BufferZoneDetailsRoutes'));

const PostWatercourseForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/WatercourseDetailForm/PostWatercourse'),
);
const WatercourseDetails = React.lazy(() => import('./routes/WatercourseDetailsRoutes'));
const SensorDetails = React.lazy(() => import('./routes/SensorDetailsRoutes'));

const CropCatalogue = React.lazy(() => import('./containers/CropCatalogue'));
const CropVarieties = React.lazy(() => import('./containers/CropVarieties'));
const AddCrop = React.lazy(() => import('./containers/AddCropVariety/AddCropVariety'));
const EditCrop = React.lazy(() => import('./containers/EditCropVariety'));
const ComplianceInfo = React.lazy(() => import('./containers/AddCropVariety/ComplianceInfo'));
const AddNewCrop = React.lazy(() => import('./containers/AddNewCrop'));
const PlantingLocation = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/PlantingLocation'),
);
const Transplant = React.lazy(() => import('./containers/Crop/AddManagementPlan/Transplant'));
const PlantingDate = React.lazy(() => import('./containers/Crop/AddManagementPlan/PlantingDate'));
const PlantingMethod = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/PlantingMethod'),
);
const PlantInContainer = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/PlantInContainer'),
);
const PlantBroadcast = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/BroadcastPlan'),
);
const BedPlan = React.lazy(() => import('./containers/Crop/AddManagementPlan/BedPlan/BedPlan'));
const BedPlanGuidance = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/BedPlan/BedPlanGuidance'),
);
const ManagementPlanName = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/ManagementPlanName'),
);
const RowMethod = React.lazy(() => import('./containers/Crop/AddManagementPlan/RowMethod'));
const RowMethodGuidance = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/RowMethod/RowGuidance'),
);

const PlantedAlready = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/PlantedAlready'),
);

const Documents = React.lazy(() => import('./containers/Documents'));

const EditDocument = React.lazy(() => import('./containers/Documents/Edit'));

const AddDocument = React.lazy(() => import('./containers/Documents/Add'));
const MainDocument = React.lazy(() => import('./containers/Documents/Main'));
const CertificationReportingPeriod = React.lazy(() =>
  import('./containers/Certifications/ReportingPeriod'),
);
const CertificationSurvey = React.lazy(() => import('./containers/Certifications/Survey'));

const InterestedOrganic = React.lazy(() =>
  import('./containers/OrganicCertifierSurvey/InterestedOrganic/UpdateInterestedOrganic'),
);
const CertificationSelection = React.lazy(() =>
  import('./containers/OrganicCertifierSurvey/CertificationSelection/UpdateCertificationSelection'),
);

const CertifierSelectionMenu = React.lazy(() =>
  import('./containers/OrganicCertifierSurvey/CertifierSelectionMenu/UpdateCertifierSelectionMenu'),
);

const SetCertificationSummary = React.lazy(() =>
  import(
    './containers/OrganicCertifierSurvey/SetCertificationSummary/UpdateSetCertificationSummary'
  ),
);

const RequestCertifier = React.lazy(() =>
  import('./containers/OrganicCertifierSurvey/RequestCertifier/UpdateRequestCertifier'),
);
const ViewCertification = React.lazy(() =>
  import('./containers/OrganicCertifierSurvey/ViewCertification/ViewCertification'),
);

const RenderSurvey = React.lazy(() => import('./containers/RenderSurvey/RenderSurvey'));
const ExportDownload = React.lazy(() => import('./containers/ExportDownload'));

const ManagementTasks = React.lazy(() =>
  import('./containers/Crop/ManagementDetail/ManagementTasks'),
);
const ManagementDetails = React.lazy(() =>
  import('./containers/Crop/ManagementDetail/ManagementDetails'),
);
const EditManagementDetails = React.lazy(() =>
  import('./containers/Crop/ManagementDetail/EditManagementDetails'),
);
const CompleteManagementPlan = React.lazy(() =>
  import('./containers/Crop/CompleteManagementPlan/CompleteManagementPlan'),
);
const AbandonManagementPlan = React.lazy(() =>
  import('./containers/Crop/CompleteManagementPlan/AbandonManagementPlan'),
);
const RepeatCropPlan = React.lazy(() => import('./containers/Crop/RepeatCropPlan'));
const RepeatCropPlanConfirmation = React.lazy(() =>
  import('./containers/Crop/RepeatCropPlan/Confirmation'),
);

const TaskAssignment = React.lazy(() => import('./containers/Task/TaskAssignment'));
const TaskDetails = React.lazy(() => import('./containers/Task/TaskDetails'));
const TaskTypeSelection = React.lazy(() => import('./containers/Task/TaskTypeSelection'));
const TaskDate = React.lazy(() => import('./containers/Task/TaskDate'));
const TaskCrops = React.lazy(() => import('./containers/Task/TaskCrops'));
const TaskLocations = React.lazy(() => import('./containers/Task/TaskLocations'));
const Tasks = React.lazy(() => import('./containers/Task'));
const ManageCustomTasks = React.lazy(() => import('./containers/Task/ManageCustomTasks'));
const AddCustomTask = React.lazy(() => import('./containers/Task/AddCustomTask'));
const TaskComplete = React.lazy(() => import('./containers/Task/TaskComplete'));
const HarvestCompleteQuantity = React.lazy(() =>
  import('./containers/Task/TaskComplete/HarvestComplete/Quantity'),
);
const HarvestUses = React.lazy(() =>
  import('./containers/Task/TaskComplete/HarvestComplete/HarvestUses'),
);
const TaskCompleteStepOne = React.lazy(() => import('./containers/Task/TaskComplete/StepOne'));
const TaskReadOnly = React.lazy(() => import('./containers/Task/TaskReadOnly'));
const EditCustomTask = React.lazy(() => import('./containers/Task/EditCustomTask'));
const TaskAbandon = React.lazy(() => import('./containers/Task/TaskAbandon'));
const EditCustomTaskUpdate = React.lazy(() => import('./containers/Task/EditCustomTaskUpdate'));
const TaskTransplantMethod = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskTransplantMethod'),
);
const TaskBedMethod = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskBedMethod'),
);
const TaskBedGuidance = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskBedGuidance'),
);
const TaskRowMethod = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskRowMethod'),
);
const TaskRowGuidance = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskRowGuidance'),
);
const TaskContainerMethod = React.lazy(() =>
  import('./containers/Task/TaskTransplantMethod/TaskContainerMethod'),
);
const ActualRevenue = React.lazy(() => import('./containers/Finances/ActualRevenue'));
const UpdateEstimatedCropRevenue = React.lazy(() =>
  import('./containers/Finances/UpdateEstimatedCropRevenue'),
);
const Notification = React.lazy(() => import('./containers/Notification'));
const NotificationReadOnly = React.lazy(() =>
  import('./containers/Notification/NotificationReadOnly'),
);
const UnknownRecord = React.lazy(() =>
  import('./containers/ErrorHandler/UnknownRecord/UnknownRecord'),
);

const Routes = () => {
  useScrollToTop();
  useReduxSnackbar();
  const userFarm = useSelector(
    userFarmSelector,
    (pre, next) =>
      pre.step_five === next.step_five &&
      pre.step_two === next.step_two &&
      pre.step_four === next.step_four &&
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
  let { step_five, has_consent, role_id, status, step_one, farm_id, step_three, step_four } =
    userFarm;
  const hasSelectedFarm = !!farm_id;
  const hasFinishedOnBoardingFlow = step_one && step_four && step_five;
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
            <Route path="/profile" exact component={Account} />
            <Route path="/people" exact component={People} />
            <Route path="/farm" exact component={Farm} />
            <Route path="/user/:user_id" exact component={EditUser} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/crop/new" exact component={AddNewCrop} />
            <Route path="/crop/:crop_id/add_crop_variety" exact component={AddCrop} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              component={ComplianceInfo}
            />
            <Route path="/crop/:variety_id/detail" exact component={CropDetail} />
            <Route path="/crop/:variety_id/management" exact component={CropManagement} />
            <Route path="/crop/:variety_id/edit_crop_variety" exact component={EditCrop} />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              exact
              component={PlantedAlready}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              exact
              component={Transplant}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              exact
              component={PlantingDate}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              exact
              component={BedPlan}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              exact
              component={BedPlanGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              exact
              component={RowMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              exact
              component={RowMethodGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_method"
              exact
              component={BedPlan}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              exact
              component={BedPlanGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              exact
              component={RowMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              exact
              component={RowMethodGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              exact
              component={ManagementPlanName}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              component={ManagementTasks}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              component={ManagementDetails}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              exact
              component={RepeatCropPlan}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              exact
              component={RepeatCropPlanConfirmation}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              exact
              component={EditManagementDetails}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              exact
              component={CompleteManagementPlan}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              exact
              component={AbandonManagementPlan}
            />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />
            <Route path="/documents" exact component={Documents} />
            <Route path="/documents/add_document" exact component={AddDocument} />
            <Route path="/documents/:document_id/edit_document" exact component={EditDocument} />
            <Route path="/documents/:document_id" exact component={MainDocument} />
            <Route path="/tasks" exact component={Tasks} />
            <Route path="/tasks/:task_id/read_only" exact component={TaskReadOnly} />
            <Route path="/tasks/:task_id/complete" exact component={TaskComplete} />
            <Route path="/tasks/:task_id/before_complete" exact component={TaskCompleteStepOne} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              component={HarvestCompleteQuantity}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact component={HarvestUses} />
            <Route path="/tasks/:task_id/abandon" exact component={TaskAbandon} />
            <Route path="/map" exact component={Map} />
            <Route path="/map/videos" exact component={MapVideo} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              component={PostFarmSiteBoundaryForm}
            />
            <Route path="/create_location/barn" exact component={PostBarnForm} />
            <Route path="/create_location/natural_area" exact component={PostNaturalAreaForm} />
            <Route path="/create_location/surface_water" exact component={PostSurfaceWaterForm} />
            <Route path="/create_location/residence" exact component={PostResidenceForm} />
            <Route path="/create_location/ceremonial_area" exact component={PostCeremonialForm} />
            <Route path="/create_location/garden" exact component={PostGardenForm} />
            <Route path="/create_location/greenhouse" exact component={PostGreenhouseForm} />
            <Route path="/create_location/field" exact component={PostFieldForm} />
            <Route path="/create_location/gate" exact component={PostGateForm} />
            <Route path="/create_location/water_valve" exact component={PostWaterValveForm} />
            <Route path="/create_location/fence" exact component={PostFenceForm} />
            <Route path="/create_location/buffer_zone" exact component={PostBufferZoneForm} />
            <Route path="/create_location/watercourse" exact component={PostWatercourseForm} />
            <Route path="/farm_site_boundary/:location_id" component={FarmSiteBoundaryDetails} />
            <Route path="/barn/:location_id" component={BarnDetails} />
            <Route path="/natural_area/:location_id" component={NaturalAreaDetails} />
            <Route path="/surface_water/:location_id" component={SurfaceWaterDetails} />
            <Route path="/residence/:location_id" component={ResidenceDetails} />
            <Route path="/ceremonial_area/:location_id" component={CeremonialAreaDetails} />
            <Route path="/garden/:location_id" component={GardenDetails} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/gate/:location_id" component={GateDetails} />
            <Route path="/water_valve/:location_id" component={WaterValveDetails} />
            <Route path="/fence/:location_id" component={FenceDetails} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />
            <Route path="/watercourse/:location_id" component={WatercourseDetails} />
            <Route path="/sensor/:location_id" component={SensorDetails} />
            <Route path="/sensor/:location_id/edit" exact component={EditSensor} />
            <Route path="/finances" exact component={Finances} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/help" exact component={HelpRequest} />
            <Route path="/finances/actual_revenue" exact component={ActualRevenue} />
            <Route
              path="/finances/estimated_revenue/plan/:management_plan_id"
              exact
              component={UpdateEstimatedCropRevenue}
            />
            <Route path="/revenue_types" exact component={RevenueTypes} />
            <Route path="/add_sale" exact component={AddSale} />
            <Route path="/edit_sale" exact component={EditSale} />
            <Route path="/temp_estimated_revenue" exact component={LegacyEstimatedRevenue} />
            <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
            <Route path="/labour" exact component={Labour} />
            <Route path="/other_expense" exact component={OtherExpense} />
            <Route path="/expense_detail" exact component={ExpenseDetail} />
            <Route path="/expense_categories" exact component={ExpenseCategories} />
            <Route path="/add_expense" exact component={AddExpense} />
            <Route path="/add_custom_expense" exact component={AddCustomExpense} />
            <Route
              path="/readonly_custom_expense/:expense_type_id"
              exact
              component={ReadOnlyCustomExpense}
            />
            <Route
              path="/edit_custom_expense/:expense_type_id"
              exact
              component={EditCustomExpense}
            />
            <Route path="/edit_expense" exact component={TempEditExpense} />
            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/invite_user" exact component={InviteUser} />
            <Route path="/certification" exact component={ViewCertification} />
            <Route
              path="/certification/report_period"
              exact
              component={CertificationReportingPeriod}
            />
            <Route path="/certification/survey" exact component={CertificationSurvey} />
            <Route
              path="/certification/interested_in_organic"
              exact
              component={InterestedOrganic}
            />
            <Route path="/certification/selection" exact component={CertificationSelection} />
            <Route
              path="/certification/certifier/selection"
              exact
              component={CertifierSelectionMenu}
            />
            <Route path="/certification/certifier/request" exact component={RequestCertifier} />
            <Route path="/certification/summary" exact component={SetCertificationSummary} />
            <Route path="/export/:id/from/:from/to/:to" exact component={ExportDownload} />
            <Route path="/add_task/task_locations" exact component={TaskLocations} />
            <Route path="/add_task/task_date" exact component={TaskDate} />
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_details" exact component={TaskDetails} />
            <Route path="/add_task/task_type_selection" exact component={TaskTypeSelection} />
            <Route path="/add_task/task_crops" exact component={TaskCrops} />
            <Route path="/add_task/manage_custom_tasks" exact component={ManageCustomTasks} />
            <Route path="/add_task/add_custom_task" exact component={AddCustomTask} />
            <Route path="/add_task/edit_custom_task" exact component={EditCustomTask} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              component={EditCustomTaskUpdate}
            />
            <Route path="/add_task/planting_method" exact component={TaskTransplantMethod} />
            <Route path="/add_task/bed_method" exact component={TaskBedMethod} />
            <Route path="/add_task/bed_guidance" exact component={TaskBedGuidance} />
            <Route path="/add_task/container_method" exact component={TaskContainerMethod} />
            <Route path="/add_task/row_method" exact component={TaskRowMethod} />
            <Route path="/add_task/row_guidance" exact component={TaskRowGuidance} />
            <Route path="/notifications" exact component={Notification} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              component={NotificationReadOnly}
            />
            <Route path="/unknown_record" exact component={UnknownRecord} />
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
            <Route path="/profile" exact component={Account} />
            <Route path="/people" exact component={People} />
            <Route path="/user/:user_id" exact component={EditUser} />

            <Route path="/farm" exact component={Farm} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/help" exact component={HelpRequest} />
            <Route path="/crop/new" exact component={AddNewCrop} />
            <Route path="/tasks" exact component={Tasks} />
            <Route path="/tasks/:task_id/read_only" exact component={TaskReadOnly} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              component={ComplianceInfo}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              exact
              component={PlantedAlready}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              exact
              component={Transplant}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              exact
              component={PlantingDate}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              exact
              component={BedPlan}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              exact
              component={BedPlanGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              exact
              component={RowMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              exact
              component={RowMethodGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_method"
              exact
              component={BedPlan}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              exact
              component={BedPlanGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              exact
              component={RowMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              exact
              component={RowMethodGuidance}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              exact
              component={ManagementPlanName}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              component={ManagementTasks}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              component={ManagementDetails}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              exact
              component={EditManagementDetails}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              exact
              component={RepeatCropPlan}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              exact
              component={RepeatCropPlanConfirmation}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              exact
              component={CompleteManagementPlan}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              exact
              component={AbandonManagementPlan}
            />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />
            <Route path="/crop/:variety_id/detail" component={CropDetail} />
            <Route path="/crop/:variety_id/management" component={CropManagement} />
            <Route path="/crop/:variety_id/edit_crop_variety" exact component={EditCrop} />
            <Route path="/documents" exact component={Documents} />
            <Route path="/documents/add_document" exact component={AddDocument} />
            <Route path="/documents/:document_id/edit_document" exact component={EditDocument} />
            <Route path="/documents/:document_id" exact component={MainDocument} />
            <Route path="/map" exact component={Map} />
            <Route path="/map/videos" exact component={MapVideo} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              component={PostFarmSiteBoundaryForm}
            />
            <Route path="/create_location/barn" exact component={PostBarnForm} />
            <Route path="/create_location/natural_area" exact component={PostNaturalAreaForm} />
            <Route path="/create_location/surface_water" exact component={PostSurfaceWaterForm} />
            <Route path="/create_location/residence" exact component={PostResidenceForm} />
            <Route path="/create_location/ceremonial_area" exact component={PostCeremonialForm} />
            <Route path="/create_location/garden" exact component={PostGardenForm} />
            <Route path="/create_location/greenhouse" exact component={PostGreenhouseForm} />
            <Route path="/create_location/field" exact component={PostFieldForm} />
            <Route path="/create_location/gate" exact component={PostGateForm} />
            <Route path="/create_location/water_valve" exact component={PostWaterValveForm} />
            <Route path="/create_location/fence" exact component={PostFenceForm} />
            <Route path="/create_location/buffer_zone" exact component={PostBufferZoneForm} />
            <Route path="/create_location/watercourse" exact component={PostWatercourseForm} />
            <Route path="/farm_site_boundary/:location_id" component={FarmSiteBoundaryDetails} />
            <Route path="/barn/:location_id" component={BarnDetails} />
            <Route path="/natural_area/:location_id" component={NaturalAreaDetails} />
            <Route path="/surface_water/:location_id" component={SurfaceWaterDetails} />
            <Route path="/residence/:location_id" component={ResidenceDetails} />
            <Route path="/ceremonial_area/:location_id" component={CeremonialAreaDetails} />
            <Route path="/garden/:location_id" component={GardenDetails} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/gate/:location_id" component={GateDetails} />
            <Route path="/water_valve/:location_id" component={WaterValveDetails} />
            <Route path="/fence/:location_id" component={FenceDetails} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />
            <Route path="/watercourse/:location_id" component={WatercourseDetails} />
            <Route path="/sensor/:location_id" component={SensorDetails} />

            <Route path="/finances" exact component={Finances} />
            <Route path="/finances/actual_revenue" exact component={ActualRevenue} />
            <Route
              path="/finances/estimated_revenue/plan/:management_plan_id"
              exact
              component={UpdateEstimatedCropRevenue}
            />
            <Route path="/revenue_types" exact component={RevenueTypes} />
            <Route path="/add_sale" exact component={AddSale} />
            <Route path="/edit_sale" exact component={EditSale} />
            <Route path="/temp_estimated_revenue" exact component={LegacyEstimatedRevenue} />
            <Route path="/estimated_revenue" exact component={EstimatedRevenue} />
            <Route path="/labour" exact component={Labour} />
            <Route path="/other_expense" exact component={OtherExpense} />
            <Route path="/expense_detail" exact component={ExpenseDetail} />
            <Route path="/expense_categories" exact component={ExpenseCategories} />
            <Route path="/add_expense" exact component={AddExpense} />
            <Route path="/add_custom_expense" exact component={AddCustomExpense} />
            <Route
              path="/readonly_custom_expense/:expense_type_id"
              exact
              component={ReadOnlyCustomExpense}
            />
            <Route
              path="/edit_custom_expense/:expense_type_id"
              exact
              component={EditCustomExpense}
            />
            <Route path="/crop/new" exact component={AddNewCrop} />
            <Route path="/crop/:crop_id/add_crop_variety" exact component={AddCrop} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              component={ComplianceInfo}
            />

            <Route path="/edit_expense" exact component={TempEditExpense} />
            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/invite_user" exact component={InviteUser} />
            <Route path="/certification" exact component={ViewCertification} />
            <Route
              path="/certification/report_period"
              exact
              component={CertificationReportingPeriod}
            />
            <Route path="/certification/survey" exact component={CertificationSurvey} />
            <Route
              path="/certification/interested_in_organic"
              exact
              component={InterestedOrganic}
            />
            <Route path="/certification/selection" exact component={CertificationSelection} />
            <Route
              path="/certification/certifier/selection"
              exact
              component={CertifierSelectionMenu}
            />
            <Route path="/certification/certifier/request" exact component={RequestCertifier} />
            <Route path="/certification/summary" exact component={SetCertificationSummary} />
            <Route path="/export/:id/from/:from/to/:to" exact component={ExportDownload} />
            <Route path="/tasks/:task_id/abandon" exact component={TaskAbandon} />
            <Route path="/tasks/:task_id/complete" exact component={TaskComplete} />
            <Route path="/tasks/:task_id/before_complete" exact component={TaskCompleteStepOne} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              component={HarvestCompleteQuantity}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact component={HarvestUses} />
            <Route path="/add_task/task_locations" exact component={TaskLocations} />
            <Route path="/add_task/task_date" exact component={TaskDate} />
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_details" exact component={TaskDetails} />
            <Route path="/add_task/task_type_selection" exact component={TaskTypeSelection} />
            <Route path="/add_task/task_crops" exact component={TaskCrops} />
            <Route path="/add_task/manage_custom_tasks" exact component={ManageCustomTasks} />
            <Route path="/add_task/add_custom_task" exact component={AddCustomTask} />
            <Route path="/add_task/edit_custom_task" exact component={EditCustomTask} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              component={EditCustomTaskUpdate}
            />
            <Route path="/add_task/planting_method" exact component={TaskTransplantMethod} />
            <Route path="/add_task/bed_method" exact component={TaskBedMethod} />
            <Route path="/add_task/bed_guidance" exact component={TaskBedGuidance} />
            <Route path="/add_task/container_method" exact component={TaskContainerMethod} />
            <Route path="/add_task/row_method" exact component={TaskRowMethod} />
            <Route path="/add_task/row_guidance" exact component={TaskRowGuidance} />
            <Route path="/notifications" exact component={Notification} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              component={NotificationReadOnly}
            />
            <Route path="/unknown_record" exact component={UnknownRecord} />
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
            <Route path="/profile" exact component={Account} />
            <Route path="/people" exact component={People} />
            <Route path="/farm" exact component={Farm} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />
            <Route path="/crop/:variety_id/detail" exact component={CropDetail} />
            <Route path="/crop/:variety_id/management" exact component={CropManagement} />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              component={ManagementTasks}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              component={ManagementDetails}
            />
            <Route path="/map" exact component={Map} />
            <Route path="/farm_site_boundary/:location_id" component={FarmSiteBoundaryDetails} />
            <Route path="/barn/:location_id" component={BarnDetails} />
            <Route path="/natural_area/:location_id" component={NaturalAreaDetails} />
            <Route path="/surface_water/:location_id" component={SurfaceWaterDetails} />
            <Route path="/residence/:location_id" component={ResidenceDetails} />
            <Route path="/ceremonial_area/:location_id" component={CeremonialAreaDetails} />
            <Route path="/garden/:location_id" component={GardenDetails} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/gate/:location_id" component={GateDetails} />
            <Route path="/water_valve/:location_id" component={WaterValveDetails} />
            <Route path="/fence/:location_id" component={FenceDetails} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />
            <Route path="/watercourse/:location_id" component={WatercourseDetails} />
            <Route path="/sensor/:location_id" component={SensorDetails} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/callback" component={Callback} />
            <Route path="/accept_invitation/sign_up" component={InviteSignUp} />
            <Route path="/accept_invitation/create_account" component={InvitedUserCreateAccount} />
            <Route path="/password_reset" component={PasswordResetAccount} />
            <Route path={'/expired'} component={ExpiredTokenScreen} />
            <Route path="/help" exact component={HelpRequest} />
            <Route path="/tasks" exact component={Tasks} />
            <Route path="/tasks/:task_id/read_only" exact component={TaskReadOnly} />
            <Route path="/tasks/:task_id/abandon" exact component={TaskAbandon} />
            <Route path="/tasks/:task_id/complete" exact component={TaskComplete} />
            <Route path="/tasks/:task_id/before_complete" exact component={TaskCompleteStepOne} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              component={HarvestCompleteQuantity}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact component={HarvestUses} />
            <Route path="/add_task/task_locations" exact component={TaskLocations} />
            <Route path="/add_task/task_date" exact component={TaskDate} />
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_details" exact component={TaskDetails} />
            <Route path="/add_task/task_type_selection" exact component={TaskTypeSelection} />
            <Route path="/add_task/task_crops" exact component={TaskCrops} />
            <Route path="/add_task/manage_custom_tasks" exact component={ManageCustomTasks} />
            <Route path="/add_task/add_custom_task" exact component={AddCustomTask} />
            <Route path="/add_task/edit_custom_task" exact component={EditCustomTask} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              component={EditCustomTaskUpdate}
            />
            <Route path="/add_task/planting_method" exact component={TaskTransplantMethod} />
            <Route path="/add_task/bed_method" exact component={TaskBedMethod} />
            <Route path="/add_task/bed_guidance" exact component={TaskBedGuidance} />
            <Route path="/add_task/container_method" exact component={TaskContainerMethod} />
            <Route path="/add_task/row_method" exact component={TaskRowMethod} />
            <Route path="/add_task/row_guidance" exact component={TaskRowGuidance} />
            <Route path="/notifications" exact component={Notification} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              component={NotificationReadOnly}
            />
            <Route path="/unknown_record" exact component={UnknownRecord} />
            <Redirect to={'/'} />
          </Switch>
        </Suspense>
      );
    }
  } else if (!isAuthenticated()) {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route path={'/render_survey'} exact component={RenderSurvey} />
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
