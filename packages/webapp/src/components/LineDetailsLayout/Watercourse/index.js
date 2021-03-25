import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import { watercourseEnum } from '../../../containers/watercourseSlice';
import Radio from '../../Form/Radio';
import { Label } from '../../Typography';

export default function PureWatercourse({ history, submitForm, system }) {
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
  const inputLength = watch(watercourseEnum.length);
  const inputWidth = watch(watercourseEnum.width);
  const inputRiparianBuffer = watch(watercourseEnum.includes_riparian_buffer);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      //   line_points: line_points,
      type: 'buffer_zone',
    };
    submitForm({ formData });
  };

  return (
    <LineDetailsLayout
      name={t('FARM_MAP.WATERCOURSE.NAME')}
      title={t('FARM_MAP.WATERCOURSE.TITLE')}
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
            name={watercourseEnum.length}
            defaultValue={100}
            unit={'m'}
            label={t('FARM_MAP.WATERCOURSE.LENGTH')}
            inputRef={register({ required: true })}
          />
        </div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            disabled
            name={watercourseEnum.width}
            defaultValue={100}
            unit={'m'}
            label={t('FARM_MAP.WATERCOURSE.WIDTH')}
            inputRef={register({ required: true })}
          />
        </div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            disabled
            name={watercourseEnum.includes_riparian_buffer}
            defaultValue={100}
            unit={'m'}
            label={t('FARM_MAP.WATERCOURSE.BUFFER')}
            inputRef={register({ required: true })}
          />
        </div>
        <div>
          <p style={{ marginBottom: '25px' }}>
            {t('FARM_MAP.WATERCOURSE.IRRIGATION')}
            <Label style={{ paddingLeft: '10px' }} sm>
              ({t('common:OPTIONAL')})
            </Label>
          </p>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('common:YES')}
              inputRef={register({ required: false })}
              value={'Yes'}
              name={watercourseEnum.used_for_irrigation}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('common:NO')}
              inputRef={register({ required: false })}
              value={'No'}
              name={watercourseEnum.used_for_irrigation}
            />
          </div>
        </div>
      </div>
    </LineDetailsLayout>
  );
}
