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
import styles from './styles.module.scss';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import Input from '../../../Form/Input';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureSoilSampleLocationWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureSoilSampleLocation {...props} />
    </PersistedFormWrapper>
  );
}

export function PureSoilSampleLocation({
  history,
  match,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  submitForm,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const onSubmit = (data) => {
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      locationType={'soil_sample_location'}
      locationCategory={'point'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'SOIL_SAMPLE_LOCATION'}
      detailsChildren={<SoilSampleLocationDetailsChildren persistedFormData={persistedFormData} />}
    />
  );
}

export function SoilSampleLocationDetailsChildren({ persistedFormData }) {
  const { t } = useTranslation();

  return (
    <div className={styles.latLngContainer}>
      <Input
        label={t('FARM_MAP.SOIL_SAMPLE_LOCATION.LATITUDE')}
        disabled={true}
        value={persistedFormData?.point?.lat}
      />
      <Input
        label={t('FARM_MAP.SOIL_SAMPLE_LOCATION.LONGITUDE')}
        disabled={true}
        value={persistedFormData?.point?.lng}
      />
    </div>
  );
}
