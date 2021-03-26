import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { greenhouseEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

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
  } = useHookFormPersist('/map', getValues, setValue);
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
        <p style={{ marginBottom: '25px' }}>
          {t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}{' '}
          <img src={Leaf} style={{ paddingLeft: '7px' }} />
        </p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.GREENHOUSE.NON_ORGANIC')}
            defaultChecked={true}
            inputRef={register({ required: true })}
            value={'Non-Organic'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.GREENHOUSE.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.GREENHOUSE.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div style={{ paddingBottom: '25px' }}>
          {greenhouseTypeSelection === 'Transitional' && (
            <Input
              type={'date'}
              name={greenhouseEnum.transition_date}
              defaultValue={new Date().toLocaleDateString('en-CA')}
              label={t('FARM_MAP.GREENHOUSE.DATE')}
              inputRef={register({ required: true })}
            />
          )}
        </div>
        <div style={{ paddingBottom: '25px' }}>
          {greenhouseTypeSelection === 'Organic' && (
            <div>
              <p style={{ marginBottom: '25px' }}>
                {t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}{' '}
                <img src={Leaf} style={{ paddingLeft: '7px' }} />
                <Label style={{ paddingLeft: '10px' }} sm>
                  ({t('common:OPTIONAL')})
                </Label>
              </p>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.supplemental_lighting}
                />
              </div>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:NO')}
                  inputRef={register({ required: false })}
                  value={false}
                  name={greenhouseEnum.supplemental_lighting}
                />
              </div>
              <p style={{ marginBottom: '25px' }}>
                {t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}{' '}
                <img src={Leaf} style={{ paddingLeft: '7px' }} />
                <Label style={{ paddingLeft: '10px' }} sm>
                  ({t('common:OPTIONAL')})
                </Label>
              </p>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.co2_enrichment}
                />
              </div>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:NO')}
                  inputRef={register({ required: false })}
                  value={false}
                  name={greenhouseEnum.co2_enrichment}
                />
              </div>
              <p style={{ marginBottom: '25px' }}>
                {t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}{' '}
                <img src={Leaf} style={{ paddingLeft: '7px' }} />
                <Label style={{ paddingLeft: '10px' }} sm>
                  ({t('common:OPTIONAL')})
                </Label>
              </p>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.greenhouse_heated}
                />
              </div>
              <div>
                <Radio
                  style={{ marginBottom: '25px' }}
                  label={t('common:NO')}
                  inputRef={register({ required: false })}
                  value={false}
                  name={greenhouseEnum.greenhouse_heated}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
