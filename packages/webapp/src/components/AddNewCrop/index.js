import Button from '../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../Typography';
import Input from '../Form/Input';
//import styles from './styles.module.scss';
import Form from '../Form';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../Form/ReactSelect';
import { BsChevronDown } from 'react-icons/bs';
import {
  BEVERAGE_AND_SPICE_CROPS,
  CEREALS,
  FIRST_NUTRIENT_ARRAY,
  FRUITS_AND_NUTS,
  LEGUMINOUS_CROPS,
  NUTRIENT_ARRAY,
  NUTRIENT_DICT,
  OILSEED_CROPS,
  OTHER_CROPS,
  POTATOES_AND_YAMS,
  SECOND_NUTRIENT_ARRAY,
  SUGAR_CROPS,
  VEGETABLE_AND_MELONS,
} from './constants';
import { cropGroupAverages as cropGroupAveragesSelector } from '../../containers/cropSlice';
import { useSelector } from 'react-redux';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import RadioGroup from '../Form/RadioGroup';
import styles from '../Crop/PlantingMethod/styles.module.scss';

export default function PureAddNewCrop({
  handleContinue,
  handleGoBack,
  handleCancel,
  persistedFormData,
  useHookFormPersist,
  isPhysiologyAnatomyDropDownOpen,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...persistedFormData },
  });
  const persistedPath = ['/crop/new/add_crop_variety', '/crop/new/add_crop_variety/compliance'];
  useHookFormPersist(persistedPath, getValues);
  const allCropGroupAverages = useSelector(cropGroupAveragesSelector);

  const cropGroupOptions = [
    { value: BEVERAGE_AND_SPICE_CROPS, label: t('crop_group:BEVERAGE_AND_SPICE_CROPS') },
    { value: CEREALS, label: t('crop_group:CEREALS') },
    { value: FRUITS_AND_NUTS, label: t('crop_group:FRUITS_AND_NUTS') },
    { value: LEGUMINOUS_CROPS, label: t('crop_group:LEGUMINOUS_CROPS') },
    { value: OILSEED_CROPS, label: t('crop_group:OILSEED_CROPS') },
    { value: OTHER_CROPS, label: t('crop_group:OTHER_CROPS') },
    { value: POTATOES_AND_YAMS, label: t('crop_group:POTATOES_AND_YAMS') },
    { value: SUGAR_CROPS, label: t('crop_group:SUGAR_CROPS') },
    { value: VEGETABLE_AND_MELONS, label: t('crop_group:VEGETABLE_AND_MELONS') },
  ];

  const progress = 33;
  const disabled = !isValid;

  const updatePAValues = (selected) => {
    const cropGroupAverages = allCropGroupAverages[selected.value];
    for (const nutrient of NUTRIENT_ARRAY) {
      setValue(nutrient, cropGroupAverages[nutrient].toFixed(2));
    }
  };

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(handleContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={t('CROP.ADD_CROP')}
        value={progress}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={'New Crop Name'} //TODO: i18n
        hookFormRegister={register('crop_common_name', { required: true })}
      />

      <Controller
        control={control}
        name={'crop_group'}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            toolTipContent={t('CROP_CATALOGUE.CROP_GROUP_TOOL_TIP')}
            label={t('CROP_CATALOGUE.CROP_GROUP')}
            options={cropGroupOptions}
            onChange={(e) => {
              onChange(e);
              updatePAValues(e);
            }}
            value={value}
            style={{ marginBottom: '40px' }}
          />
        )}
      />

      <div style={{ marginBottom: '20px', fontSize: '16px' }}>{t('CROP_CATALOGUE.COVER_CROP')}</div>
      <div style={{ marginBottom: '20px' }}>
        <RadioGroup hookFormControl={control} name="can_be_cover_crop" />
      </div>

      <PhysiologyAnatomyDropDown
        register={register}
        isPhysiologyAnatomyDropDownOpen={isPhysiologyAnatomyDropDownOpen}
      />
    </Form>
  );
}

PureAddNewCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};

function PhysiologyAnatomyDropDown({ register, isPhysiologyAnatomyDropDownOpen }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(isPhysiologyAnatomyDropDownOpen);

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
                key={nutrient}
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={t(`crop_nutrients:${NUTRIENT_DICT[nutrient]}`)}
                type={'number'}
                hookFormRegister={register(nutrient, { valueAsNumber: true })}
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
                key={nutrient}
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={t(`crop_nutrients:${NUTRIENT_DICT[nutrient]}`)}
                type={'number'}
                hookFormRegister={register(nutrient, { valueAsNumber: true })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
