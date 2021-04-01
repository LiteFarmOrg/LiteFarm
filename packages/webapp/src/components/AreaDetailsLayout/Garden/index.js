import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { gardenEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

export default function PureGarden({ history, submitForm, system, useHookFormPersist }) {
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
  const gardenTypeSelection = watch(gardenEnum.organic_status);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'garden',
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.GARDEN.NAME')}
      title={t('FARM_MAP.GARDEN.TITLE')}
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
        <div style={{ marginBottom: '20px' }}>
          <Label
            style={{
              paddingRight: '10px',
              fontSize: '16px',
              lineHeight: '20px',
              display: 'inline-block',
            }}
          >
            {t('FARM_MAP.GARDEN.GARDEN_TYPE')}
          </Label>
          <img src={Leaf} style={{ display: 'inline-block' }} />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GARDEN.NON_ORGANIC')}
            defaultChecked={true}
            inputRef={register({ required: true })}
            value={'Non-Organic'}
            name={gardenEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GARDEN.ORGANIC')}
            inputRef={register({ required: true })}
            value={'Organic'}
            name={gardenEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.GARDEN.TRANSITIONING')}
            inputRef={register({ required: true })}
            value={'Transitional'}
            name={gardenEnum.organic_status}
          />
        </div>
        <div style={{ paddingBottom: '20px' }}>
          {gardenTypeSelection === 'Transitional' && (
            <Input
              style={{ paddingBottom: '16px' }}
              type={'date'}
              name={gardenEnum.transition_date}
              defaultValue={new Date().toLocaleDateString('en-CA')}
              label={t('FARM_MAP.GARDEN.DATE')}
              inputRef={register({ required: true })}
              style={{ paddingTop: '16px', paddingBottom: '20px' }}
            />
          )}
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
