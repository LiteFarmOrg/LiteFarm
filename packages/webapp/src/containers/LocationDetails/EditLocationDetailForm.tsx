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
import { isAdminSelector, measurementSelector } from '../userFarmSlice';
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
import { InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { useTranslation } from 'react-i18next';
import { PureCeremonialArea } from '../../components/LocationDetailLayout/AreaDetails/CeremonialArea';

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
};

// @ts-expect-error other locations not present yet
const translationMap: { [key in InternalMapLocationType]: string } = {
  [InternalMapLocationType.BARN]: 'FARM_MAP.MAP_FILTER.BARN',
  [InternalMapLocationType.CEREMONIAL_AREA]: 'FARM_MAP.MAP_FILTER.CA',
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
          `${t(translationMap[locationType])} ${t('message:MAP.SUCCESS_PATCH')
            .toString()
            ?.toLowerCase()}`,
        ),
      );
    } catch (error) {
      history.push({ pathname: history.location.pathname });
      console.error(error);
      dispatch(
        enqueueErrorSnackbar(
          `${t('message:MAP.FAIL_PATCH')} ${t(translationMap[locationType]).toLowerCase()}`,
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
      history.push({ pathname: '/map' });
      dispatch(
        enqueueSuccessSnackbar(
          `${t(translationMap[locationType])} ${t('message:MAP.SUCCESS_DELETE')
            .toString()
            ?.toLowerCase()}`,
        ),
      );
    } catch (error) {
      console.error(error);
      history.push({ pathname: history.location.pathname });
      dispatch(
        enqueueErrorSnackbar(
          `${t('message:MAP.FAIL_DELETE')} ${t(translationMap[locationType]).toLowerCase()}`,
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
