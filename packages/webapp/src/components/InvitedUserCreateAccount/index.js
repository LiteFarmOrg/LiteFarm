import Form from '../Form';
import Button from '../Form/Button';
import React from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../Form/ReactSelect';
import Input from '../Form/Input';
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
  const {
    register,
    handleSubmit,
    watch,
    control,
    errors,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    mode: 'onTouched',
  });
  const NAME = 'name';
  const GENDER = 'gender';
  const BIRTHYEAR = 'birth_year';
  const PASSWORD = 'password';
  const EMAIL = 'email';
  const { t } = useTranslation();
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
  const inputRegister = register();
  const onHandleSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || gender || 'PREFER_NOT_TO_SAY';
    onSubmit(data);
  };
  const disabled = !isValid || (isNotSSO && !isPasswordValid);
  return (
    <Form
      onSubmit={handleSubmit(onHandleSubmit, onError)}
      buttonGroup={
        <>
          <Button type={'submit'} disabled={disabled} fullLength>
            {buttonText}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      {isNotSSO && (
        <Input
          label={t('INVITATION.EMAIL')}
          inputRef={register({ required: true, pattern: validEmailRegex })}
          name={EMAIL}
          defaultValue={email}
          disabled
          style={{ marginBottom: '24px' }}
        />
      )}
      <Input
        label={t('INVITATION.FULL_NAME')}
        inputRef={register({ required: true })}
        name={NAME}
        defaultValue={name}
        style={{ marginBottom: '24px' }}
      />
      <Controller
        control={control}
        name={GENDER}
        render={({ onChange, onBlur, value }) => (
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
        inputRef={register({ min: 1900, max: new Date().getFullYear(), valueAsNumber: true })}
        name={BIRTHYEAR}
        toolTipContent={t('INVITATION.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('INVITATION.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        defaultValue={birthYear}
        optional
        hookFormSetValue={setValue}
      />
      {isNotSSO && (
        <>
          <Input
            style={{ marginBottom: '28px' }}
            label={t('INVITATION.PASSWORD')}
            type={PASSWORD}
            name={PASSWORD}
            inputRef={inputRegister}
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
