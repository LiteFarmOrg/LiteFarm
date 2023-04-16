/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import Button from '../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../Typography';
import Input, { getInputErrors } from '../Form/Input';
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
  HIGH_STARCH_ROOT_TUBER_CROP,
  LEGUMINOUS_CROPS,
  NUTRIENT_ARRAY,
  NUTRIENT_DICT,
  OILSEED_CROPS,
  OTHER_CROPS,
  POTATOES_AND_YAMS,
  SECOND_NUTRIENT_ARRAY,
  STIMULANT_SPICE_AROMATIC_CROPS,
  SUGAR_CROPS,
  VEGETABLE_AND_MELONS,
} from './constants';
import {
  cropGroupAverages as cropGroupAveragesSelector,
  cropsOnMyFarmSelector,
} from '../../containers/cropSlice';
import { useSelector } from 'react-redux';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import RadioGroup from '../Form/RadioGroup';
import styles from './styles.module.scss';
import Checkbox from '../Form/Checkbox';

export default function PureAddNewCrop({
  handleContinue,
  handleGoBack,
  handleCancel,
  persistedFormData,
  useHookFormPersist,
  isPhysiologyAnatomyDropDownOpen,
  imageUploader,
}) {
  const { t } = useTranslation();
  const CROP_PHOTO_URL = 'crop_photo_url';
  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    watch,
    setError,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      crop_photo_url: `https://${
        import.meta.env.VITE_DO_BUCKET_NAME
      }.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp`,
      ...persistedFormData,
    },
  });
  const { historyCancel } = useHookFormPersist(getValues);
  const allCropGroupAverages = useSelector(cropGroupAveragesSelector);
  const cropImageUrlRegister = register(CROP_PHOTO_URL, { required: true });
  const crop_photo_url = watch(CROP_PHOTO_URL);

  const farmCrops = useSelector(cropsOnMyFarmSelector);

  const uniqueCropName = () => {
    const formCommonName = getValues('crop_common_name');
    const formGenus = getValues('crop_genus');
    const formSpecie = getValues('crop_specie');

    const hasRepeatedCrops = farmCrops.some((crop) => {
      const commonNameMatch = crop.crop_common_name === formCommonName;
      const genusMatch =
        (formGenus === '' && crop.crop_genus === null) || crop.crop_genus === formGenus;
      const specieMatch =
        (formSpecie === '' && crop.crop_specie === null) || crop.crop_specie === formSpecie;
      return commonNameMatch && genusMatch && specieMatch;
    });

    return !hasRepeatedCrops;
  };

  const showDuplicateCropError = () => {
    setError(
      'crop_common_name',
      {
        type: 'custom',
        message: t('CROP_CATALOGUE.DUPLICATE_CROP'),
      },
      { shouldFocus: true },
    );
  };

  const checkUniqueCropAndSubmit = () => {
    uniqueCropName() ? handleContinue() : showDuplicateCropError();
  };

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
    {
      value: STIMULANT_SPICE_AROMATIC_CROPS,
      label: t('crop_group:STIMULANT_SPICE_AROMATIC_CROPS'),
    },
    { value: HIGH_STARCH_ROOT_TUBER_CROP, label: t('crop_group:HIGH_STARCH_ROOT_TUBER_CROP') },
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
        <Button data-cy="crop-submit" type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(checkUniqueCropAndSubmit)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={historyCancel}
        title={t('CROP.ADD_CROP')}
        value={progress}
        cancelModalTitle={t('CROP_CATALOGUE.CANCEL')}
      />
      <img
        src={crop_photo_url}
        alt={t('translation:CROP.ADD_IMAGE')}
        className={styles.circleImg}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'crop-images/default.jpg';
        }}
      />
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '24px',
          display: 'flex',
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
      >
        {React.cloneElement(imageUploader, {
          hookFormRegister: cropImageUrlRegister,
          targetRoute: 'crop',
        })}
      </div>
      <Input
        data-cy="crop-cropName"
        style={{ marginBottom: '40px' }}
        label={t('CROP_CATALOGUE.NEW_CROP_NAME')}
        hookFormRegister={register('crop_common_name', { required: true })}
        errors={getInputErrors(errors, 'crop_common_name')}
      />
      <Input
        data-cy="crop-cropGenus"
        style={{ marginBottom: '40px' }}
        label={t('CROP_CATALOGUE.GENUS')}
        hookFormRegister={register('crop_genus', {
          maxLength: { value: 255, message: t('FORM_VALIDATION.OVER_255_CHARS') },
          setValueAs: (v) => {
            return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
          },
        })}
        errors={getInputErrors(errors, 'crop_genus')}
        optional
        placeholder={t('CROP_CATALOGUE.GENUS')}
      />
      <Input
        data-cy="crop-cropSpecies"
        style={{ marginBottom: '40px' }}
        label={t('CROP_CATALOGUE.SPECIES')}
        hookFormRegister={register('crop_specie', {
          maxLength: { value: 255, message: t('FORM_VALIDATION.OVER_255_CHARS') },
          setValueAs: (v) => {
            return v.toLowerCase();
          },
        })}
        errors={getInputErrors(errors, 'crop_specie')}
        optional
        placeholder={t('CROP_CATALOGUE.SPECIES')}
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
              //TODO: uncomment updatePAValues after crop nutrition values are fixed
              // updatePAValues(e);
            }}
            value={value}
            style={{ marginBottom: '40px' }}
          />
        )}
      />

      <div style={{ marginBottom: '20px', fontSize: '16px' }}>{t('CROP_CATALOGUE.COVER_CROP')}</div>
      <div style={{ marginBottom: '20px' }}>
        <RadioGroup required hookFormControl={control} name="can_be_cover_crop" />
      </div>

      <PhysiologyAnatomyDropDown
        register={register}
        isPhysiologyAnatomyDropDownOpen={isPhysiologyAnatomyDropDownOpen}
      />
      <Checkbox
        data-cy="crop-nomination"
        label={t('CROP_CATALOGUE.NOMINATE_CROP')}
        style={{ marginTop: '40px', marginBottom: '16px' }}
        hookFormRegister={register('nominate_crop')}
        tooltipContent={t('CROP_CATALOGUE.NOMINATE_CROP_TOOLTIP')}
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
        <Semibold>{t('CROP.PHYSIOLOGY_AND_ANATOMY')}</Semibold>
        <BsChevronDown
          style={open ? { transform: 'scaleY(-1)', marginLeft: '8px' } : { marginLeft: '8px' }}
        />
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
          {t('CROP.NUTRIENTS_IN_EDIBLE_PORTION')}
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
