import Input, { getInputErrors } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import RevokeUserAccessModal from '../../Modals/RevokeUserAccessModal';
import Checkbox from '../../Form/Checkbox';

export default function PureEditUser({
  userFarm,
  onUpdate,
  history,
  isAdmin,
  onActivate,
  onRevoke,
  onInvite,
  userFarmEmails,
}) {
  const { t } = useTranslation();
  const ROLE = 'role_id';
  const WAGE = 'wage.amount';
  const EMAIL = 'email';
  const dropDownMap = {
    1: t('role:OWNER'),
    2: t('role:MANAGER'),
    3: t('role:WORKER'),
    5: t('role:EXTENSION_OFFICER'),
  };
  const roleOptions = Object.keys(dropDownMap).map((role_id) => ({
    value: role_id,
    label: dropDownMap[role_id],
  }));
  const roleOption = { value: userFarm.role_id, label: dropDownMap[userFarm.role_id] };

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
    defaultValues: { ...userFarm, role_id: roleOption },
    shouldUnregister: true,
  });

  const [showRevokeUserAccessModal, setShowRevokeUserAccessModal] = useState();
  const isPseudoUser = userFarm.role_id === 4;
  const [shouldInvitePseudoUser, setShouldInvitePseudoUser] = useState(false);
  const onInviteUserCheckboxClick = () => {
    setValue(EMAIL, shouldInvitePseudoUser ? userFarm.email : '');
    setShouldInvitePseudoUser((shouldInvitePseudoUser) => !shouldInvitePseudoUser);
    clearErrors(EMAIL);
  };
  const email = watch(EMAIL);
  const role = watch(ROLE);
  const wage = watch(WAGE);
  const disabled =
    !isValid ||
    (shouldInvitePseudoUser && (!email || !role?.label)) ||
    (!shouldInvitePseudoUser &&
      !isPseudoUser &&
      Number(role?.value) === userFarm.role_id &&
      (wage || 0) === Number(userFarm.wage?.amount)) ||
    (!shouldInvitePseudoUser && isPseudoUser && (wage || 0) === Number(userFarm.wage?.amount));

  return (
    <Form
      onSubmit={handleSubmit(shouldInvitePseudoUser ? onInvite : onUpdate)}
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
                setShowRevokeUserAccessModal(true);
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
            existing: (value) =>
              (value && !userFarmEmails.includes(value)) ||
              t('INVITE_USER.ALREADY_EXISTING_EMAIL_ERROR'),
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
              label={t('INVITE_USER.ROLE')}
              options={roleOptions}
              style={{ marginBottom: '24px' }}
              placeholder={t('INVITE_USER.CHOOSE_ROLE')}
            />
          )}
          rules={{ required: true }}
        />
      )}
      <Input
        label={t('INVITE_USER.WAGE')}
        step="0.01"
        type="number"
        hookFormRegister={register(WAGE, { min: 0, valueAsNumber: true })}
        style={{ marginBottom: '40px' }}
        errors={errors[WAGE] && (errors[WAGE].message || t('INVITE_USER.WAGE_ERROR'))}
        optional
      />
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
    </Form>
  );
}
PureEditUser.propTypes = {
  userFarm: PropTypes.object,

  onSubmit: PropTypes.func,
};
