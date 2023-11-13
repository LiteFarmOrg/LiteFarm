import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useController, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';
import FarmImagePicker from './FarmImagePicker';
import { Label } from '../../Typography';

export default function PureFarm({ userFarm, onSubmit, history, isAdmin }) {
  const MEASUREMENT = 'units.measurement';
  const IMAGE_FILE = 'imageFile';
  const IS_IMAGE_REMOVED = 'isImageRemoved';

  const { t } = useTranslation();

  const measurementOptionMap = {
    metric: { label: t('PROFILE.FARM.METRIC'), value: 'metric' },
    imperial: { label: t('PROFILE.FARM.IMPERIAL'), value: 'imperial' },
  };
  const options = Object.values(measurementOptionMap);
  const defaultMeasurementOption = measurementOptionMap[userFarm.units.measurement];
  const {
    register,
    resetField,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      ...userFarm,
      units: { measurement: defaultMeasurementOption },
      [IS_IMAGE_REMOVED]: false,
      [IMAGE_FILE]: null,
    },
    shouldUnregister: true,
  });

  const { farm_image_thumbnail_url: thumbnailUrl } = userFarm;
  const { field } = useController({ control, name: IMAGE_FILE });

  const disabled = !isDirty || !isValid;

  const handleSelectImage = (imageFile) => {
    field.onChange(imageFile);
    resetField(IS_IMAGE_REMOVED);
  };

  const handleRemoveImage = () => {
    setValue(IS_IMAGE_REMOVED, true, { shouldDirty: true });
    resetField(IMAGE_FILE);
  };

  const isImageRemoved = getValues(IS_IMAGE_REMOVED);

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
        <input type="checkbox" style={{ display: 'none' }} {...register(IS_IMAGE_REMOVED)} />
        <Label>{t('PROFILE.FARM.FARM_IMAGE')}</Label>
        <FarmImagePicker
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
          thumbnailUrl={thumbnailUrl}
          isImageRemoved={isImageRemoved}
        />
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
