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
import { FigureType, InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { useTranslation } from 'react-i18next';
import { setMapCache } from '../Map/mapCacheSlice';
import PureLocationFormWrapper from '../../components/LocationDetailLayout/PureLocationFormWrapper';

function EditLocationDetailForm({ locationType }: { locationType: InternalMapLocationType }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
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
      setShowConfirmRetireModal(false);
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
      setShowCannotRetireModal(true);
    }
  };

  return (
    <>
      <PureLocationFormWrapper
        locationType={locationType}
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
