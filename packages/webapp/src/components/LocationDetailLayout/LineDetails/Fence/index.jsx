import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../LineDetails';
import { useForm, useFormContext } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import { bufferZoneEnum, fenceEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { line_length } from '../../../../util/convert-units/unit';
import Unit from '../../../Form/Unit';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureFenceWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureFence {...props} />
    </PersistedFormWrapper>
  );
}

export function PureFence({
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
  const onSubmit = (data) => {
    const isPressureTreated = data[fenceEnum.pressure_treated];
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      pressure_treated: isPressureTreated,
      type: 'fence',
    });
    formData[fenceEnum.width] = 0;
    formData[fenceEnum.width_unit] = formData[fenceEnum.width_unit]?.value;
    formData[fenceEnum.length_unit] = formData[fenceEnum.length_unit]?.value;
    delete formData[bufferZoneEnum.total_area_unit];
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      system={system}
      locationType={'fence'}
      locationCategory={'line'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'FENCE'}
      detailsChildren={
        <FenceDetailsChildren isViewLocationPage={isViewLocationPage} system={system} />
      }
      tabs={['tasks', 'details']}
    />
  );
}

export function FenceDetailsChildren({ system, isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          style={{ marginBottom: '40px' }}
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.FENCE.LENGTH')}
          name={fenceEnum.length}
          displayUnitName={fenceEnum.length_unit}
          errors={errors[fenceEnum.length]}
          unitType={line_length}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
            {t('FARM_MAP.FENCE.PRESSURE_TREATED')}
          </Label>
          <Leaf style={{ display: 'inline-block', paddingRight: '10px' }} />
          <Label style={{ display: 'inline-block' }} sm>
            {t('common:OPTIONAL')}
          </Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={fenceEnum.pressure_treated}
            hookFormControl={control}
          />
        </div>
      </div>
    </div>
  );
}
