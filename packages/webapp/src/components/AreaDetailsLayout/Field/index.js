import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import DateContainer from '../../Inputs/DateContainer';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../../../containers/mapSlice';

export default function PureField({ history, submitForm, areaType, system }) {
  const { t } = useTranslation();
  const { grid_points } = useSelector(locationInfoSelector);

  const [date, setDate] = useState(moment());
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
    mode: 'onChange',
  });
  const onError = (data) => {};
  const FIELD_TYPE = 'field_type';
  const fieldTypeSelection = watch(FIELD_TYPE, 'Transitional');

  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      name: data.name,
      total_area: parseInt(data.total_area),
      perimeter: parseInt(data.perimeter),
      transition_date: date,
      grid_points: grid_points,
      notes: data.notes,
      type: 'field',
      organic_status: fieldTypeSelection,
    };
    submitForm({ formData });
  };

  useEffect(() => {
    setValue(FIELD_TYPE, 'Non-Organic');
  }, []);
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
            name={FIELD_TYPE}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.FIELD.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={FIELD_TYPE}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.FIELD.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={FIELD_TYPE}
          />
        </div>
        <div style={{ paddingBottom: '25px' }}>
          {fieldTypeSelection === 'Transitional' && (
            <DateContainer date={date} label={t('FARM_MAP.FIELD.DATE')} onDateChange={setDate} />
          )}
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
