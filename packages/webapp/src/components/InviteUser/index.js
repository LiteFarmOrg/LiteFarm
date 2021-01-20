import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import { Title, Info } from '../Typography';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';

export default function PureInviteUser({ onInvite, onGoBack, roleOptions = [] }) {
  const { register, handleSubmit, watch, control, errors } = useForm();
  const NAME = 'name';
  const ROLE = 'role';
  const EMAIL = 'email';
  const GENDER = 'gender';
  const BIRTHYEAR = 'birth_year';
  // const PASSWORD = 'password';
  const WAGE = 'wage';
  const name = watch(NAME, undefined);
  const email = watch(EMAIL, undefined);
  const role = watch(ROLE, undefined);
  const selectedRoleId = role?.value;
  // const password = watch(PASSWORD, undefined);
  // const required = watch(NAME, false);
  const { t } = useTranslation();
  const title = t('INVITE_USER.TITLE');
  // const {
  //   isValid,
  //   hasNoSymbol,
  //   hasNoDigit,
  //   hasNoUpperCase,
  //   isTooShort,
  // } = validatePasswordWithErrors(password);
  // const inputRegister = register({ validate: () => isValid });
  // const refInput = register({ required: required });
  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];

  const disabled = !name || !role || (selectedRoleId !== 3 ? !email : false);

  const onSubmit = (data) => {
    console.log('submit: ', data);
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    data[ROLE] = data?.[ROLE]?.value;
    const i = data.name.indexOf(' ');
    const [first_name, last_name] = [data.name.slice(0,i), data.name.slice(i+1)];
    onInvite({ ...data, email, first_name, last_name });
  };
  const onError = (data) => {
    console.log("error: ", data)
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} type={'button'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button disabled={disabled} type={'submit'} fullLength>
            {t('INVITE_USER.INVITE')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        style={{ marginBottom: '28px' }}
        label={t('INVITE_USER.FULL_NAME')}
        name={NAME}
        inputRef={register({ required: true })}
      />
      <Controller
        control={control}
        name={ROLE}
        render={({ onChange, onBlur, value }) => (
          <ReactSelect
            label={t('INVITE_USER.ROLE')}
            options={roleOptions}
            onChange={onChange}
            value={value}
            style={{ marginBottom: '24px' }}
            placeholder={t('INVITE_USER.CHOOSE_ROLE')}
          />
        )}
        rules={{ required: true }}
      />
      <Input
        // style={{ marginBottom: '28px' }}
        label={t('INVITE_USER.EMAIL')}
        name={EMAIL}
        inputRef={register({ required: selectedRoleId !== 3, pattern: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ })}
        optional={selectedRoleId === 3}
      />
      <Info style={{ marginBottom: '16px' }}>{t('INVITE_USER.EMAIL_INFO')}</Info>
      <Controller
        control={control}
        name={GENDER}
        render={({ onChange, onBlur, value }) => (
          <ReactSelect
            label={t('INVITE_USER.GENDER')}
            options={genderOptions}
            onChange={onChange}
            value={value}
            toolTipContent={t('INVITE_USER.GENDER_TOOLTIP')}
            style={{ marginBottom: '24px' }}
            defaultValue={genderOptions[3]}
          />
        )}
      />
      <Input
        label={t('INVITE_USER.BIRTH_YEAR')}
        type="number"
        inputRef={register({ min: 1900, max: new Date().getFullYear(), valueAsNumber: true })}
        name={BIRTHYEAR}
        toolTipContent={t('INVITE_USER.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        placeholder={"xxxx"}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `Birth year needs to be between 1900 and ${new Date().getFullYear()}`)
        }
        optional
      />
      <Input
        label={t('INVITE_USER.WAGE')}
        type="number"
        inputRef={register({ min: 0, valueAsNumber: true, pattern: /[0-9]+(\.[0-9][0-9]?)?/ })}
        name={WAGE}
        style={{ marginBottom: '24px' }}
        errors={
          errors[WAGE] &&
          (errors[WAGE].message ||
            `Wage must be a valid, non-negative decimal number`)
        }
        optional
      />
      <Input
        style={{ marginBottom: '24px' }}
        label={t('INVITE_USER.PHONE')}
        inputRef={register({ pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ })}
        name={WAGE}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `Birth year needs to be between 1900 and ${new Date().getFullYear()}`)
        }
        optional
      />
      {/* <Input
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.PASSWORD')}
        type={PASSWORD}
        name={PASSWORD}
        inputRef={inputRegister}
      />
      <PasswordError
        hasNoDigit={hasNoDigit}
        hasNoSymbol={hasNoSymbol}
        hasNoUpperCase={hasNoUpperCase}
        isTooShort={isTooShort}
      /> */}
    </Form>
  );
}

PureInviteUser.prototype = {
  onLogin: PropTypes.func,
};
