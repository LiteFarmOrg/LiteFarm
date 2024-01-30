import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input, { getInputErrors } from '../../../Form/Input';
import { gardenEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { getDateInputFormat } from '../../../../util/moment';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import RadioGroup from '../../../Form/RadioGroup';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureGardenWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureGarden {...props} />
    </PersistedFormWrapper>
  );
}

export function PureGarden({
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
  const getDefaultValues = () => {
    return {
      [gardenEnum.organic_status]: 'Non-Organic',
      ...persistedFormData,
      [gardenEnum.transition_date]: getDateInputFormat(
        persistedFormData[gardenEnum.transition_date] || new Date(),
      ),
    };
  };
  const onSubmit = (data) => {
    data[gardenEnum.total_area_unit] = data[gardenEnum.total_area_unit]?.value;
    data[gardenEnum.perimeter_unit] = data[gardenEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'garden',
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      system={system}
      locationType={'garden'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={getDefaultValues()}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'GARDEN'}
      detailsChildren={<GardenDetailsChildren isViewLocationPage={isViewLocationPage} />}
      tabs={['crops', 'tasks', 'details']}
      showPerimeter={true}
    />
  );
}

export function GardenDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext();
  const gardenTypeSelection = watch(gardenEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(gardenEnum.transition_date));
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label
          style={{
            paddingRight: '10px',
            fontSize: '16px',
            lineHeight: '20px',
            display: 'inline-block',
          }}
        >
          {t('FARM_MAP.GARDEN.GARDEN_TYPE')}
        </Label>
        <Leaf style={{ display: 'inline-block' }} />
      </div>
      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={gardenEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.GARDEN.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.GARDEN.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.GARDEN.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />
      <div style={{ paddingBottom: '20px' }}>
        {gardenTypeSelection === 'Transitional' && (
          <Input
            type={'date'}
            label={t('FARM_MAP.GARDEN.DATE')}
            hookFormRegister={register(gardenEnum.transition_date, { required: true })}
            style={{ paddingTop: '16px', paddingBottom: '20px' }}
            disabled={isViewLocationPage}
            errors={getInputErrors(errors, gardenEnum.transition_date)}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
    </div>
  );
}
