import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import RevokeUserAccessModal from '../../Modals/RevokeUserAccessModal';
import InvalidRevokeUserAccessModal from '../../Modals/InvalidRevokeUserAccessModal';
import Checkbox from '../../Form/Checkbox';
import { useSelector } from 'react-redux';
import { userFarmsByFarmSelector } from '../../../containers/userFarmSlice';

export default function PureEditUser({
  userFarm,
  onUpdate,
  history,
  isAdmin,
  onActivate,
  onRevoke,
  onInvite,
  userFarmEmails,
  isCurrentUser,
}) {
  const { t } = useTranslation();
  const ROLE = 'role_id';
  const WAGE = 'wage.amount';
  const EMAIL = 'email';
  const GENDER = 'gender';
  const LANGUAGE = 'language';
  const BIRTHYEAR = 'birth_year';
  const PHONE = 'phone_number';
  const dropDownMap = {
    1: t('role:OWNER'),
    2: t('role:MANAGER'),
    3: t('role:WORKER'),
    5: t('role:EXTENSION_OFFICER'),
  };
  const userFarms = useSelector(userFarmsByFarmSelector);
  const adminRoles = [1, 2, 5];

  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];
  const languageOptions = [
    { value: 'en', label: t('PROFILE.ACCOUNT.ENGLISH') },
    { value: 'es', label: t('PROFILE.ACCOUNT.SPANISH') },
    { value: 'pt', label: t('PROFILE.ACCOUNT.PORTUGUESE') },
    { value: 'fr', label: t('PROFILE.ACCOUNT.FRENCH') },
  ];
  const isPseudoUser = userFarm.role_id === 4;
  const roleOptions = Object.keys(dropDownMap).map((role_id) => ({
    value: role_id,
    label: dropDownMap[role_id],
  }));
  const roleOption = isPseudoUser
    ? { value: 3, label: dropDownMap[3] }
    : { value: userFarm.role_id, label: dropDownMap[userFarm.role_id] };

  const getDefaultGender = () => {
    switch (userFarm.gender) {
      case 'MALE':
        return genderOptions[0];
      case 'FEMALE':
        return genderOptions[1];
      case 'OTHER':
        return genderOptions[2];
      case 'PREFER_NOT_TO_SAY':
        return genderOptions[3];
    }
  };

  const isUserLastAdmin = () => {
    if (userFarm.status === 'Invited') return false;

    let adminCount = 0;
    userFarms.forEach((user) => {
      if (adminRoles.includes(user.role_id) && user.status === 'Active') adminCount++;
    });

    return adminCount === 1 && adminRoles.includes(userFarm.role_id);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    clearErrors,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...userFarm, role_id: roleOption, gender: getDefaultGender() },
    shouldUnregister: true,
  });

  const [showRevokeUserAccessModal, setShowRevokeUserAccessModal] = useState();
  const [showInvalidRevokeUserAccessModal, setShowInvalidRevokeUserAccessModal] = useState(false);
  const [shouldInvitePseudoUser, setShouldInvitePseudoUser] = useState(false);
  const onInviteUserCheckboxClick = () => {
    setValue(EMAIL, shouldInvitePseudoUser ? userFarm.email : '');
    setShouldInvitePseudoUser((shouldInvitePseudoUser) => !shouldInvitePseudoUser);
    clearErrors(EMAIL);
  };
  const email = watch(EMAIL);
  const role = watch(ROLE);
  const wage = watch(WAGE);
  const disabled = useMemo(
    () =>
      !isValid ||
      (shouldInvitePseudoUser && (!email || !role?.label)) ||
      (!shouldInvitePseudoUser &&
        !isPseudoUser &&
        Number(role?.value) === userFarm.role_id &&
        (wage || 0) === Number(userFarm.wage?.amount)) ||
      (!shouldInvitePseudoUser && isPseudoUser && (wage || 0) === Number(userFarm.wage?.amount)),
    [
      isValid,
      shouldInvitePseudoUser,
      email,
      role,
      userFarm.wage?.amount,
      wage,
      Object.keys(errors).length,
    ],
  );

  const onSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    data[ROLE] = data?.[ROLE]?.value;
    data[LANGUAGE] = data?.[LANGUAGE]?.value || t('INVITE_USER.DEFAULT_LANGUAGE_VALUE');
    onInvite({ ...data, email });
  };

  return (
    <Form
      onSubmit={handleSubmit(shouldInvitePseudoUser ? onSubmit : onUpdate, (e) => console.log(e))}
      buttonGroup={
        <>
          {userFarm.status === 'Inactive' ? (
            <Button type={'button'} onClick={onActivate} fullLength color={'success'}>
              {t('PROFILE.PEOPLE.RESTORE_ACCESS')}
            </Button>
          ) : (
            <Button
              type={'button'}
              onClick={() => {
                isUserLastAdmin()
                  ? setShowInvalidRevokeUserAccessModal(true)
                  : setShowRevokeUserAccessModal(true);
              }}
              fullLength
              color={'secondary'}
            >
              {t('PROFILE.PEOPLE.REVOKE_ACCESS')}
            </Button>
          )}
          <Button fullLength type={'submit'} disabled={disabled}>
            {shouldInvitePseudoUser ? t('INVITE_USER.INVITE') : t('common:SAVE')}
          </Button>
        </>
      }
    >
      <PageTitle
        style={{ marginBottom: '32px' }}
        onGoBack={() => history.back()}
        title={t('PROFILE.ACCOUNT.EDIT_USER')}
      />
      <Input
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        value={userFarm.first_name}
        style={{ marginBottom: '24px' }}
        disabled
      />
      <Input
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        value={userFarm.last_name}
        style={{ marginBottom: '24px' }}
        disabled
      />
      <Input
        label={t('INVITE_USER.EMAIL')}
        hookFormRegister={register(EMAIL, {
          required: true,
          pattern: {
            value: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: t('INVITE_USER.INVALID_EMAIL_ERROR'),
          },
          validate: {
            existing: (value) => {
              if (!shouldInvitePseudoUser) {
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
        disabled={!shouldInvitePseudoUser}
        style={{ marginBottom: '24px' }}
      />
      {(!isPseudoUser || shouldInvitePseudoUser) && (
        <Controller
          control={control}
          name={ROLE}
          render={({ field }) => (
            <ReactSelect
              {...field}
              isDisabled={!isAdmin || isCurrentUser}
              label={t('INVITE_USER.ROLE')}
              options={roleOptions}
              style={{ marginBottom: '24px' }}
              placeholder={t('INVITE_USER.CHOOSE_ROLE')}
            />
          )}
          rules={{ required: true }}
          disabled={!isAdmin || isCurrentUser}
        />
      )}
      {isPseudoUser && shouldInvitePseudoUser && (
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
              {...field}
              optional
            />
          )}
        />
      )}
      {isPseudoUser && shouldInvitePseudoUser && (
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
              {...field}
              required
            />
          )}
        />
      )}
      {isPseudoUser && shouldInvitePseudoUser && (
        <Input
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
      )}
      <Input
        label={t('INVITE_USER.WAGE')}
        step="0.01"
        type="number"
        hookFormRegister={register(WAGE, { min: 0, valueAsNumber: true })}
        style={{ marginBottom: '24px' }}
        errors={errors[WAGE] && (errors[WAGE].message || t('INVITE_USER.WAGE_ERROR'))}
        optional
      />
      {isPseudoUser && shouldInvitePseudoUser && (
        <Input
          style={{ marginBottom: '24px' }}
          label={t('INVITE_USER.PHONE')}
          type={'number'}
          onKeyPress={integerOnKeyDown}
          hookFormRegister={register(PHONE)}
          errors={errors[PHONE] && (errors[PHONE].message || t('INVITE_USER.PHONE_ERROR'))}
          optional
        />
      )}
      {isPseudoUser && (
        <Checkbox
          label={t('PROFILE.ACCOUNT.CONVERT_TO_HAVE_ACCOUNT')}
          value={shouldInvitePseudoUser}
          onChange={onInviteUserCheckboxClick}
        />
      )}
      {showRevokeUserAccessModal && (
        <RevokeUserAccessModal
          dismissModal={() => {
            setShowRevokeUserAccessModal(false);
          }}
          onRevoke={onRevoke}
        />
      )}
      {showInvalidRevokeUserAccessModal && (
        <InvalidRevokeUserAccessModal
          dismissModal={() => {
            setShowInvalidRevokeUserAccessModal(false);
          }}
        />
      )}
    </Form>
  );
}
PureEditUser.propTypes = {
  userFarm: PropTypes.object,

  onSubmit: PropTypes.func,
};
