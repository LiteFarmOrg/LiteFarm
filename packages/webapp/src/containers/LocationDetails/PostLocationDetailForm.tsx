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
import { InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { setMapCache } from '../Map/mapCacheSlice';
import { useAddLocationByTypeMutation } from '../../store/api/locationApi';
import { useTranslation } from 'react-i18next';
import PureLocationFormWrapper from '../../components/LocationDetailLayout/PureLocationFormWrapper';

function PostLocationDetailForm({ locationType }: { locationType: InternalMapLocationType }) {
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
    const locationData = formatLocationTypeToLocationForDB(
      formData,
      locationType,
    ) as InternalMapLocation;
    try {
      await addLocationByType({
        data: locationData,
        type: locationType,
      }).unwrap();
      if (locationData.figure.point) {
        dispatch(setMapCache({ maxZoom: undefined, farm_id }));
      }
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
    <PureLocationFormWrapper
      locationType={locationType}
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
