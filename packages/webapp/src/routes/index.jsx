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

/* eslint-disable react/no-children-prop */
import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Spinner from '../components/Spinner';

// Components that have already been set up with code splitting
import OnboardingFlow from './Onboarding';
import CustomSignUp from '../containers/CustomSignUp';
import { useSelector } from 'react-redux';
import { isAuthenticated } from '../util/jwt';

// action
import { userFarmSelector } from '../containers/userFarmSlice';
import { chooseFarmFlowSelector } from '../containers/ChooseFarm/chooseFarmFlowSlice';
import useScrollToTop from '../containers/hooks/useScrollToTop';
import { useReduxSnackbar } from '../containers/Snackbar/useReduxSnackbar';

//dynamic imports
const Home = React.lazy(() => import('../containers/Home'));
const Account = React.lazy(() => import('../containers/Profile/Account'));
const Farm = React.lazy(() => import('../containers/Profile/Farm/Farm'));
const People = React.lazy(() => import('../containers/Profile/People/People'));
const EditUser = React.lazy(() => import('../containers/Profile/EditUser'));
const ConsentForm = React.lazy(() => import('../containers/Consent'));
const Finances = React.lazy(() => import('./FinancesRoutes'));
const Animals = React.lazy(() => import('./AnimalsRoutes'));
const ChooseFarm = React.lazy(() => import('../containers/ChooseFarm'));
const PasswordResetAccount = React.lazy(() => import('../containers/PasswordResetAccount'));
const InviteSignUp = React.lazy(() => import('../containers/InviteSignUp'));
const InvitedUserCreateAccount = React.lazy(() => import('../containers/InvitedUserCreateAccount'));
const Callback = React.lazy(() => import('../containers/Callback'));
const JoinFarmSuccessScreen = React.lazy(() => import('../containers/JoinFarmSuccessScreen'));
const InviteUser = React.lazy(() => import('../containers/InviteUser'));
// Insights imports
const Insights = React.lazy(() => import('../containers/Insights'));
const SoilOM = React.lazy(() => import('../containers/Insights/SoilOM'));
const LabourHappiness = React.lazy(() => import('../containers/Insights/LabourHappiness'));
const Biodiversity = React.lazy(() => import('../containers/Insights/Biodiversity'));
const Prices = React.lazy(() => import('../containers/Insights/Prices'));
const ExpiredTokenScreen = React.lazy(() => import('../containers/ExpiredTokenScreen'));
const Map = React.lazy(() => import('../containers/Map'));
const MapVideo = React.lazy(() => import('../components/Map/Videos'));
const PostFarmSiteBoundaryForm = React.lazy(
  () =>
    import(
      '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/PostFarmSiteBoundary'
    ),
);
const FarmSiteBoundaryDetails = React.lazy(() => import('./FarmSiteBoundaryDetailsRoutes'));

const PostFieldForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/FieldDetailForm/PostField'),
);
const FieldDetails = React.lazy(() => import('./FieldDetailsRoutes'));

const PostGardenForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/GardenDetailForm/PostGarden'),
);
const GardenDetails = React.lazy(() => import('./GardenDetailsRoutes'));

const PostGateForm = React.lazy(
  () => import('../containers/LocationDetails/PointDetails/GateDetailForm/PostGate'),
);
const GateDetails = React.lazy(() => import('./GateDetailsRoutes'));

const PostWaterValveForm = React.lazy(
  () => import('../containers/LocationDetails/PointDetails/WaterValveDetailForm/PostWaterValve'),
);
const WaterValveDetails = React.lazy(() => import('./WaterValveDetailsRoutes'));
const EditSensor = React.lazy(
  () => import('../containers/LocationDetails/PointDetails/SensorDetail/EditSensor'),
);

const PostBarnForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/BarnDetailForm/PostBarn'),
);
const BarnDetails = React.lazy(() => import('./BarnDetailsRoutes'));

const PostNaturalAreaForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/PostNaturalArea'),
);
const NaturalAreaDetails = React.lazy(() => import('./NaturalAreaDetailsRoutes'));

const PostSurfaceWaterForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/PostSurfaceWater'),
);
const SurfaceWaterDetails = React.lazy(() => import('./SurfaceWaterDetailsRoutes'));

const PostResidenceForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/ResidenceDetailForm/PostResidence'),
);
const ResidenceDetails = React.lazy(() => import('./ResidenceDetailsRoutes'));

const PostCeremonialForm = React.lazy(
  () =>
    import('../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/PostCeremonialArea'),
);
const CeremonialAreaDetails = React.lazy(() => import('./CeremonialAreaDetailsRoutes'));

const PostGreenhouseForm = React.lazy(
  () => import('../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/PostGreenhouse'),
);
const GreenhouseDetails = React.lazy(() => import('./GreenhouseDetailsRoutes'));

const CropManagement = React.lazy(() => import('../containers/Crop/CropManagement'));
const CropDetail = React.lazy(() => import('../containers/Crop/CropDetail/index'));

const PostFenceForm = React.lazy(
  () => import('../containers/LocationDetails/LineDetails/FenceDetailForm/PostFence'),
);
const FenceDetails = React.lazy(() => import('./FenceDetailsRoutes'));

const PostBufferZoneForm = React.lazy(
  () => import('../containers/LocationDetails/LineDetails/BufferZoneDetailForm/PostBufferZone'),
);
const BufferZoneDetails = React.lazy(() => import('./BufferZoneDetailsRoutes'));

const PostWatercourseForm = React.lazy(
  () => import('../containers/LocationDetails/LineDetails/WatercourseDetailForm/PostWatercourse'),
);
const WatercourseDetails = React.lazy(() => import('./WatercourseDetailsRoutes'));
const SensorDetails = React.lazy(() => import('./SensorDetailsRoutes'));

const CropCatalogue = React.lazy(() => import('../containers/CropCatalogue'));
const CropVarieties = React.lazy(() => import('../containers/CropVarieties'));
const AddCrop = React.lazy(() => import('../containers/AddCropVariety/AddCropVariety'));
const EditCrop = React.lazy(() => import('../containers/EditCropVariety'));
const ComplianceInfo = React.lazy(() => import('../containers/AddCropVariety/ComplianceInfo'));
const AddNewCrop = React.lazy(() => import('../containers/AddNewCrop'));
const PlantingLocation = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/PlantingLocation'),
);
const Transplant = React.lazy(() => import('../containers/Crop/AddManagementPlan/Transplant'));
const PlantingDate = React.lazy(() => import('../containers/Crop/AddManagementPlan/PlantingDate'));
const PlantingMethod = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/PlantingMethod'),
);
const PlantInContainer = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/PlantInContainer'),
);
const PlantBroadcast = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/BroadcastPlan'),
);
const BedPlan = React.lazy(() => import('../containers/Crop/AddManagementPlan/BedPlan/BedPlan'));
const BedPlanGuidance = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/BedPlan/BedPlanGuidance'),
);
const ManagementPlanName = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/ManagementPlanName'),
);
const RowMethod = React.lazy(() => import('../containers/Crop/AddManagementPlan/RowMethod'));
const RowMethodGuidance = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/RowMethod/RowGuidance'),
);

const PlantedAlready = React.lazy(
  () => import('../containers/Crop/AddManagementPlan/PlantedAlready'),
);

const Documents = React.lazy(() => import('../containers/Documents'));

const EditDocument = React.lazy(() => import('../containers/Documents/Edit'));

const AddDocument = React.lazy(() => import('../containers/Documents/Add'));
const MainDocument = React.lazy(() => import('../containers/Documents/Main'));
const CertificationReportingPeriod = React.lazy(
  () => import('../containers/Certifications/ReportingPeriod'),
);
const CertificationSurvey = React.lazy(() => import('../containers/Certifications/Survey'));

const InterestedOrganic = React.lazy(
  () => import('../containers/OrganicCertifierSurvey/InterestedOrganic/UpdateInterestedOrganic'),
);
const CertificationSelection = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/CertificationSelection/UpdateCertificationSelection'
    ),
);

const CertifierSelectionMenu = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/CertifierSelectionMenu/UpdateCertifierSelectionMenu'
    ),
);

const SetCertificationSummary = React.lazy(
  () =>
    import(
      '../containers/OrganicCertifierSurvey/SetCertificationSummary/UpdateSetCertificationSummary'
    ),
);

const RequestCertifier = React.lazy(
  () => import('../containers/OrganicCertifierSurvey/RequestCertifier/UpdateRequestCertifier'),
);
const ViewCertification = React.lazy(
  () => import('../containers/OrganicCertifierSurvey/ViewCertification/ViewCertification'),
);

const RenderSurvey = React.lazy(() => import('../containers/RenderSurvey/RenderSurvey'));
const ExportDownload = React.lazy(() => import('../containers/ExportDownload'));

const ManagementTasks = React.lazy(
  () => import('../containers/Crop/ManagementDetail/ManagementTasks'),
);
const ManagementDetails = React.lazy(
  () => import('../containers/Crop/ManagementDetail/ManagementDetails'),
);
const EditManagementDetails = React.lazy(
  () => import('../containers/Crop/ManagementDetail/EditManagementDetails'),
);
const CompleteManagementPlan = React.lazy(
  () => import('../containers/Crop/CompleteManagementPlan/CompleteManagementPlan'),
);
const AbandonManagementPlan = React.lazy(
  () => import('../containers/Crop/CompleteManagementPlan/AbandonManagementPlan'),
);
const RepeatCropPlan = React.lazy(() => import('../containers/Crop/RepeatCropPlan'));
const RepeatCropPlanConfirmation = React.lazy(
  () => import('../containers/Crop/RepeatCropPlan/Confirmation'),
);

const TaskAssignment = React.lazy(() => import('../containers/Task/TaskAssignment'));
const TaskDetails = React.lazy(() => import('../containers/Task/TaskDetails'));
const TaskTypeSelection = React.lazy(() => import('../containers/Task/TaskTypeSelection'));
const TaskDate = React.lazy(() => import('../containers/Task/TaskDate'));
const TaskCrops = React.lazy(() => import('../containers/Task/TaskCrops'));
const TaskAnimals = React.lazy(() => import('../containers/Task/TaskAnimalInventory'));
const TaskLocations = React.lazy(() => import('../containers/Task/TaskLocations'));
const Tasks = React.lazy(() => import('../containers/Task'));
const ManageCustomTasks = React.lazy(() => import('../containers/Task/ManageCustomTasks'));
const AddCustomTask = React.lazy(() => import('../containers/Task/AddCustomTask'));
const TaskComplete = React.lazy(() => import('../containers/Task/TaskComplete'));
const HarvestCompleteQuantity = React.lazy(
  () => import('../containers/Task/TaskComplete/HarvestComplete/Quantity'),
);
const HarvestUses = React.lazy(
  () => import('../containers/Task/TaskComplete/HarvestComplete/HarvestUses'),
);
const TaskCompleteStepOne = React.lazy(() => import('../containers/Task/TaskComplete/StepOne'));
const TaskReadOnly = React.lazy(() => import('../containers/Task/TaskReadOnly'));
const EditCustomTask = React.lazy(() => import('../containers/Task/EditCustomTask'));
const TaskAbandon = React.lazy(() => import('../containers/Task/TaskAbandon'));
const EditCustomTaskUpdate = React.lazy(() => import('../containers/Task/EditCustomTaskUpdate'));
const TaskTransplantMethod = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskTransplantMethod'),
);
const TaskBedMethod = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskBedMethod'),
);
const TaskBedGuidance = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskBedGuidance'),
);
const TaskRowMethod = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskRowMethod'),
);
const TaskRowGuidance = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskRowGuidance'),
);
const TaskContainerMethod = React.lazy(
  () => import('../containers/Task/TaskTransplantMethod/TaskContainerMethod'),
);
const Notification = React.lazy(() => import('../containers/Notification'));
const NotificationReadOnly = React.lazy(
  () => import('../containers/Notification/NotificationReadOnly'),
);
const UnknownRecord = React.lazy(
  () => import('../containers/ErrorHandler/UnknownRecord/UnknownRecord'),
);

const Routes = ({ isCompactSideMenu, isFeedbackSurveyOpen, setFeedbackSurveyOpen }) => {
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
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/consent" exact>
              <ConsentForm goForwardTo={'/outro'} goBackTo={null} />
            </Route>
            <Route path="/outro" exact children={<JoinFarmSuccessScreen />} />
            {!has_consent && <Route render={() => <Redirect to={'/consent'} />} />}
          </Switch>
        </Suspense>
      );
    } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
      return <OnboardingFlow {...userFarm} />;
    } else if (!has_consent) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/consent" exact>
              <ConsentForm goForwardTo={'/'} goBackTo={null} />
            </Route>
            {!has_consent && <Route render={() => <Redirect to={'/consent'} />} />}
          </Switch>
        </Suspense>
      );
    } else if (role_id === 1) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact children={<Home />} />
            <Route path="/home" exact children={<Home />} />
            <Route path="/profile" exact children={<Account />} />
            <Route path="/people" exact children={<People />} />
            <Route path="/farm" exact children={<Farm />} />
            <Route path="/user/:user_id" exact children={<EditUser />} />
            <Route path="/consent" exact children={<ConsentForm />} />
            <Route path="/crop/new" exact children={<AddNewCrop />} />
            <Route path="/crop/:crop_id/add_crop_variety" exact children={<AddCrop />} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              children={<ComplianceInfo />}
            />
            <Route path="/crop/:variety_id/detail" exact children={<CropDetail />} />
            <Route path="/crop/:variety_id/management" exact children={<CropManagement />} />
            <Route path="/crop/:variety_id/edit_crop_variety" exact children={<EditCrop />} />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              exact
              children={<PlantedAlready />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              exact
              children={<Transplant />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              exact
              children={<PlantingDate />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              exact
              children={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              exact
              children={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              exact
              children={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              exact
              children={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              exact
              children={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              exact
              children={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              exact
              children={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              exact
              children={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              exact
              children={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              exact
              children={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              exact
              children={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              exact
              children={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_method"
              exact
              children={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              exact
              children={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              exact
              children={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              exact
              children={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              exact
              children={<ManagementPlanName />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              children={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              children={<ManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              exact
              children={<RepeatCropPlan />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              exact
              children={<RepeatCropPlanConfirmation />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              exact
              children={<EditManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              exact
              children={<CompleteManagementPlan />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              exact
              children={<AbandonManagementPlan />}
            />
            <Route path="/crop_catalogue" exact children={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" exact children={<CropVarieties />} />
            <Route path="/documents" exact children={<Documents />} />
            <Route path="/documents/add_document" exact children={<AddDocument />} />
            <Route path="/documents/:document_id/edit_document" exact children={<EditDocument />} />
            <Route path="/documents/:document_id" exact children={<MainDocument />} />
            <Route path="/tasks" exact children={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" exact children={<TaskReadOnly />} />
            <Route path="/tasks/:task_id/complete" exact children={<TaskComplete />} />
            <Route
              path="/tasks/:task_id/before_complete"
              exact
              children={<TaskCompleteStepOne />}
            />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              children={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact children={<HarvestUses />} />
            <Route path="/tasks/:task_id/abandon" exact children={<TaskAbandon />} />
            <Route
              path="/map"
              exact
              render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
            />
            <Route path="/map/videos" exact children={<MapVideo />} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              children={<PostFarmSiteBoundaryForm />}
            />
            <Route path="/create_location/barn" exact children={<PostBarnForm />} />
            <Route path="/create_location/natural_area" exact children={<PostNaturalAreaForm />} />
            <Route
              path="/create_location/surface_water"
              exact
              children={<PostSurfaceWaterForm />}
            />
            <Route path="/create_location/residence" exact children={<PostResidenceForm />} />
            <Route
              path="/create_location/ceremonial_area"
              exact
              children={<PostCeremonialForm />}
            />
            <Route path="/create_location/garden" exact children={<PostGardenForm />} />
            <Route path="/create_location/greenhouse" exact children={<PostGreenhouseForm />} />
            <Route path="/create_location/field" exact children={<PostFieldForm />} />
            <Route path="/create_location/gate" exact children={<PostGateForm />} />
            <Route path="/create_location/water_valve" exact children={<PostWaterValveForm />} />
            <Route path="/create_location/fence" exact children={<PostFenceForm />} />
            <Route path="/create_location/buffer_zone" exact children={<PostBufferZoneForm />} />
            <Route path="/create_location/watercourse" exact children={<PostWatercourseForm />} />
            <Route path="/farm_site_boundary/:location_id" children={<FarmSiteBoundaryDetails />} />
            <Route path="/barn/:location_id" children={<BarnDetails />} />
            <Route path="/natural_area/:location_id" children={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id" children={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id" children={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id" children={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id" children={<GardenDetails />} />
            <Route path="/greenhouse/:location_id" children={<GreenhouseDetails />} />
            <Route path="/field/:location_id" children={<FieldDetails />} />
            <Route path="/gate/:location_id" children={<GateDetails />} />
            <Route path="/water_valve/:location_id" children={<WaterValveDetails />} />
            <Route path="/fence/:location_id" children={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id" children={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id" children={<WatercourseDetails />} />
            <Route path="/sensor/:location_id" children={<SensorDetails />} />
            <Route path="/sensor/:location_id/edit" exact children={<EditSensor />} />
            <Route path="/insights" exact children={<Insights />} />
            <Route path="/insights/soilom" exact children={<SoilOM />} />
            <Route path="/insights/labourhappiness" exact children={<LabourHappiness />} />
            <Route path="/insights/biodiversity" exact children={<Biodiversity />} />
            <Route path="/insights/prices" exact children={<Prices />} />
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/callback" children={<Callback />} />
            <Route path="/accept_invitation/sign_up" children={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              children={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" children={<PasswordResetAccount />} />
            <Route path={'/expired'} children={<ExpiredTokenScreen />} />
            <Route path="/invite_user" exact children={<InviteUser />} />
            <Route path="/certification" exact children={<ViewCertification />} />
            <Route
              path="/certification/report_period"
              exact
              children={<CertificationReportingPeriod />}
            />
            <Route path="/certification/survey" exact children={<CertificationSurvey />} />
            <Route
              path="/certification/interested_in_organic"
              exact
              children={<InterestedOrganic />}
            />
            <Route path="/certification/selection" exact children={<CertificationSelection />} />
            <Route
              path="/certification/certifier/selection"
              exact
              children={<CertifierSelectionMenu />}
            />
            <Route path="/certification/certifier/request" exact children={<RequestCertifier />} />
            <Route path="/certification/summary" exact children={<SetCertificationSummary />} />
            <Route path="/export/:id/from/:from/to/:to" exact children={<ExportDownload />} />
            <Route path="/add_task/task_locations" exact children={<TaskLocations />} />
            <Route path="/add_task/task_date" exact children={<TaskDate />} />
            <Route path="/add_task/task_assignment" exact children={<TaskAssignment />} />
            <Route path="/add_task/task_details" exact children={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" exact children={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" exact children={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" exact children={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" exact children={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" exact children={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" exact children={<EditCustomTask />} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              children={<EditCustomTaskUpdate />}
            />
            <Route path="/add_task/planting_method" exact children={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" exact children={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" exact children={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" exact children={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" exact children={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" exact children={<TaskRowGuidance />} />
            <Route path="/notifications" exact children={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              children={<NotificationReadOnly />}
            />
            <Route path="/finances/*" exact children={<Finances />} />
            <Route
              path="/animals/*"
              exact
              render={(props) => (
                <Animals
                  isCompactSideMenu={isCompactSideMenu}
                  setFeedbackSurveyOpen={setFeedbackSurveyOpen}
                  {...props}
                />
              )}
            />
            <Route path="/unknown_record" exact children={<UnknownRecord />} />
            <Route
              // TODO: Change to 404
              render={() => <Redirect to={'/'} />}
            />
          </Switch>
        </Suspense>
      );
    } else if (role_id === 2 || role_id === 5) {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact children={<Home />} />
            <Route path="/home" exact children={<Home />} />
            <Route path="/profile" exact children={<Account />} />
            <Route path="/people" exact children={<People />} />
            <Route path="/user/:user_id" exact children={<EditUser />} />

            <Route path="/farm" exact children={<Farm />} />
            <Route path="/consent" exact children={<ConsentForm />} />
            <Route path="/crop/new" exact children={<AddNewCrop />} />
            <Route path="/tasks" exact children={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" exact children={<TaskReadOnly />} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              children={<ComplianceInfo />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              exact
              children={<PlantedAlready />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              exact
              children={<Transplant />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              exact
              children={<PlantingDate />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              exact
              children={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              exact
              children={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              exact
              children={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              exact
              children={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              exact
              children={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              exact
              children={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              exact
              children={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              exact
              children={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              exact
              children={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              exact
              children={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              exact
              children={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              exact
              children={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_method"
              exact
              children={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              exact
              children={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              exact
              children={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              exact
              children={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              exact
              children={<ManagementPlanName />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              children={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              children={<ManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              exact
              children={<EditManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              exact
              children={<RepeatCropPlan />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              exact
              children={<RepeatCropPlanConfirmation />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              exact
              children={<CompleteManagementPlan />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              exact
              children={<AbandonManagementPlan />}
            />
            <Route path="/crop_catalogue" exact children={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" exact children={<CropVarieties />} />
            <Route path="/crop/:variety_id/detail" children={<CropDetail />} />
            <Route path="/crop/:variety_id/management" children={<CropManagement />} />
            <Route path="/crop/:variety_id/edit_crop_variety" exact children={<EditCrop />} />
            <Route path="/documents" exact children={<Documents />} />
            <Route path="/documents/add_document" exact children={<AddDocument />} />
            <Route path="/documents/:document_id/edit_document" exact children={<EditDocument />} />
            <Route path="/documents/:document_id" exact children={<MainDocument />} />
            <Route
              path="/map"
              exact
              render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
            />
            <Route path="/map/videos" exact children={<MapVideo />} />
            <Route
              path="/create_location/farm_site_boundary"
              exact
              children={<PostFarmSiteBoundaryForm />}
            />
            <Route path="/create_location/barn" exact children={<PostBarnForm />} />
            <Route path="/create_location/natural_area" exact children={<PostNaturalAreaForm />} />
            <Route
              path="/create_location/surface_water"
              exact
              children={<PostSurfaceWaterForm />}
            />
            <Route path="/create_location/residence" exact children={<PostResidenceForm />} />
            <Route
              path="/create_location/ceremonial_area"
              exact
              children={<PostCeremonialForm />}
            />
            <Route path="/create_location/garden" exact children={<PostGardenForm />} />
            <Route path="/create_location/greenhouse" exact children={<PostGreenhouseForm />} />
            <Route path="/create_location/field" exact children={<PostFieldForm />} />
            <Route path="/create_location/gate" exact children={<PostGateForm />} />
            <Route path="/create_location/water_valve" exact children={<PostWaterValveForm />} />
            <Route path="/create_location/fence" exact children={<PostFenceForm />} />
            <Route path="/create_location/buffer_zone" exact children={<PostBufferZoneForm />} />
            <Route path="/create_location/watercourse" exact children={<PostWatercourseForm />} />
            <Route path="/farm_site_boundary/:location_id" children={<FarmSiteBoundaryDetails />} />
            <Route path="/barn/:location_id" children={<BarnDetails />} />
            <Route path="/natural_area/:location_id" children={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id" children={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id" children={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id" children={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id" children={<GardenDetails />} />
            <Route path="/greenhouse/:location_id" children={<GreenhouseDetails />} />
            <Route path="/field/:location_id" children={<FieldDetails />} />
            <Route path="/gate/:location_id" children={<GateDetails />} />
            <Route path="/water_valve/:location_id" children={<WaterValveDetails />} />
            <Route path="/fence/:location_id" children={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id" children={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id" children={<WatercourseDetails />} />
            <Route path="/sensor/:location_id" children={<SensorDetails />} />
            <Route path="/crop/new" exact children={<AddNewCrop />} />
            <Route path="/crop/:crop_id/add_crop_variety" exact children={<AddCrop />} />
            <Route
              path="/crop/:crop_id/add_crop_variety/compliance"
              exact
              children={<ComplianceInfo />}
            />
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/insights" exact children={<Insights />} />
            <Route path="/insights/soilom" exact children={<SoilOM />} />
            <Route path="/insights/labourhappiness" exact children={<LabourHappiness />} />
            <Route path="/insights/biodiversity" exact children={<Biodiversity />} />
            <Route path="/insights/prices" exact children={<Prices />} />
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/callback" children={<Callback />} />
            <Route path="/accept_invitation/sign_up" children={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              children={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" children={<PasswordResetAccount />} />
            <Route path={'/expired'} children={<ExpiredTokenScreen />} />
            <Route path="/invite_user" exact children={<InviteUser />} />
            <Route path="/certification" exact children={<ViewCertification />} />
            <Route
              path="/certification/report_period"
              exact
              children={<CertificationReportingPeriod />}
            />
            <Route path="/certification/survey" exact children={<CertificationSurvey />} />
            <Route
              path="/certification/interested_in_organic"
              exact
              children={<InterestedOrganic />}
            />
            <Route path="/certification/selection" exact children={<CertificationSelection />} />
            <Route
              path="/certification/certifier/selection"
              exact
              children={<CertifierSelectionMenu />}
            />
            <Route path="/certification/certifier/request" exact children={<RequestCertifier />} />
            <Route path="/certification/summary" exact children={<SetCertificationSummary />} />
            <Route path="/export/:id/from/:from/to/:to" exact children={<ExportDownload />} />
            <Route path="/tasks/:task_id/abandon" exact children={<TaskAbandon />} />
            <Route path="/tasks/:task_id/complete" exact children={<TaskComplete />} />
            <Route
              path="/tasks/:task_id/before_complete"
              exact
              children={<TaskCompleteStepOne />}
            />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              children={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact children={<HarvestUses />} />
            <Route path="/add_task/task_locations" exact children={<TaskLocations />} />
            <Route path="/add_task/task_date" exact children={<TaskDate />} />
            <Route path="/add_task/task_assignment" exact children={<TaskAssignment />} />
            <Route path="/add_task/task_details" exact children={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" exact children={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" exact children={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" exact children={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" exact children={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" exact children={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" exact children={<EditCustomTask />} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              children={<EditCustomTaskUpdate />}
            />
            <Route path="/add_task/planting_method" exact children={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" exact children={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" exact children={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" exact children={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" exact children={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" exact children={<TaskRowGuidance />} />
            <Route path="/notifications" exact children={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              children={<NotificationReadOnly />}
            />
            <Route path="/finances" children={<Finances />} />
            <Route
              path="/animals/*"
              exact
              render={(props) => (
                <Animals
                  isCompactSideMenu={isCompactSideMenu}
                  setFeedbackSurveyOpen={setFeedbackSurveyOpen}
                  {...props}
                />
              )}
            />
            <Route path="/unknown_record" exact children={<UnknownRecord />} />
            <Route render={() => <Redirect to={'/'} />} />
          </Switch>
        </Suspense>
      );
    } else {
      return (
        <Suspense fallback={<Spinner />}>
          <Switch>
            <Route path="/" exact children={<Home />} />
            <Route path="/home" exact children={<Home />} />
            <Route path="/profile" exact children={<Account />} />
            <Route path="/people" exact children={<People />} />
            <Route path="/farm" exact children={<Farm />} />
            <Route path="/consent" exact children={<ConsentForm />} />
            <Route path="/crop_catalogue" exact children={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" exact children={<CropVarieties />} />
            <Route path="/crop/:variety_id/detail" exact children={<CropDetail />} />
            <Route path="/crop/:variety_id/management" exact children={<CropManagement />} />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              exact
              children={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              exact
              children={<ManagementDetails />}
            />
            <Route
              path="/map"
              exact
              render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
            />
            <Route path="/farm_site_boundary/:location_id" children={<FarmSiteBoundaryDetails />} />
            <Route path="/barn/:location_id" children={<BarnDetails />} />
            <Route path="/natural_area/:location_id" children={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id" children={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id" children={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id" children={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id" children={<GardenDetails />} />
            <Route path="/greenhouse/:location_id" children={<GreenhouseDetails />} />
            <Route path="/field/:location_id" children={<FieldDetails />} />
            <Route path="/gate/:location_id" children={<GateDetails />} />
            <Route path="/water_valve/:location_id" children={<WaterValveDetails />} />
            <Route path="/fence/:location_id" children={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id" children={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id" children={<WatercourseDetails />} />
            <Route path="/sensor/:location_id" children={<SensorDetails />} />
            <Route path="/farm_selection" exact children={<ChooseFarm />} />
            <Route path="/insights" exact children={<Insights />} />
            <Route path="/insights/soilom" exact children={<SoilOM />} />
            <Route path="/insights/labourhappiness" exact children={<LabourHappiness />} />
            <Route path="/insights/biodiversity" exact children={<Biodiversity />} />
            <Route path="/insights/prices" exact children={<Prices />} />
            <Route path="/callback" children={<Callback />} />
            <Route path="/accept_invitation/sign_up" children={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              children={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" children={<PasswordResetAccount />} />
            <Route path={'/expired'} children={<ExpiredTokenScreen />} />
            <Route path="/tasks" exact children={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" exact children={<TaskReadOnly />} />
            <Route path="/tasks/:task_id/abandon" exact children={<TaskAbandon />} />
            <Route path="/tasks/:task_id/complete" exact children={<TaskComplete />} />
            <Route
              path="/tasks/:task_id/before_complete"
              exact
              children={<TaskCompleteStepOne />}
            />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              exact
              children={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" exact children={<HarvestUses />} />
            <Route path="/add_task/task_locations" exact children={<TaskLocations />} />
            <Route path="/add_task/task_date" exact children={<TaskDate />} />
            <Route path="/add_task/task_assignment" exact children={<TaskAssignment />} />
            <Route path="/add_task/task_details" exact children={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" exact children={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" exact children={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" exact children={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" exact children={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" exact children={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" exact children={<EditCustomTask />} />
            <Route
              path="/add_task/edit_custom_task_update"
              exact
              children={<EditCustomTaskUpdate />}
            />
            <Route path="/add_task/planting_method" exact children={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" exact children={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" exact children={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" exact children={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" exact children={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" exact children={<TaskRowGuidance />} />
            <Route path="/notifications" exact children={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              exact
              children={<NotificationReadOnly />}
            />
            <Route
              path="/animals/*"
              exact
              render={(props) => (
                <Animals
                  isCompactSideMenu={isCompactSideMenu}
                  setFeedbackSurveyOpen={setFeedbackSurveyOpen}
                  {...props}
                />
              )}
            />
            <Route path="/unknown_record" exact children={<UnknownRecord />} />
            <Route render={() => <Redirect to={'/consent'} />} />
          </Switch>
        </Suspense>
      );
    }
  } else if (!isAuthenticated()) {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route path={'/render_survey'} exact children={<RenderSurvey />} />
          <Route path="/callback" children={<Callback />} />
          <Route path="/accept_invitation/sign_up" children={<InviteSignUp />} />
          <Route path="/accept_invitation/create_account" children={<InvitedUserCreateAccount />} />
          <Route path="/password_reset" children={<PasswordResetAccount />} />
          <Route path={'/expired'} children={<ExpiredTokenScreen />} />
          <Route path="/" exact children={<CustomSignUp />} />
          <Route
            //TODO: change to 404
            render={() => <Redirect to={'/'} />}
          />
        </Switch>
      </Suspense>
    );
  }
};

export default Routes;
