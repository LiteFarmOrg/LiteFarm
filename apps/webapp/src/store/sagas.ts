/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

// @ts-expect-error until migrated to TypeScript
import homeSaga from '../containers/saga';
// @ts-expect-error until migrated to TypeScript
import addFarmSaga from '../containers/AddFarm/saga';
// @ts-expect-error until migrated to TypeScript
import peopleSaga from '../containers/Profile/People/saga';
// @ts-expect-error until migrated to TypeScript
import signUpSaga from '../containers/CustomSignUp/saga';
// @ts-expect-error until migrated to TypeScript
import resetUserPasswordSaga from '../containers/PasswordResetAccount/saga';
// @ts-expect-error until migrated to TypeScript
import outroSaga from '../containers/Outro/saga';
// @ts-expect-error until migrated to TypeScript
import locationSaga from '../containers/LocationDetails/saga';
// @ts-expect-error until migrated to TypeScript
import fieldLocationSaga from '../containers/LocationDetails/AreaDetails/FieldDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import sensorDetailSaga from '../containers/LocationDetails/PointDetails/SensorDetail/saga';
// @ts-expect-error until migrated to TypeScript
import documentSaga from '../containers/Documents/saga';
// @ts-expect-error until migrated to TypeScript
import managementPlanSaga from '../containers/Crop/saga';
// @ts-expect-error until migrated to TypeScript
import gardenSaga from '../containers/LocationDetails/AreaDetails/GardenDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import gateSaga from '../containers/LocationDetails/PointDetails/GateDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import waterValveSaga from '../containers/LocationDetails/PointDetails/WaterValveDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import naturalAreaSaga from '../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import barnSaga from '../containers/LocationDetails/AreaDetails/BarnDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import surfaceWaterSaga from '../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import greenhouseSaga from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import ceremonialSaga from '../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import residenceSaga from '../containers/LocationDetails/AreaDetails/ResidenceDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import farmSiteBoundarySaga from '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import fenceSaga from '../containers/LocationDetails/LineDetails/FenceDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import bufferZoneSaga from '../containers/LocationDetails/LineDetails/BufferZoneDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import watercourseSaga from '../containers/LocationDetails/LineDetails/WatercourseDetailForm/saga';
// @ts-expect-error until migrated to TypeScript
import financeSaga from '../containers/Finances/saga';
// @ts-expect-error until migrated to TypeScript
import varietalSaga from '../containers/AddCropVariety/saga';
// @ts-expect-error until migrated to TypeScript
import insightSaga from '../containers/Insights/saga';
// @ts-expect-error until migrated to TypeScript
import chooseFarmSaga from '../containers/ChooseFarm/saga';
// @ts-expect-error until migrated to TypeScript
import supportSaga from '../containers/Help/saga';
// @ts-expect-error until migrated to TypeScript
import certifierSurveySaga from '../containers/OrganicCertifierSurvey/saga';
// @ts-expect-error until migrated to TypeScript
import consentSaga from '../containers/Consent/saga';
// @ts-expect-error until migrated to TypeScript
import callbackSaga from '../containers/Callback/saga';
// @ts-expect-error until migrated to TypeScript
import inviteUserSaga from '../containers/InviteUser/saga';
// @ts-expect-error until migrated to TypeScript
import exportSaga from '../containers/ExportDownload/saga';
// @ts-expect-error until migrated to TypeScript
import fieldWorkTaskSaga from '../containers/Task/FieldWorkTask/saga';
// @ts-expect-error until migrated to TypeScript
import loginSaga from '../containers/GoogleLoginButton/saga';
// @ts-expect-error until migrated to TypeScript
import inviteSaga from '../containers/InvitedUserCreateAccount/saga';
// @ts-expect-error until migrated to TypeScript
import SSOInfoSaga from '../containers/SSOUserCreateAccountInfo/saga';
// @ts-expect-error until migrated to TypeScript
import weatherSaga from '../containers/WeatherBoard/saga';
// @ts-expect-error until migrated to TypeScript
import alertSaga from '../containers/Navigation/Alert/saga';
// @ts-expect-error until migrated to TypeScript
import mapSaga from '../containers/Map/saga';
// @ts-expect-error until migrated to TypeScript
import sensorReadingsSaga from '../containers/SensorReadings/saga';
// @ts-expect-error until migrated to TypeScript
import uploadDocumentSaga from '../containers/Documents/DocumentUploader/saga';
// @ts-expect-error until migrated to TypeScript
import imageUploaderSaga from '../containers/ImagePickerWrapper/saga';
// @ts-expect-error until migrated to TypeScript
import certificationsSaga from '../containers/Certifications/saga';
// @ts-expect-error until migrated to TypeScript
import taskSaga from '../containers/Task/saga';
// @ts-expect-error until migrated to TypeScript
import abandonAndCompleteManagementPlanSaga from '../containers/Crop/CompleteManagementPlan/saga';
// @ts-expect-error until migrated to TypeScript
import notificationSaga from '../containers/Notification/saga';
// @ts-expect-error until migrated to TypeScript
import errorHandlerSaga from '../containers/ErrorHandler/saga';
// @ts-expect-error until migrated to TypeScript
import irrigationTaskTypesSaga from '../containers/Task/IrrigationTaskTypes/saga';

export const sagas = [
  homeSaga,
  addFarmSaga,
  peopleSaga,
  signUpSaga,
  resetUserPasswordSaga,
  outroSaga,
  locationSaga,
  fieldLocationSaga,
  sensorDetailSaga,
  documentSaga,
  managementPlanSaga,
  gardenSaga,
  gateSaga,
  waterValveSaga,
  naturalAreaSaga,
  barnSaga,
  surfaceWaterSaga,
  greenhouseSaga,
  ceremonialSaga,
  residenceSaga,
  farmSiteBoundarySaga,
  fenceSaga,
  bufferZoneSaga,
  watercourseSaga,
  financeSaga,
  varietalSaga,
  insightSaga,
  chooseFarmSaga,
  supportSaga,
  certifierSurveySaga,
  consentSaga,
  callbackSaga,
  inviteUserSaga,
  exportSaga,
  fieldWorkTaskSaga,
  loginSaga,
  inviteSaga,
  SSOInfoSaga,
  weatherSaga,
  alertSaga,
  mapSaga,
  sensorReadingsSaga,
  uploadDocumentSaga,
  imageUploaderSaga,
  certificationsSaga,
  taskSaga,
  abandonAndCompleteManagementPlanSaga,
  notificationSaga,
  errorHandlerSaga,
  irrigationTaskTypesSaga,
];
