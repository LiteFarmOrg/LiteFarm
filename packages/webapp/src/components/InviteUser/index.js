import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React, { useEffect } from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import { getFirstNameLastName } from '../../util';

export default function PureInviteUser({ onInvite, onGoBack, roleOptions = [] }) {
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
  const BIRTHYEAR = 'birth_year';
  const WAGE = 'wage';
  const PHONE = 'phone_number';
  const name = watch(NAME, undefined);
  const email = watch(EMAIL, undefined);
  const role = watch(ROLE, undefined);
  const selectedRoleId = role?.value;
  useEffect(() => {
    trigger(EMAIL);
  }, [selectedRoleId]);
  const { t } = useTranslation(['translation', 'common', 'gender']);
  const title = t('INVITE_USER.TITLE');
  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];

  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    data[ROLE] = data?.[ROLE]?.value;
    const { first_name, last_name } = getFirstNameLastName(data.name);
    onInvite({ ...data, email, first_name, last_name });
  };
  const onError = (data) => {
    console.log('error: ', data);
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
        hookFormRegister={register({ required: true })}
      />
      <Controller
        control={control}
        name={ROLE}
        label={t('INVITE_USER.ROLE')}
        options={roleOptions}
        style={{ marginBottom: '24px' }}
        placeholder={t('INVITE_USER.CHOOSE_ROLE')}
        as={ReactSelect}
        rules={{ required: true }}
      />
      <Input
        label={t('INVITE_USER.EMAIL')}
        name={EMAIL}
        hookFormRegister={register({
          required: selectedRoleId !== 3,
          pattern: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        })}
        errors={errors[EMAIL]?.type === 'pattern' && t('INVITE_USER.INVALID_EMAIL_ERROR')}
        optional={selectedRoleId === 3}
        info={t('INVITE_USER.EMAIL_INFO')}
        style={{ marginBottom: '16px' }}
        hookFormSetValue={setValue}
      />
      <Controller
        control={control}
        name={GENDER}
        label={t('INVITE_USER.GENDER')}
        options={genderOptions}
        toolTipContent={t('INVITE_USER.GENDER_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        defaultValue={genderOptions[3]}
        as={<ReactSelect />}
      />
      <Input
        label={t('INVITE_USER.BIRTH_YEAR')}
        type="number"
        hookFormRegister={register({
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        name={BIRTHYEAR}
        toolTipContent={t('INVITE_USER.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '24px' }}
        placeholder={'xxxx'}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('INVITE_USER.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        optional
        hookFormSetValue={setValue}
      />
      <Input
        label={t('INVITE_USER.WAGE')}
        step="0.01"
        type="number"
        hookFormRegister={register({ min: 0, valueAsNumber: true })}
        name={WAGE}
        style={{ marginBottom: '24px' }}
        errors={errors[WAGE] && (errors[WAGE].message || t('INVITE_USER.WAGE_ERROR'))}
        optional
        hookFormSetValue={setValue}
      />
      <Input
        style={{ marginBottom: '24px' }}
        label={t('INVITE_USER.PHONE')}
        type={'number'}
        hookFormRegister={register({ pattern: /\d*/ })}
        name={PHONE}
        errors={errors[PHONE] && (errors[PHONE].message || t('INVITE_USER.PHONE_ERROR'))}
        optional
        hookFormSetValue={setValue}
      />
    </Form>
  );
}

PureInviteUser.prototype = {
  onLogin: PropTypes.func,
};
