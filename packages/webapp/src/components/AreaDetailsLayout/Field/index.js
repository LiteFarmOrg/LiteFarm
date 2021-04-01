import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { fieldEnum } from '../../../containers/constants';
import { Label } from "../../Typography";

export default function PureField({ history, submitForm, system, useHookFormPersist }) {
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
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'field',
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.FIELD.NAME')}
      title={t('FARM_MAP.FIELD.TITLE')}
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
      showPerimeter={true}
      errors={errors}
      system={system}
      total_area={total_area}
      perimeter={perimeter}
    >
      <div>
        <div style={{ marginBottom: '20px'}}>
          <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px'}}>
            {t('FARM_MAP.FIELD.FIELD_TYPE')}
          </Label>
          <img src={Leaf} style={{ display: 'inline-block' }} />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.FIELD.NON_ORGANIC')}
            defaultChecked={true}
            inputRef={register({ required: true })}
            value={'Non-Organic'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.FIELD.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.FIELD.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={fieldEnum.organic_status}
          />
        </div>
        <div style={{ paddingBottom: '20px' }}>
          {fieldTypeSelection === 'Transitional' && (
            <Input
              style={{ paddingBottom: '16px'}}
              type={'date'}
              name={fieldEnum.transition_date}
              defaultValue={new Date().toLocaleDateString('en-CA')}
              label={t('FARM_MAP.FIELD.DATE')}
              inputRef={register({ required: true })}
            />
          )}
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
