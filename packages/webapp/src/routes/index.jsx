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

import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import Spinner from '../components/Spinner';

// Components that have already been set up with code splitting
import OnboardingFlow from './Onboarding';
import CustomSignUp from '../containers/CustomSignUp';
import { useSelector } from 'react-redux';
import { isAuthenticated } from '../util/jwt';

// action
import { userFarmLengthSelector, userFarmSelector } from '../containers/userFarmSlice';
import { chooseFarmFlowSelector } from '../containers/ChooseFarm/chooseFarmFlowSlice';
import useScrollToTop from '../containers/hooks/useScrollToTop';
import { useReduxSnackbar } from '../containers/Snackbar/useReduxSnackbar';
import { hookFormPersistSelector } from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import { useLocalStorage } from 'usehooks-ts';

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

const RoleSelection = React.lazy(() => import('../containers/RoleSelection'));
const Outro = React.lazy(() => import('../containers/Outro'));
const WelcomeScreen = React.lazy(() => import('../containers/WelcomeScreen'));
const AddFarm = React.lazy(() => import('../containers/AddFarm'));

const AllRoutes = ({ isCompactSideMenu, isFeedbackSurveyOpen, setFeedbackSurveyOpen }) => {
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
  const hasUserFarms = useSelector(userFarmLengthSelector);
  const { interested } = useSelector(
    hookFormPersistSelector,
    (pre, next) => pre.interested === next.interested,
  );
  const { isInvitationFlow } = useSelector(
    chooseFarmFlowSelector,
    (pre, next) => pre.isInvitationFlow === next.isInvitationFlow,
  );
  let {
    step_one,
    step_two,
    step_three,
    step_four,
    step_five,
    has_consent,
    role_id,
    status,
    farm_id,
  } = userFarm;
  const hasSelectedFarm = !!farm_id;
  const hasFinishedOnBoardingFlow = step_one && step_four && step_five;
  const isOnboardingFlow = !hasSelectedFarm || !hasFinishedOnBoardingFlow;
  const [auth, setAuth, removeAuth] = useLocalStorage('id_token');

  const AuthWrapper = ({ auth }) => {
    return auth ? <Outlet /> : <Navigate to="/" />;
  };

  // const AuthenticatedRoutes = ({isInvitationFlow, isOnboardingFlow, userFarm}) => {
  //   //role_id = Number(role_id);
  //   let { step_one, step_two, step_three, step_four, step_five, has_consent, role_id, status, farm_id } = userFarm;
  //   return (
  //     <>
  //     <Routes>
  //       {isInvitationFlow && <Route path="/farm_selection" element={<ChooseFarm />} />}
  //       {isOnboardingFlow && <Route path="/farm_selection" element={<ChooseFarm />} />}
  //       {isOnboardingFlow && <Route path="/welcome" element={<WelcomeScreen />} />}
  //       {isOnboardingFlow && <Route path="/add_farm" element={<AddFarm />} />}
  //       {isOnboardingFlow && step_one && <Route path="/role_selection" element={<RoleSelection />} />}
  //       {isInvitationFlow && <Route path="/consent" element={<ConsentForm goForwardTo={'/outro'} goBackTo={null} />}/>}
  //       {isOnboardingFlow && ((step_two && !step_five) || (step_five && !has_consent)) && <Route path="/consent" element={<ConsentForm
  //           goForwardTo={(step_two && !step_five) ? undefined : (step_five && !has_consent) ? '/' : '/outro'}
  //           goBackTo={(step_two && !step_five) ? undefined : (step_five && !has_consent) ? '/farm_selection' : null}
  //         />}/>}
  //       {isOnboardingFlow && step_three && <Route path="/certification/interested_in_organic" element={<InterestedOrganic />} /> }
  //       {isOnboardingFlow && (step_four || interested) && <Route path="/certification">
  //           <Route path="/selection" element={<CertificationSelection />} />
  //           <Route path="/certifier/selection" element={<CertifierSelectionMenu />} />
  //           <Route path="/certifier/request" element={<RequestCertifier />} />
  //           <Route path="/summary" element={<SetCertificationSummary />} />
  //         </Route>
  //       }
  //       {isInvitationFlow && <Route path="/outro" element={<JoinFarmSuccessScreen />} />}
  //       {isOnboardingFlow && step_four && <Route path="/outro"  element={<Outro />} />}
  //     </Routes>
  //     <Outlet />
  //     </>
  //   );

  //   // // TODO check every step
  //   // if (isInvitationFlow) {
  //   //   return (
  //   //     <Routes>
  //   //       <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //       <Route path="/consent" exact>
  //   //         <ConsentForm goForwardTo={'/outro'} goBackTo={null} />
  //   //       </Route>
  //   //       <Route path="/outro" exact element={<JoinFarmSuccessScreen />} />
  //   //       {!has_consent && <Route render={() => <Navigate to={'/consent'} />} />}
  //   //     </Routes>
  //   //   );
  //   // } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
  //   //   return <OnboardingFlow {...userFarm} />;
  //   // } else if (!has_consent) {
  //   //   return (
  //   //     <Suspense fallback={<Spinner />}>
  //   //       <Routes>
  //   //         <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //         <Route path="/consent" exact>
  //   //           <ConsentForm goForwardTo={'/'} goBackTo={null} />
  //   //         </Route>
  //   //         {!has_consent && <Route render={() => <Navigate to={'/consent'} />} />}
  //   //       </Routes>
  //   //     </Suspense>
  //   //   );
  //   // } else if (role_id === 1) {
  //   //   return (
  //   //     <Suspense fallback={<Spinner />}>
  //   //       <Routes>
  //   //         <Route path="/" exact element={<Home />} />
  //   //         <Route path="/home" exact element={<Home />} />
  //   //         <Route path="/profile" exact element={<Account />} />
  //   //         <Route path="/people" exact element={<People />} />
  //   //         <Route path="/farm" exact element={<Farm />} />
  //   //         <Route path="/user/:user_id" exact element={<EditUser />} />
  //   //         <Route path="/consent" exact element={<ConsentForm />} />
  //   //         <Route path="/crop/new" exact element={<AddNewCrop />} />
  //   //         <Route path="/crop/:crop_id/add_crop_variety" exact element={<AddCrop />} />
  //   //         <Route
  //   //           path="/crop/:crop_id/add_crop_variety/compliance"
  //   //           exact
  //   //           element={<ComplianceInfo />}
  //   //         />
  //   //         <Route path="/crop/:variety_id/detail" exact element={<CropDetail />} />
  //   //         <Route path="/crop/:variety_id/management" exact element={<CropManagement />} />
  //   //         <Route path="/crop/:variety_id/edit_crop_variety" exact element={<EditCrop />} />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/planted_already"
  //   //           exact
  //   //           element={<PlantedAlready />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/needs_transplant"
  //   //           exact
  //   //           element={<Transplant />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/plant_date"
  //   //           exact
  //   //           element={<PlantingDate />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
  //   //           exact
  //   //           element={<PlantingLocation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
  //   //           exact
  //   //           element={<PlantingLocation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/final_planting_method"
  //   //           exact
  //   //           element={<PlantingMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_planting_method"
  //   //           exact
  //   //           element={<PlantingMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
  //   //           exact
  //   //           element={<PlantBroadcast />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_container_method"
  //   //           exact
  //   //           element={<PlantInContainer />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_bed_method"
  //   //           exact
  //   //           element={<BedPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
  //   //           exact
  //   //           element={<BedPlanGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_row_method"
  //   //           exact
  //   //           element={<RowMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_row_guidance"
  //   //           exact
  //   //           element={<RowMethodGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/broadcast_method"
  //   //           exact
  //   //           element={<PlantBroadcast />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/container_method"
  //   //           exact
  //   //           element={<PlantInContainer />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/bed_method"
  //   //           exact
  //   //           element={<BedPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/bed_guidance"
  //   //           exact
  //   //           element={<BedPlanGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/row_method"
  //   //           exact
  //   //           element={<RowMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/row_guidance"
  //   //           exact
  //   //           element={<RowMethodGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/name"
  //   //           exact
  //   //           element={<ManagementPlanName />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
  //   //           exact
  //   //           element={<ManagementTasks />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/details"
  //   //           exact
  //   //           element={<ManagementDetails />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
  //   //           exact
  //   //           element={<RepeatCropPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
  //   //           exact
  //   //           element={<RepeatCropPlanConfirmation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/edit"
  //   //           exact
  //   //           element={<EditManagementDetails />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/:management_plan_id/complete_management_plan"
  //   //           exact
  //   //           element={<CompleteManagementPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
  //   //           exact
  //   //           element={<AbandonManagementPlan />}
  //   //         />
  //   //         <Route path="/crop_catalogue" exact element={<CropCatalogue />} />
  //   //         <Route path="/crop_varieties/crop/:crop_id" exact element={<CropVarieties />} />
  //   //         <Route path="/documents" exact element={<Documents />} />
  //   //         <Route path="/documents/add_document" exact element={<AddDocument />} />
  //   //         <Route
  //   //           path="/documents/:document_id/edit_document"
  //   //           exact
  //   //           element={<EditDocument />}
  //   //         />
  //   //         <Route path="/documents/:document_id" exact element={<MainDocument />} />
  //   //         <Route path="/tasks" exact element={<Tasks />} />
  //   //         <Route path="/tasks/:task_id/read_only" exact element={<TaskReadOnly />} />
  //   //         <Route path="/tasks/:task_id/complete" exact element={<TaskComplete />} />
  //   //         <Route
  //   //           path="/tasks/:task_id/before_complete"
  //   //           exact
  //   //           element={<TaskCompleteStepOne />}
  //   //         />
  //   //         <Route
  //   //           path="/tasks/:task_id/complete_harvest_quantity"
  //   //           exact
  //   //           element={<HarvestCompleteQuantity />}
  //   //         />
  //   //         <Route path="/tasks/:task_id/harvest_uses" exact element={<HarvestUses />} />
  //   //         <Route path="/tasks/:task_id/abandon" exact element={<TaskAbandon />} />
  //   //         <Route
  //   //           path="/map"
  //   //           exact
  //   //           render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
  //   //         />
  //   //         <Route path="/map/videos" exact element={<MapVideo />} />
  //   //         <Route
  //   //           path="/create_location/farm_site_boundary"
  //   //           exact
  //   //           element={<PostFarmSiteBoundaryForm />}
  //   //         />
  //   //         <Route path="/create_location/barn" exact element={<PostBarnForm />} />
  //   //         <Route
  //   //           path="/create_location/natural_area"
  //   //           exact
  //   //           element={<PostNaturalAreaForm />}
  //   //         />
  //   //         <Route
  //   //           path="/create_location/surface_water"
  //   //           exact
  //   //           element={<PostSurfaceWaterForm />}
  //   //         />
  //   //         <Route path="/create_location/residence" exact element={<PostResidenceForm />} />
  //   //         <Route
  //   //           path="/create_location/ceremonial_area"
  //   //           exact
  //   //           element={<PostCeremonialForm />}
  //   //         />
  //   //         <Route path="/create_location/garden" exact element={<PostGardenForm />} />
  //   //         <Route
  //   //           path="/create_location/greenhouse"
  //   //           exact
  //   //           element={<PostGreenhouseForm />}
  //   //         />
  //   //         <Route path="/create_location/field" exact element={<PostFieldForm />} />
  //   //         <Route path="/create_location/gate" exact element={<PostGateForm />} />
  //   //         <Route
  //   //           path="/create_location/water_valve"
  //   //           exact
  //   //           element={<PostWaterValveForm />}
  //   //         />
  //   //         <Route path="/create_location/fence" exact element={<PostFenceForm />} />
  //   //         <Route
  //   //           path="/create_location/buffer_zone"
  //   //           exact
  //   //           element={<PostBufferZoneForm />}
  //   //         />
  //   //         <Route
  //   //           path="/create_location/watercourse"
  //   //           exact
  //   //           element={<PostWatercourseForm />}
  //   //         />
  //   //         <Route
  //   //           path="/farm_site_boundary/:location_id"
  //   //           element={<FarmSiteBoundaryDetails />}
  //   //         />
  //   //         <Route path="/barn/:location_id" element={<BarnDetails />} />
  //   //         <Route path="/natural_area/:location_id" element={<NaturalAreaDetails />} />
  //   //         <Route path="/surface_water/:location_id" element={<SurfaceWaterDetails />} />
  //   //         <Route path="/residence/:location_id" element={<ResidenceDetails />} />
  //   //         <Route
  //   //           path="/ceremonial_area/:location_id"
  //   //           element={<CeremonialAreaDetails />}
  //   //         />
  //   //         <Route path="/garden/:location_id" element={<GardenDetails />} />
  //   //         <Route path="/greenhouse/:location_id" element={<GreenhouseDetails />} />
  //   //         <Route path="/field/:location_id" element={<FieldDetails />} />
  //   //         <Route path="/gate/:location_id" element={<GateDetails />} />
  //   //         <Route path="/water_valve/:location_id" element={<WaterValveDetails />} />
  //   //         <Route path="/fence/:location_id" element={<FenceDetails />} />
  //   //         <Route path="/buffer_zone/:location_id" element={<BufferZoneDetails />} />
  //   //         <Route path="/watercourse/:location_id" element={<WatercourseDetails />} />
  //   //         <Route path="/sensor/:location_id" element={<SensorDetails />} />
  //   //         <Route path="/sensor/:location_id/edit" exact element={<EditSensor />} />
  //   //         <Route path="/insights" exact element={<Insights />} />
  //   //         <Route path="/insights/soilom" exact element={<SoilOM />} />
  //   //         <Route path="/insights/labourhappiness" exact element={<LabourHappiness />} />
  //   //         <Route path="/insights/biodiversity" exact element={<Biodiversity />} />
  //   //         <Route path="/insights/prices" exact element={<Prices />} />
  //   //         <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //         <Route path="/callback" setAuth={setAuth} element={<Callback />} />
  //   //         <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
  //   //         <Route
  //   //           path="/accept_invitation/create_account"
  //   //           element={<InvitedUserCreateAccount setAuth={setAuth} />}
  //   //         />
  //   //         <Route path="/password_reset" element={<PasswordResetAccount setAuth={setAuth}/>} />
  //   //         <Route path={'/expired'} element={<ExpiredTokenScreen />} />
  //   //         <Route path="/invite_user" exact element={<InviteUser />} />
  //   //         <Route path="/certification" exact element={<ViewCertification />} />
  //   //         <Route
  //   //           path="/certification/report_period"
  //   //           exact
  //   //           element={<CertificationReportingPeriod />}
  //   //         />
  //   //         <Route path="/certification/survey" exact element={<CertificationSurvey />} />
  //   //         <Route
  //   //           path="/certification/interested_in_organic"
  //   //           exact
  //   //           element={<InterestedOrganic />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/selection"
  //   //           exact
  //   //           element={<CertificationSelection />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/certifier/selection"
  //   //           exact
  //   //           element={<CertifierSelectionMenu />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/certifier/request"
  //   //           exact
  //   //           element={<RequestCertifier />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/summary"
  //   //           exact
  //   //           element={<SetCertificationSummary />}
  //   //         />
  //   //         <Route path="/export/:id/from/:from/to/:to" exact element={<ExportDownload />} />
  //   //         <Route path="/add_task/task_locations" exact element={<TaskLocations />} />
  //   //         <Route path="/add_task/task_date" exact element={<TaskDate />} />
  //   //         <Route path="/add_task/task_assignment" exact element={<TaskAssignment />} />
  //   //         <Route path="/add_task/task_details" exact element={<TaskDetails />} />
  //   //         <Route
  //   //           path="/add_task/task_type_selection"
  //   //           exact
  //   //           element={<TaskTypeSelection />}
  //   //         />
  //   //         <Route path="/add_task/task_crops" exact element={<TaskCrops />} />
  //   //         <Route path="/add_task/task_animal_selection" exact element={<TaskAnimals />} />
  //   //         <Route
  //   //           path="/add_task/manage_custom_tasks"
  //   //           exact
  //   //           element={<ManageCustomTasks />}
  //   //         />
  //   //         <Route path="/add_task/add_custom_task" exact element={<AddCustomTask />} />
  //   //         <Route path="/add_task/edit_custom_task" exact element={<EditCustomTask />} />
  //   //         <Route
  //   //           path="/add_task/edit_custom_task_update"
  //   //           exact
  //   //           element={<EditCustomTaskUpdate />}
  //   //         />
  //   //         <Route
  //   //           path="/add_task/planting_method"
  //   //           exact
  //   //           element={<TaskTransplantMethod />}
  //   //         />
  //   //         <Route path="/add_task/bed_method" exact element={<TaskBedMethod />} />
  //   //         <Route path="/add_task/bed_guidance" exact element={<TaskBedGuidance />} />
  //   //         <Route
  //   //           path="/add_task/container_method"
  //   //           exact
  //   //           element={<TaskContainerMethod />}
  //   //         />
  //   //         <Route path="/add_task/row_method" exact element={<TaskRowMethod />} />
  //   //         <Route path="/add_task/row_guidance" exact element={<TaskRowGuidance />} />
  //   //         <Route path="/notifications" exact element={<Notification />} />
  //   //         <Route
  //   //           path="/notifications/:notification_id/read_only"
  //   //           exact
  //   //           element={<NotificationReadOnly />}
  //   //         />
  //   //         <Route path="/finances/*" exact element={<Finances />} />
  //   //         <Route
  //   //           path="/animals/*"
  //   //           exact
  //   //           render={(props) => (
  //   //             <Animals
  //   //               isCompactSideMenu={isCompactSideMenu}
  //   //               setFeedbackSurveyOpen={setFeedbackSurveyOpen}
  //   //               {...props}
  //   //             />
  //   //           )}
  //   //         />
  //   //         <Route path="/unknown_record" exact element={<UnknownRecord />} />
  //   //         <Route
  //   //           // TODO: Change to 404
  //   //           render={() => <Navigate to={'/'} />}
  //   //         />
  //   //       </Routes>
  //   //     </Suspense>
  //   //   );
  //   // } else if (role_id === 2 || role_id === 5) {
  //   //   return (
  //   //     <Suspense fallback={<Spinner />}>
  //   //       <Routes>
  //   //         <Route path="/" exact element={<Home />} />
  //   //         <Route path="/home" exact element={<Home />} />
  //   //         <Route path="/profile" exact element={<Account />} />
  //   //         <Route path="/people" exact element={<People />} />
  //   //         <Route path="/user/:user_id" exact element={<EditUser />} />

  //   //         <Route path="/farm" exact element={<Farm />} />
  //   //         <Route path="/consent" exact element={<ConsentForm />} />
  //   //         <Route path="/crop/new" exact element={<AddNewCrop />} />
  //   //         <Route path="/tasks" exact element={<Tasks />} />
  //   //         <Route path="/tasks/:task_id/read_only" exact element={<TaskReadOnly />} />
  //   //         <Route
  //   //           path="/crop/:crop_id/add_crop_variety/compliance"
  //   //           exact
  //   //           element={<ComplianceInfo />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/planted_already"
  //   //           exact
  //   //           element={<PlantedAlready />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/needs_transplant"
  //   //           exact
  //   //           element={<Transplant />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/plant_date"
  //   //           exact
  //   //           element={<PlantingDate />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/choose_initial_planting_location"
  //   //           exact
  //   //           element={<PlantingLocation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/choose_final_planting_location"
  //   //           exact
  //   //           element={<PlantingLocation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/final_planting_method"
  //   //           exact
  //   //           element={<PlantingMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_planting_method"
  //   //           exact
  //   //           element={<PlantingMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_broadcast_method"
  //   //           exact
  //   //           element={<PlantBroadcast />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_container_method"
  //   //           exact
  //   //           element={<PlantInContainer />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_bed_method"
  //   //           exact
  //   //           element={<BedPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_bed_guidance"
  //   //           exact
  //   //           element={<BedPlanGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_row_method"
  //   //           exact
  //   //           element={<RowMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/initial_row_guidance"
  //   //           exact
  //   //           element={<RowMethodGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/broadcast_method"
  //   //           exact
  //   //           element={<PlantBroadcast />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/container_method"
  //   //           exact
  //   //           element={<PlantInContainer />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/bed_method"
  //   //           exact
  //   //           element={<BedPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/bed_guidance"
  //   //           exact
  //   //           element={<BedPlanGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/row_method"
  //   //           exact
  //   //           element={<RowMethod />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/row_guidance"
  //   //           exact
  //   //           element={<RowMethodGuidance />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/add_management_plan/name"
  //   //           exact
  //   //           element={<ManagementPlanName />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
  //   //           exact
  //   //           element={<ManagementTasks />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/details"
  //   //           exact
  //   //           element={<ManagementDetails />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/edit"
  //   //           exact
  //   //           element={<EditManagementDetails />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/repeat"
  //   //           exact
  //   //           element={<RepeatCropPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/repeat_confirmation"
  //   //           exact
  //   //           element={<RepeatCropPlanConfirmation />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/:management_plan_id/complete_management_plan"
  //   //           exact
  //   //           element={<CompleteManagementPlan />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/:management_plan_id/abandon_management_plan"
  //   //           exact
  //   //           element={<AbandonManagementPlan />}
  //   //         />
  //   //         <Route path="/crop_catalogue" exact element={<CropCatalogue />} />
  //   //         <Route path="/crop_varieties/crop/:crop_id" exact element={<CropVarieties />} />
  //   //         <Route path="/crop/:variety_id/detail" element={<CropDetail />} />
  //   //         <Route path="/crop/:variety_id/management" element={<CropManagement />} />
  //   //         <Route path="/crop/:variety_id/edit_crop_variety" exact element={<EditCrop />} />
  //   //         <Route path="/documents" exact element={<Documents />} />
  //   //         <Route path="/documents/add_document" exact element={<AddDocument />} />
  //   //         <Route
  //   //           path="/documents/:document_id/edit_document"
  //   //           exact
  //   //           element={<EditDocument />}
  //   //         />
  //   //         <Route path="/documents/:document_id" exact element={<MainDocument />} />
  //   //         <Route
  //   //           path="/map"
  //   //           exact
  //   //           render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
  //   //         />
  //   //         <Route path="/map/videos" exact element={<MapVideo />} />
  //   //         <Route
  //   //           path="/create_location/farm_site_boundary"
  //   //           exact
  //   //           element={<PostFarmSiteBoundaryForm />}
  //   //         />
  //   //         <Route path="/create_location/barn" exact element={<PostBarnForm />} />
  //   //         <Route
  //   //           path="/create_location/natural_area"
  //   //           exact
  //   //           element={<PostNaturalAreaForm />}
  //   //         />
  //   //         <Route
  //   //           path="/create_location/surface_water"
  //   //           exact
  //   //           element={<PostSurfaceWaterForm />}
  //   //         />
  //   //         <Route path="/create_location/residence" exact element={<PostResidenceForm />} />
  //   //         <Route
  //   //           path="/create_location/ceremonial_area"
  //   //           exact
  //   //           element={<PostCeremonialForm />}
  //   //         />
  //   //         <Route path="/create_location/garden" exact element={<PostGardenForm />} />
  //   //         <Route
  //   //           path="/create_location/greenhouse"
  //   //           exact
  //   //           element={<PostGreenhouseForm />}
  //   //         />
  //   //         <Route path="/create_location/field" exact element={<PostFieldForm />} />
  //   //         <Route path="/create_location/gate" exact element={<PostGateForm />} />
  //   //         <Route
  //   //           path="/create_location/water_valve"
  //   //           exact
  //   //           element={<PostWaterValveForm />}
  //   //         />
  //   //         <Route path="/create_location/fence" exact element={<PostFenceForm />} />
  //   //         <Route
  //   //           path="/create_location/buffer_zone"
  //   //           exact
  //   //           element={<PostBufferZoneForm />}
  //   //         />
  //   //         <Route
  //   //           path="/create_location/watercourse"
  //   //           exact
  //   //           element={<PostWatercourseForm />}
  //   //         />
  //   //         <Route
  //   //           path="/farm_site_boundary/:location_id"
  //   //           element={<FarmSiteBoundaryDetails />}
  //   //         />
  //   //         <Route path="/barn/:location_id" element={<BarnDetails />} />
  //   //         <Route path="/natural_area/:location_id" element={<NaturalAreaDetails />} />
  //   //         <Route path="/surface_water/:location_id" element={<SurfaceWaterDetails />} />
  //   //         <Route path="/residence/:location_id" element={<ResidenceDetails />} />
  //   //         <Route
  //   //           path="/ceremonial_area/:location_id"
  //   //           element={<CeremonialAreaDetails />}
  //   //         />
  //   //         <Route path="/garden/:location_id" element={<GardenDetails />} />
  //   //         <Route path="/greenhouse/:location_id" element={<GreenhouseDetails />} />
  //   //         <Route path="/field/:location_id" element={<FieldDetails />} />
  //   //         <Route path="/gate/:location_id" element={<GateDetails />} />
  //   //         <Route path="/water_valve/:location_id" element={<WaterValveDetails />} />
  //   //         <Route path="/fence/:location_id" element={<FenceDetails />} />
  //   //         <Route path="/buffer_zone/:location_id" element={<BufferZoneDetails />} />
  //   //         <Route path="/watercourse/:location_id" element={<WatercourseDetails />} />
  //   //         <Route path="/sensor/:location_id" element={<SensorDetails />} />
  //   //         <Route path="/crop/new" exact element={<AddNewCrop />} />
  //   //         <Route path="/crop/:crop_id/add_crop_variety" exact element={<AddCrop />} />
  //   //         <Route
  //   //           path="/crop/:crop_id/add_crop_variety/compliance"
  //   //           exact
  //   //           element={<ComplianceInfo />}
  //   //         />
  //   //         <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //         <Route path="/insights" exact element={<Insights />} />
  //   //         <Route path="/insights/soilom" exact element={<SoilOM />} />
  //   //         <Route path="/insights/labourhappiness" exact element={<LabourHappiness />} />
  //   //         <Route path="/insights/biodiversity" exact element={<Biodiversity />} />
  //   //         <Route path="/insights/prices" exact element={<Prices />} />
  //   //         <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //         <Route path="/callback" setAuth={setAuth} element={<Callback />} />
  //   //         <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
  //   //         <Route
  //   //           path="/accept_invitation/create_account"
  //   //           element={<InvitedUserCreateAccount setAuth={setAuth} />}
  //   //         />
  //   //         <Route path="/password_reset" element={<PasswordResetAccount setAuth={setAuth} />} />
  //   //         <Route path={'/expired'} element={<ExpiredTokenScreen />} />
  //   //         <Route path="/invite_user" exact element={<InviteUser />} />
  //   //         <Route path="/certification" exact element={<ViewCertification />} />
  //   //         <Route
  //   //           path="/certification/report_period"
  //   //           exact
  //   //           element={<CertificationReportingPeriod />}
  //   //         />
  //   //         <Route path="/certification/survey" exact element={<CertificationSurvey />} />
  //   //         <Route
  //   //           path="/certification/interested_in_organic"
  //   //           exact
  //   //           element={<InterestedOrganic />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/selection"
  //   //           exact
  //   //           element={<CertificationSelection />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/certifier/selection"
  //   //           exact
  //   //           element={<CertifierSelectionMenu />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/certifier/request"
  //   //           exact
  //   //           element={<RequestCertifier />}
  //   //         />
  //   //         <Route
  //   //           path="/certification/summary"
  //   //           exact
  //   //           element={<SetCertificationSummary />}
  //   //         />
  //   //         <Route path="/export/:id/from/:from/to/:to" exact element={<ExportDownload />} />
  //   //         <Route path="/tasks/:task_id/abandon" exact element={<TaskAbandon />} />
  //   //         <Route path="/tasks/:task_id/complete" exact element={<TaskComplete />} />
  //   //         <Route
  //   //           path="/tasks/:task_id/before_complete"
  //   //           exact
  //   //           element={<TaskCompleteStepOne />}
  //   //         />
  //   //         <Route
  //   //           path="/tasks/:task_id/complete_harvest_quantity"
  //   //           exact
  //   //           element={<HarvestCompleteQuantity />}
  //   //         />
  //   //         <Route path="/tasks/:task_id/harvest_uses" exact element={<HarvestUses />} />
  //   //         <Route path="/add_task/task_locations" exact element={<TaskLocations />} />
  //   //         <Route path="/add_task/task_date" exact element={<TaskDate />} />
  //   //         <Route path="/add_task/task_assignment" exact element={<TaskAssignment />} />
  //   //         <Route path="/add_task/task_details" exact element={<TaskDetails />} />
  //   //         <Route
  //   //           path="/add_task/task_type_selection"
  //   //           exact
  //   //           element={<TaskTypeSelection />}
  //   //         />
  //   //         <Route path="/add_task/task_crops" exact element={<TaskCrops />} />
  //   //         <Route path="/add_task/task_animal_selection" exact element={<TaskAnimals />} />
  //   //         <Route
  //   //           path="/add_task/manage_custom_tasks"
  //   //           exact
  //   //           element={<ManageCustomTasks />}
  //   //         />
  //   //         <Route path="/add_task/add_custom_task" exact element={<AddCustomTask />} />
  //   //         <Route path="/add_task/edit_custom_task" exact element={<EditCustomTask />} />
  //   //         <Route
  //   //           path="/add_task/edit_custom_task_update"
  //   //           exact
  //   //           element={<EditCustomTaskUpdate />}
  //   //         />
  //   //         <Route
  //   //           path="/add_task/planting_method"
  //   //           exact
  //   //           element={<TaskTransplantMethod />}
  //   //         />
  //   //         <Route path="/add_task/bed_method" exact element={<TaskBedMethod />} />
  //   //         <Route path="/add_task/bed_guidance" exact element={<TaskBedGuidance />} />
  //   //         <Route
  //   //           path="/add_task/container_method"
  //   //           exact
  //   //           element={<TaskContainerMethod />}
  //   //         />
  //   //         <Route path="/add_task/row_method" exact element={<TaskRowMethod />} />
  //   //         <Route path="/add_task/row_guidance" exact element={<TaskRowGuidance />} />
  //   //         <Route path="/notifications" exact element={<Notification />} />
  //   //         <Route
  //   //           path="/notifications/:notification_id/read_only"
  //   //           exact
  //   //           element={<NotificationReadOnly />}
  //   //         />
  //   //         <Route path="/finances" element={<Finances />} />
  //   //         <Route
  //   //           path="/animals/*"
  //   //           exact
  //   //           render={(props) => (
  //   //             <Animals
  //   //               isCompactSideMenu={isCompactSideMenu}
  //   //               setFeedbackSurveyOpen={setFeedbackSurveyOpen}
  //   //               {...props}
  //   //             />
  //   //           )}
  //   //         />
  //   //         <Route path="/unknown_record" exact element={<UnknownRecord />} />
  //   //         <Route render={() => <Navigate to={'/'} />} />
  //   //       </Routes>
  //   //     </Suspense>
  //   //   );
  //   // } else {
  //   //   return (
  //   //     <Suspense fallback={<Spinner />}>
  //   //       <Routes>
  //   //         <Route path="/" exact element={<Home />} />
  //   //         <Route path="/home" exact element={<Home />} />
  //   //         <Route path="/profile" exact element={<Account />} />
  //   //         <Route path="/people" exact element={<People />} />
  //   //         <Route path="/farm" exact element={<Farm />} />
  //   //         <Route path="/consent" exact element={<ConsentForm />} />
  //   //         <Route path="/crop_catalogue" exact element={<CropCatalogue />} />
  //   //         <Route path="/crop_varieties/crop/:crop_id" exact element={<CropVarieties />} />
  //   //         <Route path="/crop/:variety_id/detail" exact element={<CropDetail />} />
  //   //         <Route path="/crop/:variety_id/management" exact element={<CropManagement />} />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/tasks"
  //   //           exact
  //   //           element={<ManagementTasks />}
  //   //         />
  //   //         <Route
  //   //           path="/crop/:variety_id/management_plan/:management_plan_id/details"
  //   //           exact
  //   //           element={<ManagementDetails />}
  //   //         />
  //   //         <Route
  //   //           path="/map"
  //   //           exact
  //   //           render={(props) => <Map isCompactSideMenu={isCompactSideMenu} {...props} />}
  //   //         />
  //   //         <Route
  //   //           path="/farm_site_boundary/:location_id"
  //   //           element={<FarmSiteBoundaryDetails />}
  //   //         />
  //   //         <Route path="/barn/:location_id" element={<BarnDetails />} />
  //   //         <Route path="/natural_area/:location_id" element={<NaturalAreaDetails />} />
  //   //         <Route path="/surface_water/:location_id" element={<SurfaceWaterDetails />} />
  //   //         <Route path="/residence/:location_id" element={<ResidenceDetails />} />
  //   //         <Route
  //   //           path="/ceremonial_area/:location_id"
  //   //           element={<CeremonialAreaDetails />}
  //   //         />
  //   //         <Route path="/garden/:location_id" element={<GardenDetails />} />
  //   //         <Route path="/greenhouse/:location_id" element={<GreenhouseDetails />} />
  //   //         <Route path="/field/:location_id" element={<FieldDetails />} />
  //   //         <Route path="/gate/:location_id" element={<GateDetails />} />
  //   //         <Route path="/water_valve/:location_id" element={<WaterValveDetails />} />
  //   //         <Route path="/fence/:location_id" element={<FenceDetails />} />
  //   //         <Route path="/buffer_zone/:location_id" element={<BufferZoneDetails />} />
  //   //         <Route path="/watercourse/:location_id" element={<WatercourseDetails />} />
  //   //         <Route path="/sensor/:location_id" element={<SensorDetails />} />
  //   //         <Route path="/farm_selection" exact element={<ChooseFarm />} />
  //   //         <Route path="/insights" exact element={<Insights />} />
  //   //         <Route path="/insights/soilom" exact element={<SoilOM />} />
  //   //         <Route path="/insights/labourhappiness" exact element={<LabourHappiness />} />
  //   //         <Route path="/insights/biodiversity" exact element={<Biodiversity />} />
  //   //         <Route path="/insights/prices" exact element={<Prices />} />
  //   //         <Route path="/callback" setAuth={setAuth} element={<Callback />} />
  //   //         <Route path="/accept_invitation/sign_up" element={<InviteSignUp />} />
  //   //         <Route
  //   //           path="/accept_invitation/create_account"
  //   //           element={<InvitedUserCreateAccount setAuth={setAuth} />}
  //   //         />
  //   //         <Route path="/password_reset" element={<PasswordResetAccount setAuth={setAuth} />} />
  //   //         <Route path={'/expired'} element={<ExpiredTokenScreen />} />
  //   //         <Route path="/tasks" exact element={<Tasks />} />
  //   //         <Route path="/tasks/:task_id/read_only" exact element={<TaskReadOnly />} />
  //   //         <Route path="/tasks/:task_id/abandon" exact element={<TaskAbandon />} />
  //   //         <Route path="/tasks/:task_id/complete" exact element={<TaskComplete />} />
  //   //         <Route
  //   //           path="/tasks/:task_id/before_complete"
  //   //           exact
  //   //           element={<TaskCompleteStepOne />}
  //   //         />
  //   //         <Route
  //   //           path="/tasks/:task_id/complete_harvest_quantity"
  //   //           exact
  //   //           element={<HarvestCompleteQuantity />}
  //   //         />
  //   //         <Route path="/tasks/:task_id/harvest_uses" exact element={<HarvestUses />} />
  //   //         <Route path="/add_task/task_locations" exact element={<TaskLocations />} />
  //   //         <Route path="/add_task/task_date" exact element={<TaskDate />} />
  //   //         <Route path="/add_task/task_assignment" exact element={<TaskAssignment />} />
  //   //         <Route path="/add_task/task_details" exact element={<TaskDetails />} />
  //   //         <Route
  //   //           path="/add_task/task_type_selection"
  //   //           exact
  //   //           element={<TaskTypeSelection />}
  //   //         />
  //   //         <Route path="/add_task/task_crops" exact element={<TaskCrops />} />
  //   //         <Route path="/add_task/task_animal_selection" exact element={<TaskAnimals />} />
  //   //         <Route
  //   //           path="/add_task/manage_custom_tasks"
  //   //           exact
  //   //           element={<ManageCustomTasks />}
  //   //         />
  //   //         <Route path="/add_task/add_custom_task" exact element={<AddCustomTask />} />
  //   //         <Route path="/add_task/edit_custom_task" exact element={<EditCustomTask />} />
  //   //         <Route
  //   //           path="/add_task/edit_custom_task_update"
  //   //           exact
  //   //           element={<EditCustomTaskUpdate />}
  //   //         />
  //   //         <Route
  //   //           path="/add_task/planting_method"
  //   //           exact
  //   //           element={<TaskTransplantMethod />}
  //   //         />
  //   //         <Route path="/add_task/bed_method" exact element={<TaskBedMethod />} />
  //   //         <Route path="/add_task/bed_guidance" exact element={<TaskBedGuidance />} />
  //   //         <Route
  //   //           path="/add_task/container_method"
  //   //           exact
  //   //           element={<TaskContainerMethod />}
  //   //         />
  //   //         <Route path="/add_task/row_method" exact element={<TaskRowMethod />} />
  //   //         <Route path="/add_task/row_guidance" exact element={<TaskRowGuidance />} />
  //   //         <Route path="/notifications" exact element={<Notification />} />
  //   //         <Route
  //   //           path="/notifications/:notification_id/read_only"
  //   //           exact
  //   //           element={<NotificationReadOnly />}
  //   //         />
  //   //         <Route
  //   //           path="/animals/*"
  //   //           exact
  //   //           render={(props) => (
  //   //             <Animals
  //   //               isCompactSideMenu={isCompactSideMenu}
  //   //               setFeedbackSurveyOpen={setFeedbackSurveyOpen}
  //   //               {...props}
  //   //             />
  //   //           )}
  //   //         />
  //   //         <Route path="/unknown_record" exact element={<UnknownRecord />} />
  //   //         <Route render={() => <Navigate to={'/consent'} />} />
  //   //       </Routes>
  //   //     </Suspense>
  //   //   );
  //   // }
  // }
  const ChooseHome = ({ auth }) => {
    if (auth) {
      if (isInvitationFlow) {
        if (!hasSelectedFarm) {
          return <Navigate to="/farm_selection" />;
        } else if (!has_consent) {
          return <Navigate to="/consent" />;
        } else {
          return <Navigate to="/outro" />;
        }
      } else if (!hasSelectedFarm || !hasFinishedOnBoardingFlow) {
        let { step_one, step_two, step_three, step_four, step_five, has_consent, farm_id } =
          userFarm;
        if (!step_one) {
          return <Navigate to="/add_farm" />;
        } else if (step_four && !has_consent) {
          return <Navigate to="/consent" />;
        } else if (!farm_id && hasUserFarms) {
          return <Navigate to="/farm_selection" />;
        } else if ((!farm_id || !step_one) && !hasUserFarms) {
          return <Navigate to="/welcome" />;
        } else if (step_one && !step_two) {
          return <Navigate to="/role_selection" />;
        } else if (step_two && !step_three) {
          return <Navigate to="/consent" />;
        } else if (step_one && step_three && !step_four) {
          return <Navigate to="/certification/interested_in_organic" />;
        } else if (step_one && step_four && !step_five) {
          return <Navigate to="/outro" />;
        } else {
          return <Navigate to="/outro" />;
        }
      }
    } else {
      return <CustomSignUp setAuth={setAuth} />;
    }
  };

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Authenticated Routes */}
        <Route element={<AuthWrapper auth={auth} />}>
          {isInvitationFlow && <Route path="farm_selection" element={<ChooseFarm />} />}
          {isOnboardingFlow && <Route path="farm_selection" element={<ChooseFarm />} />}
          {isOnboardingFlow && <Route path="welcome" element={<WelcomeScreen />} />}
          {isOnboardingFlow && <Route path="add_farm" element={<AddFarm />} />}
          {isOnboardingFlow && step_one && (
            <Route path="role_selection" element={<RoleSelection />} />
          )}
          {isInvitationFlow && (
            <Route
              path="consent"
              element={<ConsentForm goForwardTo={'/outro'} goBackTo={null} />}
            />
          )}
          {isOnboardingFlow && ((step_two && !step_five) || (step_five && !has_consent)) && (
            <Route
              path="consent"
              element={
                <ConsentForm
                  goForwardTo={
                    step_two && !step_five ? undefined : step_five && !has_consent ? '/' : '/outro'
                  }
                  goBackTo={
                    step_two && !step_five
                      ? undefined
                      : step_five && !has_consent
                        ? '/farm_selection'
                        : null
                  }
                />
              }
            />
          )}
          {isOnboardingFlow && step_three && (
            <Route path="certification/interested_in_organic" element={<InterestedOrganic />} />
          )}
          {isOnboardingFlow && (step_four || interested) && (
            <Route path="certification">
              <Route path="selection" element={<CertificationSelection />} />
              <Route path="certifier/selection" element={<CertifierSelectionMenu />} />
              <Route path="certifier/request" element={<RequestCertifier />} />
              <Route path="summary" element={<SetCertificationSummary />} />
            </Route>
          )}
          {isInvitationFlow && <Route path="outro" element={<JoinFarmSuccessScreen />} />}
          {isOnboardingFlow && step_four && <Route path="outro" element={<Outro />} />}
        </Route>
        {/* Unauthenticated Routes */}
        <Route path="render_survey'" element={<RenderSurvey />} />
        <Route path="callback" setAuth={setAuth} element={<Callback />} />
        <Route path="accept_invitation/sign_up" element={<InviteSignUp />} />
        <Route
          path="accept_invitation/create_account"
          element={<InvitedUserCreateAccount setAuth={setAuth} />}
        />
        <Route path="password_reset" element={<PasswordResetAccount setAuth={setAuth} />} />
        <Route path="expired" element={<ExpiredTokenScreen />} />
        {/* <Route path="/*"
          //TODO: change to 404
          element={() => <Navigate to="/" />}
        /> */}
        {/* Mixed Authentication Routes */}
        <Route path="/" element={<ChooseHome auth={auth} />} />
      </Routes>
    </Suspense>
  );
};

export default AllRoutes;
