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
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { History } from 'history';
import { ContextForm, Variant } from '../../../../../components/Form/ContextForm';
import { enqueueErrorSnackbar } from '../../../../Snackbar/snackbarSlice';
import styles from './styles.module.scss';

interface PostSensorProps {
  history: History;
}

const PostSensor = ({ history }: PostSensorProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const linkOrganizationId = async () => {
    // TODO: POST /farm_addon
    //       When failed: snackbar

    // Simulating the API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Successful
        resolve();

        // Failed
        // reject(dispatch(enqueueErrorSnackbar('TODO: Error message')));
      }, 1500);
    });
  };

  const onSave = async (data: any, onSuccess: () => void) => {
    // TODO: GET devices with useLazyQuery.
    //       Once the data is returned, call onSuccess to navigate to the next view.

    onSuccess();
  };

  const getFormSteps = () => [
    {
      FormContent: () => <div>Partner selection view</div>,
      onContinueAction: linkOrganizationId,
    },
    { FormContent: () => <div>ESCI devices view</div> },
  ];

  const defaultFormValues = {
    partner: { integrating_partner_id: 1, organization_uuid: '' },
  };

  return (
    <div className={styles.formWrapper}>
      <ContextForm
        stepperProgressBarTitle={t('SENSOR.DETAIL.ADD_SENSORS')}
        history={history}
        getSteps={getFormSteps}
        defaultFormValues={defaultFormValues}
        variant={Variant.SIMPLE_HEADER}
        hasSummaryWithinForm={true}
        onSave={onSave}
      />
    </div>
  );
};

export default PostSensor;
