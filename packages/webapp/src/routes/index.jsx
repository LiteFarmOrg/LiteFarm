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
import { Navigate, Route, Routes } from 'react-router-dom';
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

import {
  ADD_SENSORS_URL,
  IRRIGATION_PRESCRIPTION_URL,
  PRODUCT_INVENTORY_URL,
  SENSORS_URL,
} from '../util/siteMapConstants';

//dynamic imports
const Home = React.lazy(() => import('../containers/Home'));
const Account = React.lazy(() => import('../containers/Profile/Account'));
const FarmSettings = React.lazy(() => import('./FarmSettingsRoutes'));
const People = React.lazy(() => import('../containers/Profile/People/People'));
const EditUser = React.lazy(() => import('../containers/Profile/EditUser'));
const ConsentForm = React.lazy(() => import('../containers/Consent'));
const Finances = React.lazy(() => import('./FinancesRoutes'));
const Animals = React.lazy(() => import('./AnimalsRoutes'));
const ProductInventory = React.lazy(() => import('../containers/ProductInventory'));
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
const PostFarmSiteBoundaryForm = React.lazy(() =>
  import(
    '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/PostFarmSiteBoundary'
  ),
);
const FarmSiteBoundaryDetails = React.lazy(() => import('./FarmSiteBoundaryDetailsRoutes'));

const PostFieldForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/FieldDetailForm/PostField'),
);
const FieldDetails = React.lazy(() => import('./FieldDetailsRoutes'));

const PostGardenForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/GardenDetailForm/PostGarden'),
);
const GardenDetails = React.lazy(() => import('./GardenDetailsRoutes'));

const PostGateForm = React.lazy(() =>
  import('../containers/LocationDetails/PointDetails/GateDetailForm/PostGate'),
);
const GateDetails = React.lazy(() => import('./GateDetailsRoutes'));

const PostWaterValveForm = React.lazy(() =>
  import('../containers/LocationDetails/PointDetails/WaterValveDetailForm/PostWaterValve'),
);
const WaterValveDetails = React.lazy(() => import('./WaterValveDetailsRoutes'));

const PostSoilSampleLocationForm = React.lazy(() =>
  import(
    '../containers/LocationDetails/PointDetails/SoilSampleLocationDetailForm/PostSoilSampleLocation'
  ),
);

const SoilSampleLocationDetails = React.lazy(() => import('./SoilSampleLocationDetailsRoutes'));

const PostBarnForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/BarnDetailForm/PostBarn'),
);
const BarnDetails = React.lazy(() => import('./BarnDetailsRoutes'));

const PostNaturalAreaForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/PostNaturalArea'),
);
const NaturalAreaDetails = React.lazy(() => import('./NaturalAreaDetailsRoutes'));

const PostSurfaceWaterForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/PostSurfaceWater'),
);
const SurfaceWaterDetails = React.lazy(() => import('./SurfaceWaterDetailsRoutes'));

const PostResidenceForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/ResidenceDetailForm/PostResidence'),
);
const ResidenceDetails = React.lazy(() => import('./ResidenceDetailsRoutes'));

const PostCeremonialForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/PostCeremonialArea'),
);
const CeremonialAreaDetails = React.lazy(() => import('./CeremonialAreaDetailsRoutes'));

const PostGreenhouseForm = React.lazy(() =>
  import('../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/PostGreenhouse'),
);
const GreenhouseDetails = React.lazy(() => import('./GreenhouseDetailsRoutes'));

const CropManagement = React.lazy(() => import('../containers/Crop/CropManagement'));
const CropDetail = React.lazy(() => import('../containers/Crop/CropDetail/index'));

const PostFenceForm = React.lazy(() =>
  import('../containers/LocationDetails/LineDetails/FenceDetailForm/PostFence'),
);
const FenceDetails = React.lazy(() => import('./FenceDetailsRoutes'));

const PostBufferZoneForm = React.lazy(() =>
  import('../containers/LocationDetails/LineDetails/BufferZoneDetailForm/PostBufferZone'),
);
const BufferZoneDetails = React.lazy(() => import('./BufferZoneDetailsRoutes'));

const PostWatercourseForm = React.lazy(() =>
  import('../containers/LocationDetails/LineDetails/WatercourseDetailForm/PostWatercourse'),
);
const WatercourseDetails = React.lazy(() => import('./WatercourseDetailsRoutes'));
const AddSensorsForm = React.lazy(() => import('../containers/AddSensors'));

const CropCatalogue = React.lazy(() => import('../containers/CropCatalogue'));
const CropVarieties = React.lazy(() => import('../containers/CropVarieties'));
const AddCrop = React.lazy(() => import('../containers/AddCropVariety/AddCropVariety'));
const EditCrop = React.lazy(() => import('../containers/EditCropVariety'));
const ComplianceInfo = React.lazy(() => import('../containers/AddCropVariety/ComplianceInfo'));
const AddNewCrop = React.lazy(() => import('../containers/AddNewCrop'));
const PlantingLocation = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/PlantingLocation'),
);
const Transplant = React.lazy(() => import('../containers/Crop/AddManagementPlan/Transplant'));
const PlantingDate = React.lazy(() => import('../containers/Crop/AddManagementPlan/PlantingDate'));
const PlantingMethod = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/PlantingMethod'),
);
const PlantInContainer = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/PlantInContainer'),
);
const PlantBroadcast = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/BroadcastPlan'),
);
const BedPlan = React.lazy(() => import('../containers/Crop/AddManagementPlan/BedPlan/BedPlan'));
const BedPlanGuidance = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/BedPlan/BedPlanGuidance'),
);
const ManagementPlanName = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/ManagementPlanName'),
);
const RowMethod = React.lazy(() => import('../containers/Crop/AddManagementPlan/RowMethod'));
const RowMethodGuidance = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/RowMethod/RowGuidance'),
);

const PlantedAlready = React.lazy(() =>
  import('../containers/Crop/AddManagementPlan/PlantedAlready'),
);

const Documents = React.lazy(() => import('../containers/Documents'));

const EditDocument = React.lazy(() => import('../containers/Documents/Edit'));

const AddDocument = React.lazy(() => import('../containers/Documents/Add'));
const MainDocument = React.lazy(() => import('../containers/Documents/Main'));
const CertificationReportingPeriod = React.lazy(() =>
  import('../containers/Certifications/ReportingPeriod'),
);
const CertificationSurvey = React.lazy(() => import('../containers/Certifications/Survey'));

const InterestedOrganic = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/InterestedOrganic/UpdateInterestedOrganic'),
);
const CertificationSelection = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/CertificationSelection/UpdateCertificationSelection'
  ),
);

const CertifierSelectionMenu = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/CertifierSelectionMenu/UpdateCertifierSelectionMenu'
  ),
);

const SetCertificationSummary = React.lazy(() =>
  import(
    '../containers/OrganicCertifierSurvey/SetCertificationSummary/UpdateSetCertificationSummary'
  ),
);

const RequestCertifier = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/RequestCertifier/UpdateRequestCertifier'),
);
const ViewCertification = React.lazy(() =>
  import('../containers/OrganicCertifierSurvey/ViewCertification/ViewCertification'),
);

const RenderSurvey = React.lazy(() => import('../containers/RenderSurvey/RenderSurvey'));
const ExportDownload = React.lazy(() => import('../containers/ExportDownload'));

const ManagementTasks = React.lazy(() =>
  import('../containers/Crop/ManagementDetail/ManagementTasks'),
);
const ManagementDetails = React.lazy(() =>
  import('../containers/Crop/ManagementDetail/ManagementDetails'),
);
const EditManagementDetails = React.lazy(() =>
  import('../containers/Crop/ManagementDetail/EditManagementDetails'),
);
const CompleteManagementPlan = React.lazy(() =>
  import('../containers/Crop/CompleteManagementPlan/CompleteManagementPlan'),
);
const AbandonManagementPlan = React.lazy(() =>
  import('../containers/Crop/CompleteManagementPlan/AbandonManagementPlan'),
);
const RepeatCropPlan = React.lazy(() => import('../containers/Crop/RepeatCropPlan'));
const RepeatCropPlanConfirmation = React.lazy(() =>
  import('../containers/Crop/RepeatCropPlan/Confirmation'),
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
const HarvestCompleteQuantity = React.lazy(() =>
  import('../containers/Task/TaskComplete/HarvestComplete/Quantity'),
);
const HarvestUses = React.lazy(() =>
  import('../containers/Task/TaskComplete/HarvestComplete/HarvestUses'),
);
const TaskCompleteStepOne = React.lazy(() => import('../containers/Task/TaskComplete/StepOne'));
const TaskReadOnly = React.lazy(() => import('../containers/Task/TaskReadOnly'));
const EditCustomTask = React.lazy(() => import('../containers/Task/EditCustomTask'));
const TaskAbandon = React.lazy(() => import('../containers/Task/TaskAbandon'));
// const EditCustomTaskUpdate = React.lazy(() => import('../containers/Task/EditCustomTaskUpdate'));
const TaskTransplantMethod = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskTransplantMethod'),
);
const TaskBedMethod = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskBedMethod'),
);
const TaskBedGuidance = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskBedGuidance'),
);
const TaskRowMethod = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskRowMethod'),
);
const TaskRowGuidance = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskRowGuidance'),
);
const TaskContainerMethod = React.lazy(() =>
  import('../containers/Task/TaskTransplantMethod/TaskContainerMethod'),
);
const SensorList = React.lazy(() => import('../containers/SensorList'));
const SensorReadings = React.lazy(() => import('../containers/SensorReadings/v2'));
const IrrigationPrescription = React.lazy(() => import('../containers/IrrigationPrescription'));
const Notification = React.lazy(() => import('../containers/Notification'));
const NotificationReadOnly = React.lazy(() =>
  import('../containers/Notification/NotificationReadOnly'),
);
const UnknownRecord = React.lazy(() =>
  import('../containers/ErrorHandler/UnknownRecord/UnknownRecord'),
);

const RoutesComponent = ({ isCompactSideMenu }) => {
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

  const Element = () => {
    if (isAuthenticated()) {
      role_id = Number(role_id);
      if (isInvitationFlow) {
        return (
          <Routes>
            <Route
              path="/farm_selection"
              element={has_consent ? <ChooseFarm /> : <Navigate to="/consent" />}
            />
            <Route
              path="/consent"
              element={<ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
            />
            <Route
              path="/outro"
              element={has_consent ? <JoinFarmSuccessScreen /> : <Navigate to="/consent" />}
            />
          </Routes>
        );
      } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
        return <OnboardingFlow {...userFarm} />;
      } else if (!has_consent) {
        return (
          <Routes>
            <Route path="/farm_selection" element={<ChooseFarm />} />
            <Route path="/consent" element={<ConsentForm goForwardTo={'/'} goBackTo={null} />} />
            <Route path="*" element={<Navigate to="/consent" />} />
          </Routes>
        );
      } else if (role_id === 1) {
        return (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/people" element={<People />} />
            <Route path="/farm_settings/*" element={<FarmSettings />} />
            <Route path="/user/:user_id" element={<EditUser />} />
            <Route path="/consent" element={<ConsentForm />} />
            <Route path="/crop/new" element={<AddNewCrop />} />
            <Route path="/crop/:crop_id/add_crop_variety" element={<AddCrop />} />
            <Route path="/crop/:crop_id/add_crop_variety/compliance" element={<ComplianceInfo />} />
            <Route path="/crop/:variety_id/detail" element={<CropDetail />} />
            <Route path="/crop/:variety_id/management" element={<CropManagement />} />
            <Route path="/crop/:variety_id/edit_crop_variety" element={<EditCrop />} />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              element={<PlantedAlready />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              element={<Transplant />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              element={<PlantingDate />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              element={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              element={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              element={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              element={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              element={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              element={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              element={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              element={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              element={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              element={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              element={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              element={<PlantInContainer />}
            />
            <Route path="/crop/:variety_id/add_management_plan/bed_method" element={<BedPlan />} />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              element={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              element={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              element={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              element={<ManagementPlanName />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              element={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              element={<ManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              element={<RepeatCropPlan />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              element={<RepeatCropPlanConfirmation />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              element={<EditManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              element={<CompleteManagementPlan />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              element={<AbandonManagementPlan />}
            />
            <Route path="/crop_catalogue" element={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" element={<CropVarieties />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/add_document" element={<AddDocument />} />
            <Route path="/documents/:document_id/edit_document" element={<EditDocument />} />
            <Route path="/documents/:document_id" element={<MainDocument />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" element={<TaskReadOnly />} />
            <Route path="/tasks/:task_id/complete" element={<TaskComplete />} />
            <Route path="/tasks/:task_id/before_complete" element={<TaskCompleteStepOne />} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              element={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" element={<HarvestUses />} />
            <Route path="/tasks/:task_id/abandon" element={<TaskAbandon />} />
            <Route path="/map" element={<Map isCompactSideMenu={isCompactSideMenu} />} />
            <Route path="/map/videos" element={<MapVideo />} />
            <Route
              path="/create_location/farm_site_boundary"
              element={<PostFarmSiteBoundaryForm />}
            />
            <Route path="/create_location/barn" element={<PostBarnForm />} />
            <Route path="/create_location/natural_area" element={<PostNaturalAreaForm />} />
            <Route path="/create_location/surface_water" element={<PostSurfaceWaterForm />} />
            <Route path="/create_location/residence" element={<PostResidenceForm />} />
            <Route path="/create_location/ceremonial_area" element={<PostCeremonialForm />} />
            <Route path="/create_location/garden" element={<PostGardenForm />} />
            <Route path="/create_location/greenhouse" element={<PostGreenhouseForm />} />
            <Route path="/create_location/field" element={<PostFieldForm />} />
            <Route path="/create_location/gate" element={<PostGateForm />} />
            <Route path="/create_location/water_valve" element={<PostWaterValveForm />} />
            <Route
              path="/create_location/soil_sample_location"
              element={<PostSoilSampleLocationForm />}
            />
            <Route path="/create_location/fence" element={<PostFenceForm />} />
            <Route path="/create_location/buffer_zone" element={<PostBufferZoneForm />} />
            <Route path="/create_location/watercourse" element={<PostWatercourseForm />} />
            <Route
              path={ADD_SENSORS_URL}
              element={<AddSensorsForm isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path="/farm_site_boundary/:location_id/*"
              element={<FarmSiteBoundaryDetails />}
            />
            <Route path="/barn/:location_id/*" element={<BarnDetails />} />
            <Route path="/natural_area/:location_id/*" element={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id/*" element={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id/*" element={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id/*" element={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id/*" element={<GardenDetails />} />
            <Route path="/greenhouse/:location_id/*" element={<GreenhouseDetails />} />
            <Route path="/field/:location_id/*" element={<FieldDetails />} />
            <Route path="/gate/:location_id/*" element={<GateDetails />} />
            <Route path="/water_valve/:location_id/*" element={<WaterValveDetails />} />
            <Route
              path="/soil_sample_location/:location_id/*"
              element={<SoilSampleLocationDetails />}
            />
            <Route path="/fence/:location_id/*" element={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id/*" element={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id/*" element={<WatercourseDetails />} />
            <Route path="/sensor/:id" element={<SensorReadings type={'sensor'} />} />
            <Route path="/sensor_array/:id" element={<SensorReadings type={'sensor_array'} />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/soilom" element={<SoilOM />} />
            <Route path="/insights/labourhappiness" element={<LabourHappiness />} />
            <Route path="/insights/biodiversity" element={<Biodiversity />} />
            <Route path="/insights/prices" element={<Prices />} />
            <Route path="/farm_selection" element={<ChooseFarm />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              element={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" element={<PasswordResetAccount />} />
            <Route path={'/expired'} element={<ExpiredTokenScreen />} />
            <Route path="/invite_user" element={<InviteUser />} />
            <Route path="/certification" element={<ViewCertification />} />
            <Route path="/certification/report_period" element={<CertificationReportingPeriod />} />
            <Route path="/certification/survey" element={<CertificationSurvey />} />
            <Route path="/certification/interested_in_organic" element={<InterestedOrganic />} />
            <Route path="/certification/selection" element={<CertificationSelection />} />
            <Route path="/certification/certifier/selection" element={<CertifierSelectionMenu />} />
            <Route path="/certification/certifier/request" element={<RequestCertifier />} />
            <Route path="/certification/summary" element={<SetCertificationSummary />} />
            <Route path="/export/:id/from/:from/to/:to" element={<ExportDownload />} />
            <Route path="/add_task/task_locations" element={<TaskLocations />} />
            <Route path="/add_task/task_date" element={<TaskDate />} />
            <Route path="/add_task/task_assignment" element={<TaskAssignment />} />
            <Route path="/add_task/task_details" element={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" element={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" element={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" element={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" element={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" element={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" element={<EditCustomTask />} />
            {/* <Route
                      path="/add_task/edit_custom_task_update"
                      
                      element={<EditCustomTaskUpdate />}
                    /> */}
            <Route path="/add_task/planting_method" element={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" element={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" element={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" element={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" element={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" element={<TaskRowGuidance />} />
            <Route path="/notifications" element={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              element={<NotificationReadOnly />}
            />
            <Route path="/finances/*" element={<Finances />} />
            <Route path="/animals/*" element={<Animals isCompactSideMenu={isCompactSideMenu} />} />
            <Route
              path={PRODUCT_INVENTORY_URL}
              element={<ProductInventory isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={SENSORS_URL}
              element={<SensorList isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={`${IRRIGATION_PRESCRIPTION_URL}/:ip_pk`}
              element={<IrrigationPrescription isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route path="/unknown_record" element={<UnknownRecord />} />
            <Route
              path="*"
              //TODO change to 404
              element={<Navigate to={'/'} />}
            />
          </Routes>
        );
      } else if (role_id === 2 || role_id === 5) {
        return (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/people" element={<People />} />
            <Route path="/user/:user_id" element={<EditUser />} />
            <Route path="/farm_settings" element={<FarmSettings />} />
            <Route path="/consent" element={<ConsentForm />} />
            <Route path="/crop/new" element={<AddNewCrop />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" element={<TaskReadOnly />} />
            <Route
              path="/crop/:variety_id/add_management_plan/planted_already"
              element={<PlantedAlready />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/needs_transplant"
              element={<Transplant />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/plant_date"
              element={<PlantingDate />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
              element={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
              element={<PlantingLocation />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/final_planting_method"
              element={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_planting_method"
              element={<PlantingMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
              element={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_container_method"
              element={<PlantInContainer />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_method"
              element={<BedPlan />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
              element={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_method"
              element={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/initial_row_guidance"
              element={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/broadcast_method"
              element={<PlantBroadcast />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/container_method"
              element={<PlantInContainer />}
            />
            <Route path="/crop/:variety_id/add_management_plan/bed_method" element={<BedPlan />} />
            <Route
              path="/crop/:variety_id/add_management_plan/bed_guidance"
              element={<BedPlanGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_method"
              element={<RowMethod />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/row_guidance"
              element={<RowMethodGuidance />}
            />
            <Route
              path="/crop/:variety_id/add_management_plan/name"
              element={<ManagementPlanName />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              element={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              element={<ManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/edit"
              element={<EditManagementDetails />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
              element={<RepeatCropPlan />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
              element={<RepeatCropPlanConfirmation />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/complete_management_plan"
              element={<CompleteManagementPlan />}
            />
            <Route
              path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
              element={<AbandonManagementPlan />}
            />
            <Route path="/crop_catalogue" element={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" element={<CropVarieties />} />
            <Route path="/crop/:variety_id/detail" element={<CropDetail />} />
            <Route path="/crop/:variety_id/management" element={<CropManagement />} />
            <Route path="/crop/:variety_id/edit_crop_variety" element={<EditCrop />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/add_document" element={<AddDocument />} />
            <Route path="/documents/:document_id/edit_document" element={<EditDocument />} />
            <Route path="/documents/:document_id" element={<MainDocument />} />
            <Route path="/map" element={<Map isCompactSideMenu={isCompactSideMenu} />} />
            <Route path="/map/videos" element={<MapVideo />} />
            <Route
              path="/create_location/farm_site_boundary"
              element={<PostFarmSiteBoundaryForm />}
            />
            <Route path="/create_location/barn" element={<PostBarnForm />} />
            <Route path="/create_location/natural_area" element={<PostNaturalAreaForm />} />
            <Route path="/create_location/surface_water" element={<PostSurfaceWaterForm />} />
            <Route path="/create_location/residence" element={<PostResidenceForm />} />
            <Route path="/create_location/ceremonial_area" element={<PostCeremonialForm />} />
            <Route path="/create_location/garden" element={<PostGardenForm />} />
            <Route path="/create_location/greenhouse" element={<PostGreenhouseForm />} />
            <Route path="/create_location/field" element={<PostFieldForm />} />
            <Route path="/create_location/gate" element={<PostGateForm />} />
            <Route path="/create_location/water_valve" element={<PostWaterValveForm />} />
            <Route
              path="/create_location/soil_sample_location"
              element={<PostSoilSampleLocationForm />}
            />
            <Route path="/create_location/fence" element={<PostFenceForm />} />
            <Route path="/create_location/buffer_zone" element={<PostBufferZoneForm />} />
            <Route path="/create_location/watercourse" element={<PostWatercourseForm />} />
            <Route
              path={ADD_SENSORS_URL}
              element={<AddSensorsForm isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path="/farm_site_boundary/:location_id/*"
              element={<FarmSiteBoundaryDetails />}
            />
            <Route path="/barn/:location_id/*" element={<BarnDetails />} />
            <Route path="/natural_area/:location_id/*" element={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id/*" element={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id/*" element={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id/*" element={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id/*" element={<GardenDetails />} />
            <Route path="/greenhouse/:location_id/*" element={<GreenhouseDetails />} />
            <Route path="/field/:location_id/*" element={<FieldDetails />} />
            <Route path="/gate/:location_id/*" element={<GateDetails />} />
            <Route path="/water_valve/:location_id/*" element={<WaterValveDetails />} />
            <Route
              path="/soil_sample_location/:location_id/*"
              element={<SoilSampleLocationDetails />}
            />
            <Route path="/fence/:location_id/*" element={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id/*" element={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id/*" element={<WatercourseDetails />} />
            <Route path="/sensor/:id" element={<SensorReadings type={'sensor'} />} />
            <Route path="/sensor_array/:id" element={<SensorReadings type={'sensor_array'} />} />
            <Route path="/crop/:crop_id/add_crop_variety" element={<AddCrop />} />
            <Route path="/crop/:crop_id/add_crop_variety/compliance" element={<ComplianceInfo />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/soilom" element={<SoilOM />} />
            <Route path="/insights/labourhappiness" element={<LabourHappiness />} />
            <Route path="/insights/biodiversity" element={<Biodiversity />} />
            <Route path="/insights/prices" element={<Prices />} />
            <Route path="/farm_selection" element={<ChooseFarm />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              element={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" element={<PasswordResetAccount />} />
            <Route path={'/expired'} element={<ExpiredTokenScreen />} />
            <Route path="/invite_user" element={<InviteUser />} />
            <Route path="/certification" element={<ViewCertification />} />
            <Route path="/certification/report_period" element={<CertificationReportingPeriod />} />
            <Route path="/certification/survey" element={<CertificationSurvey />} />
            <Route path="/certification/interested_in_organic" element={<InterestedOrganic />} />
            <Route path="/certification/selection" element={<CertificationSelection />} />
            <Route path="/certification/certifier/selection" element={<CertifierSelectionMenu />} />
            <Route path="/certification/certifier/request" element={<RequestCertifier />} />
            <Route path="/certification/summary" element={<SetCertificationSummary />} />
            <Route path="/export/:id/from/:from/to/:to" element={<ExportDownload />} />
            <Route path="/tasks/:task_id/abandon" element={<TaskAbandon />} />
            <Route path="/tasks/:task_id/complete" element={<TaskComplete />} />
            <Route path="/tasks/:task_id/before_complete" element={<TaskCompleteStepOne />} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              element={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" element={<HarvestUses />} />
            <Route path="/add_task/task_locations" element={<TaskLocations />} />
            <Route path="/add_task/task_date" element={<TaskDate />} />
            <Route path="/add_task/task_assignment" element={<TaskAssignment />} />
            <Route path="/add_task/task_details" element={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" element={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" element={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" element={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" element={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" element={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" element={<EditCustomTask />} />
            {/* <Route
                      path="/add_task/edit_custom_task_update"
                      
                      element={<EditCustomTaskUpdate />}
                    /> */}
            <Route path="/add_task/planting_method" element={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" element={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" element={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" element={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" element={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" element={<TaskRowGuidance />} />
            <Route path="/notifications" element={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              element={<NotificationReadOnly />}
            />
            <Route path="/finances/*" element={<Finances />} />
            <Route path="/animals/*" element={<Animals isCompactSideMenu={isCompactSideMenu} />} />
            <Route
              path={PRODUCT_INVENTORY_URL}
              element={<ProductInventory isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={SENSORS_URL}
              element={<SensorList isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={`${IRRIGATION_PRESCRIPTION_URL}/:ip_pk`}
              element={<IrrigationPrescription isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route path="/unknown_record" element={<UnknownRecord />} />
            <Route path="*" element={<Navigate to={'/'} />} />
          </Routes>
        );
      } else {
        return (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/consent" element={<ConsentForm />} />
            <Route path="/crop_catalogue" element={<CropCatalogue />} />
            <Route path="/crop_varieties/crop/:crop_id" element={<CropVarieties />} />
            <Route path="/crop/:variety_id/detail" element={<CropDetail />} />
            <Route path="/crop/:variety_id/management" element={<CropManagement />} />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
              element={<ManagementTasks />}
            />
            <Route
              path="/crop/:variety_id/management_plan/:management_plan_id/details"
              element={<ManagementDetails />}
            />
            <Route path="/map" element={<Map isCompactSideMenu={isCompactSideMenu} />} />
            <Route
              path="/farm_site_boundary/:location_id/*"
              element={<FarmSiteBoundaryDetails />}
            />
            <Route path="/barn/:location_id/*" element={<BarnDetails />} />
            <Route path="/natural_area/:location_id/*" element={<NaturalAreaDetails />} />
            <Route path="/surface_water/:location_id/*" element={<SurfaceWaterDetails />} />
            <Route path="/residence/:location_id/*" element={<ResidenceDetails />} />
            <Route path="/ceremonial_area/:location_id/*" element={<CeremonialAreaDetails />} />
            <Route path="/garden/:location_id/*" element={<GardenDetails />} />
            <Route path="/greenhouse/:location_id/*" element={<GreenhouseDetails />} />
            <Route path="/field/:location_id/*" element={<FieldDetails />} />
            <Route path="/gate/:location_id/*" element={<GateDetails />} />
            <Route path="/water_valve/:location_id/*" element={<WaterValveDetails />} />
            <Route
              path="/soil_sample_location/:location_id/*"
              element={<SoilSampleLocationDetails />}
            />
            <Route path="/fence/:location_id/*" element={<FenceDetails />} />
            <Route path="/buffer_zone/:location_id/*" element={<BufferZoneDetails />} />
            <Route path="/watercourse/:location_id/*" element={<WatercourseDetails />} />
            <Route path="/sensor/:id" element={<SensorReadings type={'sensor'} />} />
            <Route path="/sensor_array/:id" element={<SensorReadings type={'sensor_array'} />} />
            <Route path="/farm_selection" element={<ChooseFarm />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/soilom" element={<SoilOM />} />
            <Route path="/insights/labourhappiness" element={<LabourHappiness />} />
            <Route path="/insights/biodiversity" element={<Biodiversity />} />
            <Route path="/insights/prices" element={<Prices />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
            <Route
              path="/accept_invitation/create_account"
              element={<InvitedUserCreateAccount />}
            />
            <Route path="/password_reset" element={<PasswordResetAccount />} />
            <Route path={'/expired'} element={<ExpiredTokenScreen />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:task_id/read_only" element={<TaskReadOnly />} />
            <Route path="/tasks/:task_id/abandon" element={<TaskAbandon />} />
            <Route path="/tasks/:task_id/complete" element={<TaskComplete />} />
            <Route path="/tasks/:task_id/before_complete" element={<TaskCompleteStepOne />} />
            <Route
              path="/tasks/:task_id/complete_harvest_quantity"
              element={<HarvestCompleteQuantity />}
            />
            <Route path="/tasks/:task_id/harvest_uses" element={<HarvestUses />} />
            <Route path="/add_task/task_locations" element={<TaskLocations />} />
            <Route path="/add_task/task_date" element={<TaskDate />} />
            <Route path="/add_task/task_assignment" element={<TaskAssignment />} />
            <Route path="/add_task/task_details" element={<TaskDetails />} />
            <Route path="/add_task/task_type_selection" element={<TaskTypeSelection />} />
            <Route path="/add_task/task_crops" element={<TaskCrops />} />
            <Route path="/add_task/task_animal_selection" element={<TaskAnimals />} />
            <Route path="/add_task/manage_custom_tasks" element={<ManageCustomTasks />} />
            <Route path="/add_task/add_custom_task" element={<AddCustomTask />} />
            <Route path="/add_task/edit_custom_task" element={<EditCustomTask />} />
            {/* <Route
                      path="/add_task/edit_custom_task_update"
                      
                      element={<EditCustomTaskUpdate />}
                    /> */}
            <Route path="/add_task/planting_method" element={<TaskTransplantMethod />} />
            <Route path="/add_task/bed_method" element={<TaskBedMethod />} />
            <Route path="/add_task/bed_guidance" element={<TaskBedGuidance />} />
            <Route path="/add_task/container_method" element={<TaskContainerMethod />} />
            <Route path="/add_task/row_method" element={<TaskRowMethod />} />
            <Route path="/add_task/row_guidance" element={<TaskRowGuidance />} />
            <Route path="/notifications" element={<Notification />} />
            <Route
              path="/notifications/:notification_id/read_only"
              element={<NotificationReadOnly />}
            />
            <Route path="/animals/*" element={<Animals isCompactSideMenu={isCompactSideMenu} />} />
            <Route
              path={PRODUCT_INVENTORY_URL}
              element={<ProductInventory isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={SENSORS_URL}
              element={<SensorList isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route
              path={`${IRRIGATION_PRESCRIPTION_URL}/:ip_pk`}
              element={<IrrigationPrescription isCompactSideMenu={isCompactSideMenu} />}
            />
            <Route path="/unknown_record" element={<UnknownRecord />} />
            <Route path="*" element={<Navigate to={'/'} />} />
          </Routes>
        );
      }
    } else if (!isAuthenticated()) {
      return (
        <Routes>
          <Route path={'/render_survey'} element={<RenderSurvey />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
          <Route path="/accept_invitation/create_account" element={<InvitedUserCreateAccount />} />
          <Route path="/password_reset" element={<PasswordResetAccount />} />
          <Route path={'/expired'} element={<ExpiredTokenScreen />} />
          <Route path="/" element={<CustomSignUp />} />
          <Route
            path="*"
            //TODO change to 404
            element={<Navigate to={'/'} />}
          />
        </Routes>
      );
    }
  };

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="*" element={<Element />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
