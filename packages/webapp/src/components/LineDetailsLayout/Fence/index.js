import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { fenceEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

export default function PureFence({ history, submitForm, system }) {
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
  const inputLength = watch(fenceEnum.length);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      //   line_points: line_points,
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
      <div>
        <div>
          <Input
            style={{ marginBottom: '40px' }}
            type={'number'}
            name={fenceEnum.length}
            defaultValue={100}
            unit={'m'}
            label={t('FARM_MAP.FENCE.LENGTH')}
            inputRef={register({ required: true })}
          />
        </div>
        <div>
          <p style={{ marginBottom: '25px' }}>
            {t('FARM_MAP.FENCE.PRESSURE_TREATED')} <img src={Leaf} style={{ paddingLeft: '7px' }} />
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
              name={fenceEnum.pressure_treated}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '40px' }}
              label={t('common:NO')}
              inputRef={register({ required: false })}
              value={'No'}
              name={fenceEnum.pressure_treated}
            />
          </div>
        </div>
      </div>
    </LineDetailsLayout>
  );
}
