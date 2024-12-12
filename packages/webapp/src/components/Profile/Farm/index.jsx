/*
 *  Copyright 2024 LiteFarm.org
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

import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useController, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';
import { Label } from '../../Typography';
import ImagePicker from '../../ImagePicker';
import useMediaWithAuthentication from '../../../containers/hooks/useMediaWithAuthentication';

export default function PureFarm({ userFarm, onSubmit, history, isAdmin }) {
  const MEASUREMENT = 'units.measurement';
  const IMAGE_FILE = 'imageFile';
  const SHOULD_REMOVE_IMAGE = 'shouldRemoveImage';

  const { t } = useTranslation();

  const measurementOptionMap = {
    metric: { label: t('PROFILE.FARM.METRIC'), value: 'metric' },
    imperial: { label: t('PROFILE.FARM.IMPERIAL'), value: 'imperial' },
  };
  const options = Object.values(measurementOptionMap);
  const defaultMeasurementOption = measurementOptionMap[userFarm.units.measurement];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      ...userFarm,
      units: { measurement: defaultMeasurementOption },
      [SHOULD_REMOVE_IMAGE]: false,
      [IMAGE_FILE]: null,
    },
    shouldUnregister: true,
  });

  const { farm_image_thumbnail_url: thumbnailUrl } = userFarm;
  const { field: imageFileField } = useController({ control, name: IMAGE_FILE });
  const { mediaUrl: authenticatedImageUrl, isLoading } = useMediaWithAuthentication({
    fileUrls: [thumbnailUrl],
  });

  const disabled = !isDirty || !isValid;

  const handleSelectImage = (imageFile) => {
    imageFileField.onChange(imageFile);
    setValue(SHOULD_REMOVE_IMAGE, false);
  };

  const handleRemoveImage = () => {
    // Only mark the image as being removed when there is an existing uploaded image
    if (thumbnailUrl) setValue(SHOULD_REMOVE_IMAGE, true);
    imageFileField.onChange(null);
  };

  return (
    <ProfileLayout
      onSubmit={handleSubmit(onSubmit)}
      history={history}
      buttonGroup={
        isAdmin && (
          <Button fullLength type={'submit'} disabled={disabled}>
            {t('common:SAVE')}
          </Button>
        )
      }
    >
      <Input
        label={t('PROFILE.FARM.FARM_NAME')}
        hookFormRegister={register(userFarmEnum.farm_name, {
          required: true,
          maxLength: {
            value: 255,
            message: t('PROFILE.ERROR.FARM_NAME_LENGTH'),
          },
        })}
        disabled={!isAdmin}
        errors={errors[userFarmEnum.farm_name] && errors[userFarmEnum.farm_name].message}
      />
      <Input
        label={t('PROFILE.FARM.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.farm_phone_number, {
          required: false,
          maxLength: {
            value: 20,
            message: t('PROFILE.ERROR.PHONE_NUMBER_LENGTH'),
          },
        })}
        errors={
          errors[userFarmEnum.farm_phone_number] && errors[userFarmEnum.farm_phone_number].message
        }
        type={'number'}
        onKeyDown={integerOnKeyDown}
        disabled={!isAdmin}
        optional
      />
      <Input label={t('PROFILE.FARM.ADDRESS')} value={userFarm.address} disabled />
      <Controller
        control={control}
        name={MEASUREMENT}
        render={({ field }) => (
          <ReactSelect
            isDisabled={!isAdmin}
            {...field}
            label={t('PROFILE.FARM.UNITS')}
            options={options}
          />
        )}
      />
      <Input label={t('PROFILE.FARM.CURRENCY')} value={userFarm.units.currency} disabled />

      <div>
        <input type="checkbox" style={{ display: 'none' }} {...register(SHOULD_REMOVE_IMAGE)} />
        <Label>{t('PROFILE.FARM.FARM_IMAGE')}</Label>
        {!isLoading && (
          <ImagePicker
            defaultUrl={authenticatedImageUrl}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
          />
        )}
      </div>
    </ProfileLayout>
  );
}

PureFarm.propTypes = {
  userFarm: PropTypes.shape({
    farm_name: PropTypes.string,
    farm_phone_number: PropTypes.string,
    farm_image_thumbnail_url: PropTypes.string,
    address: PropTypes.string,
    units: PropTypes.shape({
      measurement: PropTypes.string,
      currency: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func,
};
