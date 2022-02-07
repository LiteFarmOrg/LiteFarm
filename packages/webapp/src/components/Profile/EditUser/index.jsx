import Input from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';

export default function PureEditUser({ userFarm, onSubmit, history, isAdmin, onActivate, onRevoke }) {
  const { t } = useTranslation();
  const ROLE = 'role_id';
  const WAGE = 'wage.amount';
  const dropDownMap = {
    1: t('role:OWNER'),
    2: t('role:MANAGER'),
    3: t('role:WORKER'),
    5: t('role:EXTENSION_OFFICER'),
  };
  const roleOptions = Object.keys(dropDownMap).map(role_id => ({ value: role_id, label: dropDownMap[role_id] }));
  const roleOption = { value: userFarm.role_id, label: dropDownMap[userFarm.role_id] };

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...userFarm, role_id: roleOption },
    shouldUnregister: true,
  });
  const disabled = !isDirty || !isValid;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={isAdmin && <>
        {
          userFarm.status === 'Inactive' ?
            <Button onClick={onActivate} fullLength color={'success'}>{t('PROFILE.PEOPLE.RESTORE_ACCESS')}</Button>
            : <Button onClick={onRevoke} fullLength color={'secondary'}>{t('PROFILE.PEOPLE.REVOKE_ACCESS')}</Button>}
        <Button fullLength type={'submit'} disabled={disabled}>
          {t('common:SAVE')}
        </Button>
      </>
      }
    >
      <PageTitle style={{ marginBottom: '32px' }} onGoBack={() => history.goBack()}
                 title={t('PROFILE.ACCOUNT.EDIT_USER')} />
      <Input
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        value={userFarm.first_name}
        style={{ marginBottom: '24px' }}
        disabled
      />
      <Input
        label={t('PROFILE.ACCOUNT.EMAIL')}
        value={userFarm.email}
        style={{ marginBottom: '24px' }}

        disabled
      />
      <Input
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        value={userFarm.last_name}
        style={{ marginBottom: '24px' }}

        disabled
      />
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
      <Input
        label={t('INVITE_USER.WAGE')}
        step='0.01'
        type='number'
        hookFormRegister={register(WAGE, { min: 0, valueAsNumber: true })}
        style={{ marginBottom: '40px' }}
        errors={errors[WAGE] && (errors[WAGE].message || t('INVITE_USER.WAGE_ERROR'))}
        optional
      />
    </Form>
  );
}
PureEditUser.propTypes = {
  userFarm: PropTypes.object,

  onSubmit: PropTypes.func,
};
