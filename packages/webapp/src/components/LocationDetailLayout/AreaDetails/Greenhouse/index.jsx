import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input from '../../../Form/Input';
import { greenhouseEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { getDateInputFormat } from '../../../../util/moment';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';

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
      <InputBaseLabel
        label={t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
        hasLeaf={true}
        labelStyles={{
          marginBottom: '12px',
          fontSize: '16px',
        }}
        leftJustified
      />
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
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.supplemental_lighting}
                hookFormControl={control}
              />
            </div>
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />

            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.co2_enrichment}
                hookFormControl={control}
              />
            </div>
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />
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
