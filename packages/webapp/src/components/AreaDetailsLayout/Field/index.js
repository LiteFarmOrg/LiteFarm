import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../../../containers/mapSlice';
import Input from '../../Form/Input';
import { fieldEnum } from '../../../containers/fieldSlice';

export default function PureField({ history, submitForm, areaType, system }) {
  const { t } = useTranslation();
  const { grid_points } = useSelector(locationInfoSelector);
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    getValues,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      total_area: parseInt(data.total_area),
      perimeter: parseInt(data.perimeter),
      grid_points: grid_points,
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
      isNameRequired={true}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      control={control}
      showPerimeter={true}
      errors={errors}
      areaType={areaType}
      system={system}
    >
      <div>
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
      </div>
    </AreaDetailsLayout>
  );
}
