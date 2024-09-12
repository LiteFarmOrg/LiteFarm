import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';
import useGenderOptions from '../../../hooks/useGenderOptions';
import useLanguageOptionsMap from '../../../hooks/useLanguageOptions';

const useLanguageOptions = (language_preference) => {
  const languageOptions = useLanguageOptionsMap();
  const languagePreferenceOptionRef = useRef();
  languagePreferenceOptionRef.current =
    languageOptions.find(({ value }) => value === language_preference) || language_preference;
  return { languageOptions, languagePreferenceOptionRef };
};

export default function PureAccount({ userFarm, onSubmit, history, isAdmin }) {
  const genderOptions = useGenderOptions();
  const { languageOptions, languagePreferenceOptionRef } = useLanguageOptions(
    userFarm.language_preference,
  );
  const { t } = useTranslation();
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
      [userFarmEnum.gender]: genderOptions.find(
        ({ value }) => value === userFarm[userFarmEnum.gender],
      ),
    },
    shouldUnregister: true,
  });
  useEffect(() => {
    setValue(userFarmEnum.language_preference, languagePreferenceOptionRef.current, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [userFarm.language_preference]);
  const disabled = !isDirty || !isValid;
  return (
    <ProfileLayout
      onSubmit={handleSubmit(onSubmit)}
      history={history}
      buttonGroup={
        <Button data-cy="account-submit" fullLength type={'submit'} disabled={disabled}>
          {t('common:SAVE')}
        </Button>
      }
    >
      <Input
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        hookFormRegister={register(userFarmEnum.first_name, {
          required: true,
          maxLength: { value: 255, message: t('PROFILE.ERROR.FIRST_NAME_LENGTH') },
        })}
        errors={errors[userFarmEnum.first_name] && errors[userFarmEnum.first_name].message}
      />
      <Input
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        hookFormRegister={register(userFarmEnum.last_name, {
          required: false,
          maxLength: { value: 255, message: t('PROFILE.ERROR.LAST_NAME_LENGTH') },
        })}
        errors={errors[userFarmEnum.last_name] && errors[userFarmEnum.last_name].message}
        optional
      />
      <Input
        label={t('PROFILE.ACCOUNT.EMAIL')}
        disabled
        hookFormRegister={register(userFarmEnum.email)}
      />
      <Input
        type={'number'}
        label={t('PROFILE.ACCOUNT.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.phone_number, {
          required: false,
          maxLength: { value: 20, message: t('PROFILE.ERROR.PHONE_NUMBER_LENGTH') },
        })}
        onKeyDown={integerOnKeyDown}
        errors={errors[userFarmEnum.phone_number] && errors[userFarmEnum.phone_number].message}
        optional
      />
      <Input
        label={t('PROFILE.ACCOUNT.USER_ADDRESS')}
        hookFormRegister={register(userFarmEnum.user_address, {
          required: false,
          maxLength: { value: 255, message: t('PROFILE.ERROR.USER_ADDRESS_LENGTH') },
        })}
        errors={errors[userFarmEnum.user_address] && errors[userFarmEnum.user_address].message}
        optional
      />
      <Input
        label={t('CREATE_USER.BIRTH_YEAR')}
        type="number"
        onKeyPress={integerOnKeyDown}
        hookFormRegister={register(userFarmEnum.birth_year, {
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        toolTipContent={t('CREATE_USER.BIRTH_YEAR_TOOLTIP')}
        errors={
          errors[userFarmEnum.birth_year] &&
          (errors[userFarmEnum.birth_year].message ||
            `${t('CREATE_USER.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        optional
      />
      <Controller
        control={control}
        name={userFarmEnum.gender}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('CREATE_USER.GENDER')}
            options={genderOptions}
            onChange={onChange}
            value={value}
            toolTipContent={t('CREATE_USER.GENDER_TOOLTIP')}
          />
        )}
      />
      <Controller
        control={control}
        name={userFarmEnum.language_preference}
        render={({ field }) => (
          <ReactSelect label={t('PROFILE.ACCOUNT.LANGUAGE')} options={languageOptions} {...field} />
        )}
      />
    </ProfileLayout>
  );
}
PureAccount.propTypes = {
  userFarm: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    user_address: PropTypes.string,
    language_preference: PropTypes.string,
    gender: PropTypes.oneOf(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    birth_year: PropTypes.number,
  }).isRequired,
  onSubmit: PropTypes.func,
};
