/*
 *  Copyright 2025 LiteFarm.org
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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { History } from 'history';
import { ContextForm, Variant } from '../../../../../components/Form/ContextForm';
import Partners from './Partners';
import PageTitle from '../../../../../components/PageTitle/v2';
import { enqueueErrorSnackbar } from '../../../../Snackbar/snackbarSlice';
import { useAddFarmAddonMutation, useLazyGetSensorsQuery } from '../../../../../store/api/apiSlice';
import { type AddSensorsFormFields, FarmAddonField, PARTNER } from './types';
import { PARTNERS } from './constants';
import { SENSORS } from '../../../../../util/siteMapConstants';
import styles from './styles.module.scss';

interface PostSensorProps {
  history: History;
  isCompactSideMenu: boolean;
}

const PostSensor = ({ history, isCompactSideMenu }: PostSensorProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);

  const [addFarmAddon] = useAddFarmAddonMutation();
  const [triggerGetSensors] = useLazyGetSensorsQuery();

  const linkEsci = async (values: AddSensorsFormFields) => {
    const result = await addFarmAddon(values[PARTNER]);

    if ('error' in result) {
      const isInvalidId = 'data' in result.error && result.error.data === 'Organisation not found';
      const errorMessage = isInvalidId
        ? t('SENSOR.ESCI.ORGANISATION_ID_ERROR')
        : t('SENSOR.ESCI.ORGANISATION_ID_GENERIC_ERROR');
      dispatch(enqueueErrorSnackbar(errorMessage));

      // This error prevents the page transition in WithStepperProgressBar's onContinue
      throw Error(isInvalidId ? 'Invalid ESCI organisation ID' : 'ESCI Connection Error');
    }
  };

  const onSave = async (data: AddSensorsFormFields) => {
    await linkEsci(data);
  };

  const onAfterSave = () => {
    triggerGetSensors();
    history.push(SENSORS);
  };

  const getFormSteps = () => [{ FormContent: Partners }];

  const defaultFormValues = {
    [PARTNER]: { [FarmAddonField.PARTNER_ID]: PARTNERS.ESCI.id, [FarmAddonField.ORG_UUID]: '' },
  };

  return (
    <div className={styles.formWrapper}>
      <ContextForm
        stepperProgressBarTitle={t('SENSOR.DETAIL.ADD_SENSORS')}
        history={history}
        getSteps={getFormSteps}
        defaultFormValues={defaultFormValues}
        variant={Variant.STEPPER_PROGRESS_BAR}
        onSave={onSave}
        headerComponent={(props: any) => (
          <PageTitle classNames={{ wrapper: styles.pageTitle }} {...props} />
        )}
        showPreviousButton={false}
        formMode="onChange"
        isCompactSideMenu={isCompactSideMenu}
        onAfterSave={onAfterSave}
        showLoading
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        // TODO: Make sure LF-4704 is mreged before the release. Otherwise cancelModalTitle is required
      />
    </div>
  );
};

export default PostSensor;
