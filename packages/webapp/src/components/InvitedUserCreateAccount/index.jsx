import Form from '../Form';
import Button from '../Form/Button';
import React from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors } from '../Form/Input';
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
}) {
  const NAME = 'name';
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
    setValue,

    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: getDefaultValues(),
  });

  const { t } = useTranslation();

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
