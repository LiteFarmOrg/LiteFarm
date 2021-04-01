import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { greenhouseEnum } from '../../../containers/constants';

export default function PureGreenhouse({ history, submitForm, system, useHookFormPersist }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    getValues,
    setError,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(['/map'], getValues, setValue);
  const onError = (data) => {};

  const greenhouseTypeSelection = watch(greenhouseEnum.organic_status);
  const supplementalLighting = watch(greenhouseEnum.supplemental_lighting);
  const co2Enrichment = watch(greenhouseEnum.co2_enrichment);
  const greenhouseHeated = watch(greenhouseEnum.greenhouse_heated);

  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'greenhouse',
      supplemental_lighting:
        supplementalLighting !== null && supplementalLighting !== undefined
          ? supplementalLighting === 'true'
          : null,
      co2_enrichment:
        co2Enrichment !== null && co2Enrichment !== undefined ? co2Enrichment === 'true' : null,
      greenhouse_heated:
        greenhouseHeated !== null && greenhouseHeated !== undefined
          ? greenhouseHeated === 'true'
          : null,
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.GREENHOUSE.NAME')}
      title={t('FARM_MAP.GREENHOUSE.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      watch={watch}
      setError={setError}
      control={control}
      showPerimeter={false}
      errors={errors}
      system={system}
      total_area={total_area}
      perimeter={perimeter}
    >
      <div>
        <Radio
          style={{ marginBottom: '12px' }}
          label={t('FARM_MAP.GREENHOUSE.NON_ORGANIC')}
          defaultChecked={true}
          inputRef={register({ required: true })}
          value={'Non-Organic'}
          name={greenhouseEnum.organic_status}
          text={t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
        />
      </div>
      <div>
        <Radio
          style={{ marginBottom: '12px' }}
          label={t('FARM_MAP.GREENHOUSE.ORGANIC')}
          inputRef={register({ required: true })}
          value={'Organic'}
          name={greenhouseEnum.organic_status}
        />
      </div>
      <div>
        <Radio
          style={{ marginBottom: '12px' }}
          label={t('FARM_MAP.GREENHOUSE.TRANSITIONING')}
          inputRef={register({ required: true })}
          value={'Transitional'}
          name={greenhouseEnum.organic_status}
        />
      </div>
      <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
        {greenhouseTypeSelection === 'Transitional' && (
          <Input
            type={'date'}
            name={greenhouseEnum.transition_date}
            defaultValue={new Date().toLocaleDateString('en-CA')}
            label={t('FARM_MAP.GREENHOUSE.DATE')}
            inputRef={register({ required: true })}
            style={{ paddingBottom: '20px', paddingTop: '16px' }}
          />
        )}
      </div>
      <div>
        {greenhouseTypeSelection === 'Organic' && (
          <div>
            <div>
              <Radio
                style={{ marginBottom: '12px' }}
                label={t('common:YES')}
                inputRef={register({ required: false })}
                value={true}
                name={greenhouseEnum.supplemental_lighting}
                text={t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}
                img={Leaf}
              />
              <Radio
                style={{ marginBottom: '25px', marginLeft: '40px' }}
                label={t('common:NO')}
                inputRef={register({ required: false })}
                value={false}
                name={greenhouseEnum.supplemental_lighting}
              />
            </div>
            <div>
              <Radio
                style={{ marginBottom: '12px' }}
                label={t('common:YES')}
                inputRef={register({ required: false })}
                value={true}
                defaultChecked={true}
                name={greenhouseEnum.co2_enrichment}
                text={t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}
                img={Leaf}
              />
              <Radio
                style={{ marginBottom: '25px', marginLeft: '40px' }}
                label={t('common:NO')}
                inputRef={register({ required: false })}
                value={false}
                name={greenhouseEnum.co2_enrichment}
              />
            </div>
            <div>
              <Radio
                style={{ marginBottom: '12px' }}
                label={t('common:YES')}
                inputRef={register({ required: false })}
                value={true}
                name={greenhouseEnum.greenhouse_heated}
                text={t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}
                img={Leaf}
                defaultChecked={true}
              />
              <Radio
                style={{ marginBottom: '40px', marginLeft: '40px' }}
                label={t('common:NO')}
                inputRef={register({ required: false })}
                value={false}
                name={greenhouseEnum.greenhouse_heated}
              />
            </div>
          </div>
        )}
      </div>
    </AreaDetailsLayout>
  );
}
