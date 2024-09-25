import Form from '../Form';
import Button from '../Form/Button';
import Input, { getInputErrors, integerOnKeyDown, numberOnKeyDown } from '../Form/Input';
import { isValidName } from '../Form/Input/utils';
import React, { useEffect } from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import { getFirstNameLastName } from '../../util';
import useGenderOptions from '../../hooks/useGenderOptions';
import useLanguageOptions from '../../hooks/useLanguageOptions';

export default function PureInviteUser({ onInvite, onGoBack, userFarmEmails, roleOptions = [] }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    trigger,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onTouched',
  });
  const NAME = 'name';
  const ROLE = 'role';
  const EMAIL = 'email';
  const GENDER = 'gender';
  const LANGUAGE = 'language';
  const BIRTHYEAR = 'birth_year';
  const WAGE = 'wage';
  const PHONE = 'phone_number';
  const name = watch(NAME, undefined);
  const email = watch(EMAIL, undefined);
  const role = watch(ROLE, undefined);
  const selectedRoleId = role?.value;
  useEffect(() => {
    selectedRoleId && trigger(EMAIL);
  }, [selectedRoleId]);
  const { t } = useTranslation(['translation', 'common', 'gender']);
  const title = t('INVITE_USER.TITLE');

  const genderOptions = useGenderOptions();
  const getGenderOptionLabel = (option) => t(option.label);

  const languageOptions = useLanguageOptions();

  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    data[ROLE] = data?.[ROLE]?.value;
    data[LANGUAGE] = data?.[LANGUAGE]?.value || t('INVITE_USER.DEFAULT_LANGUAGE_VALUE');
    const { first_name, last_name } = getFirstNameLastName(data.name);
    onInvite({ ...data, email, first_name, last_name });
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} type={'button'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button data-cy="invite-submit" disabled={disabled} type={'submit'} fullLength>
            {t('INVITE_USER.INVITE')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        data-cy="invite-fullName"
        style={{ marginBottom: '28px' }}
        label={t('INVITE_USER.FULL_NAME')}
        hookFormRegister={register(NAME, { required: true, validate: isValidName })}
        errors={getInputErrors(errors, NAME)}
        onBlur={(e) => {
          e.target.value = e.target.value.trim();
        }}
      />
      <Controller
        data-cy="invite-roleSelect"
        control={control}
        name={ROLE}
        render={({ field }) => (
          <ReactSelect
            {...field}
            label={t('INVITE_USER.ROLE')}
            options={roleOptions}
            style={{ marginBottom: '24px' }}
            placeholder={t('INVITE_USER.CHOOSE_ROLE')}
          />
        )}
        rules={{ required: true }}
      />
      <Input
        data-cy="invite-email"
        label={t('INVITE_USER.EMAIL')}
        hookFormRegister={register(EMAIL, {
          required: selectedRoleId !== 3,
          pattern: {
            value: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            message: t('INVITE_USER.INVALID_EMAIL_ERROR'),
          },
          validate: {
            existing: (value) => {
              if (role?.value === 3 && !value) {
                return true;
              } else {
                return (
                  (value && !userFarmEmails.includes(value.toLowerCase())) ||
                  t('INVITE_USER.ALREADY_EXISTING_EMAIL_ERROR')
                );
              }
            },
          },
        })}
        errors={getInputErrors(errors, EMAIL)}
        optional={selectedRoleId === 3}
        info={t('INVITE_USER.EMAIL_INFO')}
        style={{ marginBottom: '16px' }}
      />
      <Controller
        control={control}
        name={GENDER}
        render={({ field }) => (
          <ReactSelect
            label={t('INVITE_USER.GENDER')}
            options={genderOptions}
            toolTipContent={t('INVITE_USER.GENDER_TOOLTIP')}
            style={{ marginBottom: '24px' }}
            defaultValue={genderOptions[3]}
            getOptionLabel={getGenderOptionLabel}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name={LANGUAGE}
        render={({ field }) => (
          <ReactSelect
            label={t('INVITE_USER.LANGUAGE_OF_INVITE')}
            options={languageOptions}
            style={{ marginBottom: '24px' }}
            defaultValue={{
              value: t('INVITE_USER.DEFAULT_LANGUAGE_VALUE'),
              label: t('INVITE_USER.DEFAULT_LANGUAGE'),
            }}
            isDisabled={email === '' || email === undefined || email === null}
            {...field}
            required
          />
        )}
      />
      <Input
        data-cy="invite-birthYear"
        label={t('INVITE_USER.BIRTH_YEAR')}
        type="number"
        onKeyPress={integerOnKeyDown}
        hookFormRegister={register(BIRTHYEAR, {
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        toolTipContent={t('INVITE_USER.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        placeholder={'xxxx'}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('INVITE_USER.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        optional
      />
      <Input
        data-cy="invite-wage"
        label={t('INVITE_USER.WAGE')}
        step="0.01"
        type="number"
        onKeyPress={numberOnKeyDown}
        hookFormRegister={register(WAGE, {
          min: { value: 0, message: t('INVITE_USER.WAGE_RANGE_ERROR') },
          valueAsNumber: true,
          max: { value: 999999999, message: t('INVITE_USER.WAGE_RANGE_ERROR') },
        })}
        style={{ marginBottom: '24px' }}
        errors={errors[WAGE] && (errors[WAGE].message || t('INVITE_USER.WAGE_ERROR'))}
        optional
      />
      <Input
        data-cy="invite-phoneNumber"
        style={{ marginBottom: '24px' }}
        label={t('INVITE_USER.PHONE')}
        type={'number'}
        onKeyPress={integerOnKeyDown}
        hookFormRegister={register(PHONE)}
        errors={errors[PHONE] && (errors[PHONE].message || t('INVITE_USER.PHONE_ERROR'))}
        optional
      />
    </Form>
  );
}

PureInviteUser.prototype = {
  onLogin: PropTypes.func,
};
