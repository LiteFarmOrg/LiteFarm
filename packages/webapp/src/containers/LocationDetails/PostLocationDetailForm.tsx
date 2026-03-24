/*
 *  Copyright 2026 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSelector, measurementSelector } from '../userFarmSlice';
import { formatLocationTypeToLocationForDB } from './utils';
import { PureBarn } from '../../components/LocationDetailLayout/AreaDetails/Barn';
import { FigureType, InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { PureCeremonialArea } from '../../components/LocationDetailLayout/AreaDetails/CeremonialArea';
import { PureFarmSiteBoundary } from '../../components/LocationDetailLayout/AreaDetails/FarmSiteBoundary';
import { PureField } from '../../components/LocationDetailLayout/AreaDetails/Field';
import { PureGarden } from '../../components/LocationDetailLayout/AreaDetails/Garden';
import { PureGreenhouse } from '../../components/LocationDetailLayout/AreaDetails/Greenhouse';
import { PureNaturalArea } from '../../components/LocationDetailLayout/AreaDetails/NaturalArea';
import { PureResidence } from '../../components/LocationDetailLayout/AreaDetails/Residence';
import { PureSurfaceWater } from '../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import { PureBufferZone } from '../../components/LocationDetailLayout/LineDetails/BufferZone';
import { PureFence } from '../../components/LocationDetailLayout/LineDetails/Fence';
import { PureWatercourse } from '../../components/LocationDetailLayout/LineDetails/Watercourse';
import { PureGate } from '../../components/LocationDetailLayout/PointDetails/Gate';
import { setMapCache } from '../Map/mapCacheSlice';
import { PureSoilSampleLocation } from '../../components/LocationDetailLayout/PointDetails/SoilSampleLocation';
import { PureWaterValve } from '../../components/LocationDetailLayout/PointDetails/WaterValve';
import { useAddLocationByTypeMutation } from '../../store/api/locationApi';
import { useTranslation } from 'react-i18next';

type PureComponentProps = {
  history: ReturnType<typeof useHistory>;
  match: ReturnType<typeof useRouteMatch>;
  submitForm: (data: { formData: any }) => void;
  system: ReturnType<typeof useSelector>;
  isCreateLocationPage?: boolean;
  isViewLocationPage?: boolean;
  isEditLocationPage?: boolean;
  persistedFormData: any;
  useHookFormPersist?: any;
  handleRetire?: () => void;
  isAdmin?: boolean;
};

const PureComponentMap: {
  [key in InternalMapLocationType]: React.ComponentType<PureComponentProps>;
} = {
  // areas
  // @ts-expect-error PureComponent not yet typed
  [InternalMapLocationType.BARN]: PureBarn,
  // @ts-expect-error PureComponent not yet typed
  [InternalMapLocationType.CEREMONIAL_AREA]: PureCeremonialArea,
  // @ts-expect-error PureComponent not yet typed
  [InternalMapLocationType.FARM_SITE_BOUNDARY]: PureFarmSiteBoundary,
  // @ts-expect-error PureComponent not yet typed
  [InternalMapLocationType.FIELD]: PureField,
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.GARDEN]: PureGarden,
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.GREENHOUSE]: PureGreenhouse,
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.NATURAL_AREA]: PureNaturalArea,
  // @ts-expect-error PureComponent not yet typed
  [InternalMapLocationType.RESIDENCE]: PureResidence,
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.SURFACE_WATER]: PureSurfaceWater,
  // lines
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.BUFFER_ZONE]: PureBufferZone,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.FENCE]: PureFence,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.WATERCOURSE]: PureWatercourse,
  // points
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.GATE]: PureGate,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.SOIL_SAMPLE_LOCATION]: PureSoilSampleLocation,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.WATER_VALVE]: PureWaterValve,
};

function PostLocationDetailForm({ locationType }: { locationType: keyof typeof PureComponentMap }) {
  const PureComponent = PureComponentMap[locationType];

  const history = useHistory();
  const match = useRouteMatch();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { farm_id } = useSelector(loginSelector);

  const [addLocationByType] = useAddLocationByTypeMutation();

  const submitForm = async (data: { formData: any }) => {
    const { formData } = data;
    formData.farm_id = farm_id;
    try {
      await addLocationByType({
        data: formatLocationTypeToLocationForDB(formData, locationType) as InternalMapLocation,
        type: locationType,
      }).unwrap();
      // if (locationData?.figure_type === FigureType.POINT) {
      //   dispatch(setMapCache({ maxZoom: undefined, farm_id }));
      // }
      history.push({ pathname: '/map' });
      dispatch(
        enqueueSuccessSnackbar(
          `${t(`FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`)} ${t('message:MAP.SUCCESS_POST')
            .toString()
            ?.toLowerCase()}`,
        ),
      );
    } catch (error) {
      history.push({ pathname: history.location.pathname });
      console.error(error);
      dispatch(
        enqueueErrorSnackbar(
          `${t('message:MAP.FAIL_POST')} ${t(
            `FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`,
          ).toLowerCase()}`,
        ),
      );
    }
  };

  return (
    <PureComponent
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      isCreateLocationPage={true}
    />
  );
}

export default PostLocationDetailForm;
