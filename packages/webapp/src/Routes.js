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
const Profile = React.lazy(() => import('./containers/Profile'));
const ConsentForm = React.lazy(() => import('./containers/Consent'));
const Log = React.lazy(() => import('./containers/Log'));
const NewLog = React.lazy(() => import('./containers/Log/NewLog'));
const FertilizingLog = React.lazy(() => import('./containers/Log/FertilizingLog'));
const PestControlLog = React.lazy(() => import('./containers/Log/PestControlLog'));
const FieldWorkLog = React.lazy(() => import('./containers/Log/FieldWorkLog'));
const HarvestLog = React.lazy(() => import('./containers/Log/HarvestLog'));
const HarvestUseType = React.lazy(() => import('./containers/Log/HarvestUseType'));
const AddHarvestUse = React.lazy(() => import('./containers/Log/AddHarvestUse'));
const HarvestAllocation = React.lazy(() => import('./containers/Log/HarvestAllocation'));
const IrrigationLog = React.lazy(() => import('./containers/Log/IrrigationLog'));
const ScoutingLog = React.lazy(() => import('./containers/Log/ScoutingLog'));
const SeedingLog = React.lazy(() => import('./containers/Log/SeedingLog'));
const soilDataLog = React.lazy(() => import('./containers/Log/soilDataLog'));
const OtherLog = React.lazy(() => import('./containers/Log/OtherLog'));
const EditFertilizingLog = React.lazy(() => import('./containers/Log/EditLog/fertilizing'));
const EditPestControlLog = React.lazy(() => import('./containers/Log/EditLog/pestControl'));
const EditFieldWorkLog = React.lazy(() => import('./containers/Log/EditLog/fieldWork'));
const EditIrrigationLog = React.lazy(() => import('./containers/Log/EditLog/irrigation'));
const EditScoutingLog = React.lazy(() => import('./containers/Log/EditLog/scouting'));
const EditSeedingLog = React.lazy(() => import('./containers/Log/EditLog/seeding'));
const EditSoilDataLog = React.lazy(() => import('./containers/Log/EditLog/soilData'));
const EditOtherLog = React.lazy(() => import('./containers/Log/EditLog/other'));
const Shift = React.lazy(() => import('./containers/Shift'));
const ShiftStepOne = React.lazy(() => import('./containers/Shift/StepOne/StepOne'));
const ShiftStepTwo = React.lazy(() => import('./containers/Shift/StepTwo/StepTwo'));
const Finances = React.lazy(() => import('./containers/Finances'));
const MyShift = React.lazy(() => import('./containers/Shift/MyShift'));
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
const MapVideo = React.lazy(() => import('./components/Map/Videos'));
const PostFarmSiteBoundaryForm = React.lazy(() =>
  import(
    './containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/PostFarmSiteBoundary'
  ),
);

const EditFarmSiteBoundaryForm = React.lazy(() =>
  import(
    './containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/EditFarmSiteBoundary'
  ),
);
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

const EditGateForm = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/GateDetailForm/EditGate'),
);

const PostWaterValveForm = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/WaterValveDetailForm/PostWaterValve'),
);

const EditWaterValveForm = React.lazy(() =>
  import('./containers/LocationDetails/PointDetails/WaterValveDetailForm/EditWaterValve'),
);
const PostBarnForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/BarnDetailForm/PostBarn'),
);

const EditBarnForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/BarnDetailForm/EditBarn'),
);

const PostNaturalAreaForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/PostNaturalArea'),
);

const EditNaturalAreaForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/EditNaturalArea'),
);

const PostSurfaceWaterForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/PostSurfaceWater'),
);

const EditSurfaceWaterForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/EditSurfaceWater'),
);

const PostResidenceForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/ResidenceDetailForm/PostResidence'),
);

const EditResidenceForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/ResidenceDetailForm/EditResidence'),
);

const PostCeremonialForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/PostCeremonialArea'),
);

const EditCeremonialForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/EditCeremonialArea'),
);

const PostGreenhouseForm = React.lazy(() =>
  import('./containers/LocationDetails/AreaDetails/GreenhouseDetailForm/PostGreenhouse'),
);
const CropManagement = React.lazy(() => import('./containers/Crop/CropManagement'));
const CropDetail = React.lazy(() => import('./containers/Crop/CropDetail/index'));

const GreenhouseDetails = React.lazy(() => import('./routes/GreenhouseDetailsRoutes'));
const PostFenceForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/FenceDetailForm/PostFence'),
);

const EditFenceForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/FenceDetailForm/EditFence'),
);

const PostBufferZoneForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/BufferZoneDetailForm/PostBufferZone'),
);

const BufferZoneDetails = React.lazy(() => import('./routes/BufferZoneDetailsRoutes'));

const PostWatercourseForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/WatercourseDetailForm/PostWatercourse'),
);

const EditWatercourseForm = React.lazy(() =>
  import('./containers/LocationDetails/LineDetails/WatercourseDetailForm/EditWatercourse'),
);

const CropCatalogue = React.lazy(() => import('./containers/CropCatalogue'));
const CropVarieties = React.lazy(() => import('./containers/CropVarieties'));
const AddCrop = React.lazy(() => import('./containers/AddCropVariety/AddCropVariety'));
const EditCrop = React.lazy(() => import('./containers/EditCropVariety'));
const ComplianceInfo = React.lazy(() => import('./containers/AddCropVariety/ComplianceInfo'));
const AddNewCrop = React.lazy(() => import('./containers/AddNewCrop'));
const PlantingLocation = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/PlantingLocation'),
);
const InGroundTransplant = React.lazy(() =>
  import('./containers/Crop/AddManagementPlan/InGroundTransplant'),
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

const NextHarvest = React.lazy(() => import('./containers/Crop/AddManagementPlan/NextHarvest'));

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

const ManagementDetail = React.lazy(() => import('./containers/Crop/ManagementDetail'));


const TaskAssignment = React.lazy(() => import('./containers/AddTask/TaskAssignment'));
const TaskNotes = React.lazy(() => import('./containers/AddTask/TaskNotes'));

const TaskDate = React.lazy(() => import('./containers/Task/TaskDate'));


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
  let {
    step_five,
    has_consent,
    role_id,
    status,
    step_one,
    farm_id,
    step_three,
    step_four,
  } = userFarm;
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
            <Route path="/profile" exact component={Profile} />
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/log" exact component={Log} />
            <Route path="/new_log" exact component={NewLog} />
            <Route path="/fertilizing_log" exact component={FertilizingLog} />
            <Route path="/pest_control_log" exact component={PestControlLog} />
            <Route path="/field_work_log" exact component={FieldWorkLog} />
            <Route path="/harvest_log" exact component={HarvestLog} />
            <Route path="/harvest_use_type" exact component={HarvestUseType} />
            <Route path="/add_harvest_use_type" exact component={AddHarvestUse} />
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
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
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
              path="/crop/:variety_id/add_management_plan/next_harvest"
              exact
              component={NextHarvest}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planting_date"
              exact
              component={PlantingDate}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_transplant_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/inground_transplant_method"
              exact
              component={InGroundTransplant}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/transplant_container"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container"
              exact
              component={PlantInContainer}
            />
            <Route path="/crop/:variety_id/add_management_plan/beds" exact component={BedPlan} />
            <Route
              path="/crop/:variety_id/add_management_plan/beds_guidance"
              exact
              component={BedPlanGuidance}
            />
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_notes" exact component={TaskNotes} />
            <Route path="/crop/:variety_id/add_management_plan/rows" exact component={RowMethod} />
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
              path="/crop/:variety_id/:management_plan_id/management_detail"
              exact
              component={ManagementDetail}
            />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />

            <Route path="/documents" exact component={Documents} />

            <Route path="/documents/add_document" exact component={AddDocument} />
            <Route path="/documents/:document_id/edit_document" exact component={EditDocument} />
            <Route path="/documents/:document_id" exact component={MainDocument} />
            <Route path="/tasks/:management_plan_id/add_task/task_date" exact component={TaskDate} />
            <Route path="/map" exact component={Map} />
            <Route path="/map/videos" exact component={MapVideo} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              component={PostFarmSiteBoundaryForm}
            />
            <Route
              path="/farm_site_boundary/:location_id/details"
              exact
              component={EditFarmSiteBoundaryForm}
            />
            <Route
              path="/farm_site_boundary/:location_id/edit"
              exact
              component={EditFarmSiteBoundaryForm}
            />

            <Route path="/create_location/barn" exact component={PostBarnForm} />
            <Route path="/barn/:location_id/details" exact component={EditBarnForm} />
            <Route path="/barn/:location_id/edit" exact component={EditBarnForm} />

            <Route path="/create_location/natural_area" exact component={PostNaturalAreaForm} />
            <Route
              path="/natural_area/:location_id/details"
              exact
              component={EditNaturalAreaForm}
            />
            <Route path="/natural_area/:location_id/edit" exact component={EditNaturalAreaForm} />

            <Route path="/create_location/surface_water" exact component={PostSurfaceWaterForm} />
            <Route
              path="/surface_water/:location_id/details"
              exact
              component={EditSurfaceWaterForm}
            />
            <Route path="/surface_water/:location_id/edit" exact component={EditSurfaceWaterForm} />

            <Route path="/create_location/residence" exact component={PostResidenceForm} />
            <Route path="/residence/:location_id/details" exact component={EditResidenceForm} />
            <Route path="/residence/:location_id/edit" exact component={EditResidenceForm} />

            <Route path="/create_location/ceremonial_area" exact component={PostCeremonialForm} />
            <Route
              path="/ceremonial_area/:location_id/details"
              exact
              component={EditCeremonialForm}
            />
            <Route path="/ceremonial_area/:location_id/edit" exact component={EditCeremonialForm} />

            <Route path="/create_location/garden" exact component={PostGardenForm} />
            <Route path="/garden/:location_id" component={GardenDetails} />

            <Route path="/create_location/greenhouse" exact component={PostGreenhouseForm} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />

            <Route path="/create_location/field" exact component={PostFieldForm} />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/create_location/gate" exact component={PostGateForm} />
            <Route path="/gate/:location_id/details" exact component={EditGateForm} />
            <Route path="/gate/:location_id/edit" exact component={EditGateForm} />

            <Route path="/create_location/water_valve" exact component={PostWaterValveForm} />
            <Route path="/water_valve/:location_id/details" exact component={EditWaterValveForm} />
            <Route path="/water_valve/:location_id/edit" exact component={EditWaterValveForm} />

            <Route path="/create_location/fence" exact component={PostFenceForm} />
            <Route path="/fence/:location_id/details" exact component={EditFenceForm} />
            <Route path="/fence/:location_id/edit" exact component={EditFenceForm} />

            <Route path="/create_location/buffer_zone" exact component={PostBufferZoneForm} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />

            <Route path="/create_location/watercourse" exact component={PostWatercourseForm} />
            <Route path="/watercourse/:location_id/details" exact component={EditWatercourseForm} />
            <Route path="/watercourse/:location_id/edit" exact component={EditWatercourseForm} />

            <Route path="/finances" exact component={Finances} />
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
            <Route path="/edit_expense" exact component={TempEditExpense} />

            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/log_detail" exact component={LogDetail} />
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
            <Route path="/export/:id" exact component={ExportDownload} />
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
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/log" exact component={Log} />
            <Route path="/new_log" exact component={NewLog} />
            <Route path="/fertilizing_log" exact component={FertilizingLog} />
            <Route path="/pest_control_log" exact component={PestControlLog} />
            <Route path="/field_work_log" exact component={FieldWorkLog} />
            <Route path="/harvest_log" exact component={HarvestLog} />
            <Route path="/harvest_use_type" exact component={HarvestUseType} />
            <Route path="/add_harvest_use_type" exact component={AddHarvestUse} />
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
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
            <Route path="/crop/new" exact component={AddNewCrop} />
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
              path="/crop/:variety_id/add_management_plan/next_harvest"
              exact
              component={NextHarvest}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planting_date"
              exact
              component={PlantingDate}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planting_method"
              exact
              component={PlantingMethod}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast"
              exact
              component={PlantBroadcast}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/transplant_container"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container"
              exact
              component={PlantInContainer}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/management_detail"
              exact
              component={ManagementDetail}
            />
            <Route path="/crop/:variety_id/add_management_plan/rows" exact component={RowMethod} />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              exact
              component={RowMethodGuidance}
            />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />
            <Route path="/crop/:variety_id/detail" component={CropDetail} />
            <Route path="/crop/:variety_id/management" component={CropManagement} />
            <Route path="/crop/:variety_id/edit_crop_variety" exact component={EditCrop} />
            <Route path="/documents" exact component={Documents} />

            <Route path="/documents/:document_id/edit_document" exact component={EditDocument} />
            <Route path="/documents/:document_id" exact component={MainDocument} />
            <Route path="/documents/add_document" exact component={AddDocument} />
            <Route path="/tasks/:management_plan_id/add_task/task_date" exact component={TaskDate} />
            <Route path="/map" exact component={Map} />
            <Route path="/map/videos" exact component={MapVideo} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              component={PostFarmSiteBoundaryForm}
            />
            <Route
              path="/farm_site_boundary/:location_id/details"
              exact
              component={EditFarmSiteBoundaryForm}
            />
            <Route
              path="/farm_site_boundary/:location_id/edit"
              exact
              component={EditFarmSiteBoundaryForm}
            />
            <Route path="/create_location/barn" exact component={PostBarnForm} />
            <Route path="/barn/:location_id/details" exact component={EditBarnForm} />
            <Route path="/barn/:location_id/edit" exact component={EditBarnForm} />
            <Route path="/create_location/natural_area" exact component={PostNaturalAreaForm} />
            <Route
              path="/natural_area/:location_id/details"
              exact
              component={EditNaturalAreaForm}
            />
            <Route path="/natural_area/:location_id/edit" exact component={EditNaturalAreaForm} />
            <Route path="/create_location/surface_water" exact component={PostSurfaceWaterForm} />
            <Route
              path="/surface_water/:location_id/details"
              exact
              component={EditSurfaceWaterForm}
            />
            <Route path="/surface_water/:location_id/edit" exact component={EditSurfaceWaterForm} />
            <Route path="/create_location/residence" exact component={PostResidenceForm} />
            <Route path="/residence/:location_id/details" exact component={EditResidenceForm} />
            <Route path="/residence/:location_id/edit" exact component={EditResidenceForm} />
            <Route path="/create_location/ceremonial_area" exact component={PostCeremonialForm} />
            <Route
              path="/ceremonial_area/:location_id/details"
              exact
              component={EditCeremonialForm}
            />
            <Route path="/ceremonial_area/:location_id/edit" exact component={EditCeremonialForm} />
            <Route path="/create_location/greenhouse" exact component={PostGreenhouseForm} />
            <Route path="/create_location/garden" exact component={PostGardenForm} />
            <Route path="/garden/:location_id" component={GardenDetails} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />
            <Route path="/create_location/field" exact component={PostFieldForm} />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/create_location/gate" exact component={PostGateForm} />
            <Route path="/gate/:location_id/details" exact component={EditGateForm} />
            <Route path="/gate/:location_id/edit" exact component={EditGateForm} />
            <Route path="/create_location/water_valve" exact component={PostWaterValveForm} />
            <Route path="/water_valve/:location_id/details" exact component={EditWaterValveForm} />
            <Route path="/water_valve/:location_id/edit" exact component={EditWaterValveForm} />
            <Route path="/create_location/fence" exact component={PostFenceForm} />
            <Route path="/fence/:location_id/details" exact component={EditFenceForm} />
            <Route path="/fence/:location_id/edit" exact component={EditFenceForm} />
            <Route path="/create_location/buffer_zone" exact component={PostBufferZoneForm} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />
            <Route path="/create_location/watercourse" exact component={PostWatercourseForm} />
            <Route path="/watercourse/:location_id/details" exact component={EditWatercourseForm} />
            <Route path="/watercourse/:location_id/edit" exact component={EditWatercourseForm} />

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
            <Route path="/crop/new" exact component={AddNewCrop} />
            <Route path="/crop/:crop_id/add_crop_variety" exact component={AddCrop} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              component={ComplianceInfo}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_planting_location"
              exact
              component={PlantingLocation}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/inground_transplant_method"
              exact
              component={InGroundTransplant}
            />
            <Route path="/crop/:variety_id/add_management_plan" exact component={Transplant} />
            {/* TODO: use edit_expense_categories and edit_add_expense when restructuring edit expense */}
            {/* and remove edit_expense  */}
            {/* <Route path="/edit_expense_categories" exact component={EditExpenseCategories} /> */}
            {/* <Route path="/edit_add_expense" exact component={EditAddExpense} /> */}
            <Route path="/edit_expense" exact component={TempEditExpense} />
            <Route path="/sale_detail" exact component={SaleDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/insights" exact component={Insights} />
            <Route path="/insights/peoplefed" exact component={PeopleFed} />
            <Route path="/insights/soilom" exact component={SoilOM} />
            <Route path="/insights/labourhappiness" exact component={LabourHappiness} />
            <Route path="/insights/biodiversity" exact component={Biodiversity} />
            <Route path="/insights/prices" exact component={Prices} />
            <Route path="/insights/waterbalance" exact component={WaterBalance} />
            <Route path="/insights/erosion" exact component={Erosion} />
            <Route path="/insights/nitrogenbalance" exact component={NitrogenBalance} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
            <Route path="/log_detail" exact component={LogDetail} />
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
            <Route path={'/export/:id'} exact component={ExportDownload} />
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_notes" exact component={TaskNotes} />
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
            <Route path="/consent" exact component={ConsentForm} />
            <Route path="/crop_catalogue" exact component={CropCatalogue} />
            <Route path="/crop_varieties/crop/:crop_id" exact component={CropVarieties} />

            <Route
              path="/crop/:variety_id/:management_plan_id/management_detail"
              exact
              component={ManagementDetail}
            />

            <Route path="/crop/:variety_id/:management_plan_id/management_detail" exact component={ManagementDetail} />
            <Route path="/tasks/:management_plan_id/add_task/task_date" exact component={TaskDate} />

            <Route path="/barn/:location_id/details" exact component={EditBarnForm} />
            <Route path="/ceremonial/:location_id/details" exact component={EditCeremonialForm} />
            <Route
              path="/farm_site_boundary/:location_id/details"
              exact
              component={EditFarmSiteBoundaryForm}
            />
            <Route path="/field/:location_id" component={FieldDetails} />
            <Route path="/garden/:location_id" component={GardenDetails} />
            <Route path="/greenhouse/:location_id" component={GreenhouseDetails} />
            <Route
              path="/surface_water/:location_id/details"
              exact
              component={EditSurfaceWaterForm}
            />

            <Route
              path="/natural_area/:location_id/details"
              exact
              component={EditNaturalAreaForm}
            />
            <Route path="/residence/:location_id/details" exact component={EditResidenceForm} />
            <Route path="/buffer_zone/:location_id" component={BufferZoneDetails} />
            <Route path="/watercourse/:location_id/details" exact component={EditWatercourseForm} />
            <Route path="/fence/:location_id/details" exact component={EditFenceForm} />
            <Route path="/gate/:location_id/details" exact component={EditGateForm} />
            <Route path="/water_valve/:location_id/details" exact component={EditWaterValveForm} />
            <Route path="/map" exact component={Map} />
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
            <Route path="/irrigation_log/edit" exact component={EditIrrigationLog} />
            <Route path="/scouting_log/edit" exact component={EditScoutingLog} />
            <Route path="/soil_data_log/edit" exact component={EditSoilDataLog} />
            <Route path="/other_log/edit" exact component={EditOtherLog} />
            <Route path="/shift" exact component={Shift} />
            <Route path="/shift_step_one" exact component={ShiftStepOne} />
            <Route path="/shift_step_two" exact component={ShiftStepTwo} />
            <Route path="/my_shift" exact component={MyShift} />
            <Route path="/log_detail" exact component={LogDetail} />
            <Route path="/farm_selection" exact component={ChooseFarm} />
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
            <Route path="/add_task/task_assignment" exact component={TaskAssignment} />
            <Route path="/add_task/task_notes" exact component={TaskNotes} />
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
