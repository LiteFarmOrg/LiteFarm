import Button from '../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label, Semibold } from '../Typography';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../components/ProgressBar';
import Form from '../Form';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import ReactSelect from '../Form/ReactSelect';
import { BsChevronDown } from 'react-icons/bs';
import { FIRST_NUTRIENT_ARRAY, SECOND_NUTRIENT_ARRAY, NUTRIENT_DICT } from './constants';

export default function PureAddNewCrop({ handleGoBack, handleCancel }) {
  const { t } = useTranslation();
  const methods = useForm({
    mode: 'onChange',
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = methods;
  const { isValid } = useFormState({ control });
  const onSubmit = (data) => {
    console.log(data);
  };

  const cropGroupOptions = [
    { value: 'BEVERAGE_AND_SPICE_CROPS', label: t('crop_group:BEVERAGE_AND_SPICE_CROPS') },
    { value: 'CEREALS', label: t('crop_group:CEREALS') },
    { value: 'FRUITS_AND_NUTS', label: t('crop_group:FRUITS_AND_NUTS') },
    { value: 'LEGUMINOUS_CROPS', label: t('crop_group:LEGUMINOUS_CROPS') },
    { value: 'OILSEED_CROPS', label: t('crop_group:OILSEED_CROPS') },
    { value: 'OTHER_CROPS', label: t('crop_group:OTHER_CROPS') },
    { value: 'POTATOES_AND_YAMS', label: t('crop_group:POTATOES_AND_YAMS') },
    { value: 'SUGAR_CROPS', label: t('crop_group:SUGAR_CROPS') },
    { value: 'VEGETABLE_AND_MELONS', label: t('crop_group:VEGETABLE_AND_MELONS') },
  ];

  const progress = 33;
  const disabled = !isValid;

  const updatePAValues = (selected) => {
    console.log('updatePAValues');
    setValue('protein', 123);
  };

  return (
    <FormProvider {...methods}>
      <Form
        buttonGroup={
          <Button type={'submit'} disabled={disabled} fullLength>
            {t('common:CONTINUE')}
          </Button>
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <PageTitle
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={'Add a new crop'} //TODO: i18n
        />
        <div
          style={{
            marginBottom: '24px',
            marginTop: '8px',
          }}
        >
          <ProgressBar value={progress} />
        </div>

        <Input
          style={{ marginBottom: '40px' }}
          label={'New Crop Name'} //TODO: i18n
          // hookFormRegister={register}
          {...register('crop_common_name', { required: true })}
        />

        <Controller
          control={control}
          name={'crop_group'}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <ReactSelect
              label={'Crop group'}
              options={cropGroupOptions}
              onChange={(e) => {
                onChange(e);
                updatePAValues(e);
              }}
              value={value}
              style={{ marginBottom: '40px' }}
              // {...register("cropGroup", { required: true })}
            />
          )}
        />

        <PhysiologyAnatomyDropDown />
      </Form>
    </FormProvider>
  );
}

PureAddNewCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};

function PhysiologyAnatomyDropDown() {
  const { t } = useTranslation();
  const { register, control } = useFormContext();
  const nutrients = useWatch({
    control,
    name: FIRST_NUTRIENT_ARRAY.concat(SECOND_NUTRIENT_ARRAY),
    // defaultValue: 'default' // default value before the render
  });
  console.log(nutrients);
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.dropdownHead} onClick={() => setOpen(!open)}>
        <Semibold>{'Physiology and Anatomy'}</Semibold>
        <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
      </div>
      <div className={styles.dropdownBody} style={{ display: open ? 'flex' : 'none' }}>
        <div className={styles.paFieldContainer} style={{ marginBottom: '40px' }}>
          {FIRST_NUTRIENT_ARRAY.map((nutrient) => {
            return (
              <Input
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={t(`crop_nutrients:${NUTRIENT_DICT[nutrient]}`)}
                type={'number'}
                // hookFormRegister={register}
                {...register(nutrient)}
              />
            );
          })}
        </div>
        <Semibold className={styles.nutrientsHeader}>
          {'Nutrients in edible portion (per 100g)'}
        </Semibold>
        <div className={styles.paFieldContainer} style={{ marginBottom: '40px' }}>
          {SECOND_NUTRIENT_ARRAY.map((nutrient) => {
            return (
              <Input
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={t(`crop_nutrients:${NUTRIENT_DICT[nutrient]}`)}
                type={'number'}
                // hookFormRegister={register}
                {...register(nutrient)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
