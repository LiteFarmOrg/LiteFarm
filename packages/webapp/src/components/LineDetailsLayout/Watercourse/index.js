import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import Radio from '../../Form/Radio';
import { Label } from '../../Typography';
import { line_width } from '../../../util/unit';
import Unit from '../../Form/Unit';
import { watercourseEnum } from '../../../containers/constants';

export default function PureWatercourse({
  history,
  submitForm,
  system,
  width,
  width_display,
  buffer_width,
  buffer_width_display,
  length,
  line_points,
}) {
  const { t } = useTranslation();
  const unit = system === 'metric' ? 'm' : 'ft';
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
  const usedForIrrigation = watch(watercourseEnum.used_for_irrigation);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[watercourseEnum.length_unit] = data[watercourseEnum.length_unit].value;
    const formData = {
      ...data,
      line_points: line_points,
      type: 'watercourse',
      width: width,
      buffer_width: buffer_width,
      used_for_irrigation: usedForIrrigation !== null ? usedForIrrigation === 'true' : null,
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
          <Unit
            style={{ marginBottom: '40px' }}
            register={register}
            classes={{ container: { flexGrow: 1 } }}
            label={t('FARM_MAP.WATERCOURSE.LENGTH')}
            name={watercourseEnum.length}
            displayUnitName={watercourseEnum.length_unit}
            defaultValue={length}
            errors={errors[watercourseEnum.length]}
            unitType={line_width}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFormSetError={setError}
            control={control}
            required
          />
        </div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            disabled
            name={watercourseEnum.width}
            defaultValue={width_display}
            unit={unit}
            label={t('FARM_MAP.WATERCOURSE.WIDTH')}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            disabled
            name={watercourseEnum.includes_riparian_buffer}
            defaultValue={buffer_width_display}
            unit={unit}
            label={t('FARM_MAP.WATERCOURSE.BUFFER')}
            inputRef={register({ required: false })}
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
              value={true}
              name={watercourseEnum.used_for_irrigation}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('common:NO')}
              inputRef={register({ required: false })}
              value={false}
              name={watercourseEnum.used_for_irrigation}
            />
          </div>
        </div>
      </div>
    </LineDetailsLayout>
  );
}
