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

import { useEffect, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, loginSelector, measurementSelector } from '../userFarmSlice';
import {
  useCheckDeleteLocationMutation,
  useDeleteLocationMutation,
  useUpdateLocationByTypeMutation,
} from '../../store/api/locationApi';
import useLocationsById from '../../hooks/location/useLocationsById';
import UnableToRetireModal from '../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../components/Modals/RetireConfirmationModal';
import { formatLocationTypeToLocationForDB, useLocationPageType } from './utils';
import { PureBarn } from '../../components/LocationDetailLayout/AreaDetails/Barn';
import { FigureType, InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { useTranslation } from 'react-i18next';
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

type PureComponentProps = {
  history: ReturnType<typeof useHistory>;
  match: ReturnType<typeof useRouteMatch>;
  submitForm: (data: { formData: any }) => void;
  system: ReturnType<typeof useSelector>;
  isCreateLocationPage?: boolean;
  isViewLocationPage: boolean;
  isEditLocationPage: boolean;
  persistedFormData: any;
  useHookFormPersist?: any;
  handleRetire: () => void;
  isAdmin: boolean;
};

const PureComponentMap: {
  [key in InternalMapLocationType]: React.ComponentType<PureComponentProps>;
} = {
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
  // @ts-expect-error other locations not present yet
  [InternalMapLocationType.BUFFER_ZONE]: PureBufferZone,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.FENCE]: PureFence,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.WATERCOURSE]: PureWatercourse,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.GATE]: PureGate,
  // @ts-expect-error default case not present yet
  [InternalMapLocationType.SOIL_SAMPLE_LOCATION]: PureSoilSampleLocation,
};

function EditLocationDetailForm({ locationType }: { locationType: keyof typeof PureComponentMap }) {
  const PureComponent = PureComponentMap[locationType];
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  // @ts-expect-error error not typed
  const error: { retire: boolean } = location?.state?.error;
  const history = useHistory();
  const match = useRouteMatch();
  // @ts-expect-error match not typed
  const { location_id } = match.params;
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const { farm_id } = useSelector(loginSelector);

  const { locations: locationData } = useLocationsById(location_id);

  const [updateLocationByType] = useUpdateLocationByTypeMutation();
  const [deleteLocation] = useDeleteLocationMutation();
  const [checkDeleteLocation] = useCheckDeleteLocationMutation();

  const { isViewLocationPage, isEditLocationPage } = useLocationPageType();

  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);

  useEffect(() => {
    if (error?.retire) {
      setShowCannotRetireModal(true);
    }
  }, [error]);

  const submitForm = async (data: { formData: any }) => {
    if (!isEditLocationPage) return;
    const { formData } = data;
    formData.farm_id = farm_id;
    try {
      await updateLocationByType({
        data: formatLocationTypeToLocationForDB(
          {
            ...formData,
            ...match.params,
            figure_id: locationData?.figure_id,
          },
          locationType,
        ) as InternalMapLocation,
        type: locationType,
        location_id: location_id,
      }).unwrap();
      history.push({ pathname: '/map' });
      dispatch(
        enqueueSuccessSnackbar(
          `${t(`FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`)} ${t(
            'message:MAP.SUCCESS_PATCH',
          )
            .toString()
            ?.toLowerCase()}`,
        ),
      );
    } catch (error) {
      history.push({ pathname: history.location.pathname });
      console.error(error);
      dispatch(
        enqueueErrorSnackbar(
          `${t('message:MAP.FAIL_PATCH')} ${t(
            `FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`,
          ).toLowerCase()}`,
        ),
      );
    }
  };

  const handleRetire = async () => {
    try {
      await checkDeleteLocation({ location_id }).unwrap();
      setShowConfirmRetireModal(true);
    } catch (_err) {
      setShowCannotRetireModal(true);
    }
  };

  const confirmRetire = async () => {
    if (!isViewLocationPage) return;
    try {
      await deleteLocation({ location_id }).unwrap();
      if (locationData?.figure_type === FigureType.POINT) {
        dispatch(setMapCache({ maxZoom: undefined, farm_id }));
      }
      history.push({ pathname: '/map' });
      dispatch(
        enqueueSuccessSnackbar(
          `${t(`FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`)} ${t(
            'message:MAP.SUCCESS_DELETE',
          )
            .toString()
            ?.toLowerCase()}`,
        ),
      );
    } catch (error) {
      console.error(error);
      history.push({ pathname: history.location.pathname });
      dispatch(
        enqueueErrorSnackbar(
          `${t('message:MAP.FAIL_DELETE')} ${t(
            `FARM_MAP.MAP_FILTER.${locationType.toUpperCase()}`,
          ).toLowerCase()}`,
        ),
      );
    }
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureComponent
        history={history}
        match={match}
        submitForm={submitForm}
        system={system}
        persistedFormData={locationData}
        isEditLocationPage={isEditLocationPage}
        isViewLocationPage={isViewLocationPage}
        handleRetire={handleRetire}
        isAdmin={isAdmin}
      />
      {isViewLocationPage && showCannotRetireModal && (
        <UnableToRetireModal dismissModal={() => setShowCannotRetireModal(false)} />
      )}
      {showConfirmRetireModal && (
        <RetireConfirmationModal
          dismissModal={() => setShowConfirmRetireModal(false)}
          handleRetire={confirmRetire}
        />
      )}
    </>
  );
}

export default EditLocationDetailForm;
