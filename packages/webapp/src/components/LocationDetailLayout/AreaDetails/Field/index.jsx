import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm, useFormContext } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input from '../../../Form/Input';
import { fieldEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';

import { getDateInputFormat } from '../../../../util/moment';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import RadioGroup from '../../../Form/RadioGroup';
import {
  getFormDataWithoutNulls,
  getProcessedFormData,
} from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureFieldWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureField {...props} />
    </PersistedFormWrapper>
  );
}

export function PureField({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  getProcessedFormData();
  const getDefaultValues = () => {
    return {
      [fieldEnum.organic_status]: 'Non-Organic',
      ...persistedFormData,
      [fieldEnum.transition_date]: getDateInputFormat(
        persistedFormData[fieldEnum.transition_date] || new Date(),
      ),
    };
  };
  const onSubmit = (data) => {
    data[fieldEnum.total_area_unit] = data[fieldEnum.total_area_unit]?.value;
    data[fieldEnum.perimeter_unit] = data[fieldEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'field',
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      system={system}
      locationType={'field'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={getDefaultValues()}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'FIELD'}
      detailsChildren={<FieldDetailsChildren isViewLocationPage={isViewLocationPage} />}
      showPerimeter={true}
      tabs={['crops', 'tasks', 'details']}
    />
  );
}

export function FieldDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control, watch, register } = useFormContext();
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(fieldEnum.transition_date));
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
          {t('FARM_MAP.FIELD.FIELD_TYPE')}
        </Label>
        <img src={Leaf} style={{ display: 'inline-block' }} />
      </div>

      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={fieldEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.FIELD.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.FIELD.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.FIELD.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />

      <div style={{ paddingBottom: '20px' }}>
        {fieldTypeSelection === 'Transitional' && (
          <Input
            style={{ paddingBottom: '16px' }}
            type={'date'}
            label={t('FARM_MAP.FIELD.DATE')}
            hookFormRegister={register(fieldEnum.transition_date, { required: true })}
            disabled={isViewLocationPage}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
    </div>
  );
}
