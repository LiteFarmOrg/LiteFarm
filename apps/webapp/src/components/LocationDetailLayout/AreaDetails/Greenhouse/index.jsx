import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm, useFormContext } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input from '../../../Form/Input';
import { greenhouseEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';

import { getDateInputFormat } from '../../../../util/moment';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureGreenhouseWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureGreenhouse {...props} />
    </PersistedFormWrapper>
  );
}

export function PureGreenhouse({
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
      [greenhouseEnum.organic_status]: 'Non-Organic',
      ...persistedFormData,
      [greenhouseEnum.transition_date]: getDateInputFormat(
        persistedFormData[greenhouseEnum.transition_date] || new Date(),
      ),
    };
  };
  const onSubmit = (data) => {
    const supplementalLighting = data[greenhouseEnum.supplemental_lighting];
    const co2Enrichment = data[greenhouseEnum.co2_enrichment];
    const greenhouseHeated = data[greenhouseEnum.greenhouse_heated];
    data[greenhouseEnum.total_area_unit] = data[greenhouseEnum.total_area_unit]?.value;
    data[greenhouseEnum.perimeter_unit] = data[greenhouseEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'greenhouse',
      supplemental_lighting: supplementalLighting,
      co2_enrichment: co2Enrichment,
      greenhouse_heated: greenhouseHeated,
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      system={system}
      locationType={'greenhouse'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={getDefaultValues()}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'GREENHOUSE'}
      detailsChildren={<GreenhouseDetailsChildren isViewLocationPage={isViewLocationPage} />}
      showPerimeter={false}
      tabs={['crops', 'tasks', 'details']}
    />
  );
}

export function GreenhouseDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { register, watch, control } = useFormContext();
  const greenhouseTypeSelection = watch(greenhouseEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(greenhouseEnum.transition_date));
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
          {t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
        </Label>
        <img src={Leaf} style={{ display: 'inline-block' }} />
      </div>
      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={greenhouseEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.GREENHOUSE.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.GREENHOUSE.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.GREENHOUSE.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />

      <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
        {greenhouseTypeSelection === 'Transitional' && (
          <Input
            type={'date'}
            label={t('FARM_MAP.GREENHOUSE.DATE')}
            hookFormRegister={register(greenhouseEnum.transition_date, { required: true })}
            style={{ paddingTop: '16px', paddingBottom: '20px' }}
            disabled={isViewLocationPage}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
      <div>
        {greenhouseTypeSelection === 'Organic' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                {t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}
              </Label>
              <img src={Leaf} style={{ display: 'inline-block', paddingRight: '10px' }} />
              <Label style={{ display: 'inline-block' }} sm>
                {t('common:OPTIONAL')}
              </Label>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.supplemental_lighting}
                hookFormControl={control}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                {t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}
              </Label>
              <img src={Leaf} style={{ display: 'inline-block', paddingRight: '10px' }} />
              <Label style={{ display: 'inline-block' }} sm>
                {t('common:OPTIONAL')}
              </Label>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.co2_enrichment}
                hookFormControl={control}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                {t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}
              </Label>
              <img src={Leaf} style={{ display: 'inline-block', paddingRight: '10px' }} />
              <Label style={{ display: 'inline-block' }} sm>
                {t('common:OPTIONAL')}
              </Label>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.greenhouse_heated}
                hookFormControl={control}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
