import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { fenceEnum } from '../../../containers/fenceSlice';

export default function PureFence({ history, submitForm, system, grid_points }) {
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
  const onError = (data) => {};
  const isPressureTreated = watch(fenceEnum.pressure_treated);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      grid_points: grid_points,
      type: 'fence',
    };
    submitForm({ formData });
  };

  return (
    <LineDetailsLayout
      name={t('FARM_MAP.FENCE.NAME')}
      title={t('FARM_MAP.FENCE.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      errors={errors}
      system={system}
    >
      {/* <div>
        <p style={{ marginBottom: '25px' }}>
          {t('FARM_MAP.FIELD.FIELD_TYPE')} <img src={Leaf} style={{ paddingLeft: '7px' }} />
        </p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.FIELD.NON_ORGANIC')}
            defaultChecked={true}
            inputRef={register({ required: true })}
            value={'Non-Organic'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.FIELD.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.FIELD.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div style={{ paddingBottom: '25px' }}>
          {fieldTypeSelection === 'Transitional' && (
            <Input
              type={'date'}
              name={fieldEnum.transition_date}
              defaultValue={new Date().toLocaleDateString('en-CA')}
              label={t('FARM_MAP.FIELD.DATE')}
              inputRef={register({ required: true })}
            />
          )}
        </div>
      </div> */}
    </LineDetailsLayout>
  );
}
