import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';

export default function PureCreateUserAccount({ onSignUp, email, onGoBack }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,

    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onTouched',
  });
  const NAME = 'name';
  const GENDER = 'gender';
  const BIRTHYEAR = 'birth_year';
  const PASSWORD = 'password';
  const password = watch(PASSWORD, undefined);
  const { t } = useTranslation(['translation', 'common', 'gender']);
  const title = t('CREATE_USER.TITLE');
  const {
    isValid: isPasswordValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];

  const disabled = !isDirty || !isValid || !isPasswordValid;

  const onSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    onSignUp({ ...data, email });
  };
  const onError = (data) => {};

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} type={'button'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button disabled={disabled} type={'submit'} fullLength>
            {t('CREATE_USER.CREATE_BUTTON')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.EMAIL')}
        disabled
        defaultValue={email}
      />
      <Input
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.FULL_NAME')}
        placeholder={'e.g. Juan Perez'}
        hookFormRegister={register(NAME, { required: true })}
      />
      <Controller
        control={control}
        name={GENDER}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('CREATE_USER.GENDER')}
            options={genderOptions}
            onChange={onChange}
            value={value}
            toolTipContent={t('CREATE_USER.GENDER_TOOLTIP')}
            style={{ marginBottom: '28px' }}
            defaultValue={genderOptions[3]}
          />
        )}
      />
      <Input
        label={t('CREATE_USER.BIRTH_YEAR')}
        type="number"
        hookFormRegister={register(BIRTHYEAR, {
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        toolTipContent={t('CREATE_USER.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '28px' }}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('CREATE_USER.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        optional
      />
      <Input
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.PASSWORD')}
        type={PASSWORD}
        hookFormRegister={register(PASSWORD)}
      />
      <PasswordError
        hasNoDigit={hasNoDigit}
        hasNoSymbol={hasNoSymbol}
        hasNoUpperCase={hasNoUpperCase}
        isTooShort={isTooShort}
      />
    </Form>
  );
}

PureCreateUserAccount.prototype = {
  onLogin: PropTypes.func,
};
