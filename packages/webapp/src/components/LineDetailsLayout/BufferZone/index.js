import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import { bufferZoneEnum } from '../../../containers/constants';

export default function PureBufferZone({
  history,
  submitForm,
  system,
  line_points,
  width_display,
  width,
}) {
  const { t } = useTranslation();
  const unit = system === 'metric' ? 'm' : 'ft';
  const {
    register,
    handleSubmit,
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
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[bufferZoneEnum.length] = 0;
    const formData = {
      ...data,
      line_points: line_points,
      width: width,
      type: 'buffer_zone',
    };
    submitForm({ formData });
  };

  return (
    <LineDetailsLayout
      name={t('FARM_MAP.BUFFER_ZONE.NAME')}
      title={t('FARM_MAP.BUFFER_ZONE.TITLE')}
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
      <div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            disabled
            name={bufferZoneEnum.width_display}
            defaultValue={width_display}
            unit={unit}
            label={t('FARM_MAP.BUFFER_ZONE.WIDTH')}
            inputRef={register({ required: false })}
          />
        </div>
      </div>
    </LineDetailsLayout>
  );
}
