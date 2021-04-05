import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { greenhouseEnum } from '../../../containers/constants';
import { Label } from '../../Typography';
import LocationButtons from '../../ButtonGroup/LocationButtons';

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
      buttonGroup={<LocationButtons disabled={disabled} />}
    >
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
            {t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
          </Label>
          <img src={Leaf} style={{ display: 'inline-block' }} />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GREENHOUSE.NON_ORGANIC')}
            defaultChecked={true}
            inputRef={register({ required: true })}
            value={'Non-Organic'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GREENHOUSE.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GREENHOUSE.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={greenhouseEnum.organic_status}
          />
        </div>
        <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
          {greenhouseTypeSelection === 'Transitional' && (
            <Input
              style={{ marginBottom: '16px' }}
              type={'date'}
              name={greenhouseEnum.transition_date}
              defaultValue={new Date().toLocaleDateString('en-CA')}
              label={t('FARM_MAP.GREENHOUSE.DATE')}
              inputRef={register({ required: true })}
              style={{ paddingTop: '16px', paddingBottom: '20px' }}
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
              <div>
                <Radio
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.supplemental_lighting}
                />
                <Radio
                  style={{ marginLeft: '40px' }}
                  label={t('common:NO')}
                  inputRef={register({ required: false })}
                  value={false}
                  name={greenhouseEnum.supplemental_lighting}
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
              <div>
                <Radio
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.co2_enrichment}
                />
                <Radio
                  style={{ marginLeft: '40px' }}
                  label={t('common:NO')}
                  inputRef={register({ required: false })}
                  value={false}
                  name={greenhouseEnum.co2_enrichment}
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
                <Radio
                  label={t('common:YES')}
                  inputRef={register({ required: false })}
                  value={true}
                  name={greenhouseEnum.greenhouse_heated}
                />
                <Radio
                  style={{ marginLeft: '40px' }}
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
