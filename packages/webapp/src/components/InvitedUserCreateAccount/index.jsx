import Form from '../Form';
import Button from '../Form/Button';
import React from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../Form/ReactSelect';
import Input, { getInputErrors, integerOnKeyDown } from '../Form/Input';
import { PasswordError } from '../Form/Errors';
import { validatePasswordWithErrors } from '../Signup/utils';

export default function PureInvitedUserCreateAccountPage({
  onSubmit,
  email,
  name,
  title,
  isNotSSO,
  buttonText,
  autoOpen,
  gender,
  birthYear,
}) {
  const NAME = 'name';
  const GENDER = 'gender';
  const BIRTHYEAR = 'birth_year';
  const PASSWORD = 'password';
  const getDefaultValues = () => {
    const defaultValues = {};
    defaultValues[NAME] = name;
    return defaultValues;
  };
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,

    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: getDefaultValues(),
  });

  const { t } = useTranslation(['translation', 'gender']);
  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);

  const onError = (error) => {
    console.log(error);
  };
  const password = watch(PASSWORD);
  const {
    isValid: isPasswordValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const onHandleSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || gender || 'PREFER_NOT_TO_SAY';
    data.email = email;
    onSubmit(data);
  };
  const disabled = !isValid || (isNotSSO && !isPasswordValid);
  return (
    <Form
      onSubmit={handleSubmit(onHandleSubmit, onError)}
      buttonGroup={
        <>
          <Button type={'submit'} disabled={disabled} fullLength data-cy="invited-createAccount">
            {buttonText}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      {isNotSSO && (
        <Input
          label={t('INVITATION.EMAIL')}
          value={email}
          disabled
          style={{ marginBottom: '24px' }}
        />
      )}
      <Input
        label={t('INVITATION.FULL_NAME')}
        hookFormRegister={register(NAME, { required: true })}
        style={{ marginBottom: '24px' }}
        errors={getInputErrors(errors, NAME)}
      />
      <Controller
        control={control}
        name={GENDER}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('INVITATION.GENDER')}
            options={genderOptions}
            onChange={onChange}
            value={value}
            toolTipContent={t('INVITATION.GENDER_TOOLTIP')}
            style={{ marginBottom: '24px' }}
            autoOpen={autoOpen}
            defaultValue={
              gender ? genderOptions.filter((option) => option.value === gender) : genderOptions[3]
            }
          />
        )}
      />
      <Input
        label={t('INVITATION.BIRTH_YEAR')}
        type="number"
        onKeyPress={integerOnKeyDown}
        hookFormRegister={register(BIRTHYEAR, {
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        toolTipContent={t('INVITATION.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('INVITATION.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        defaultValue={birthYear}
        optional
      />
      {isNotSSO && (
        <>
          <Input
            data-cy="invited-password"
            style={{ marginBottom: '28px' }}
            label={t('INVITATION.PASSWORD')}
            type={PASSWORD}
            hookFormRegister={register(PASSWORD)}
          />

          <PasswordError
            hasNoDigit={hasNoDigit}
            hasNoSymbol={hasNoSymbol}
            hasNoUpperCase={hasNoUpperCase}
            isTooShort={isTooShort}
          />
        </>
      )}
    </Form>
  );
}

PureInvitedUserCreateAccountPage.prototype = {
  onSubmit: PropTypes.func,
  email: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  isNotSSO: PropTypes.bool,
  buttonText: PropTypes.string,
};
