import Form from '../Form';
import Button from '../Form/Button';
import React from 'react';
import { Label, Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';
import { useForm } from 'react-hook-form';
import RadioGroup from '../Form/RadioGroup';

export default function PureRoleSelection({
  onSubmit,
  title,
  inputs,
  inputClasses = {},
  redirectConsent,
  onGoBack,
  defaultRole,
  defaultOwnerOperated,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const ROLE = 'role';
  const OWNER_OPERATED = 'owner_operated';
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      [ROLE]: defaultRole,
      [OWNER_OPERATED]: defaultOwnerOperated,
    },
  });

  const role = watch(ROLE);

  const disabled = !role;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button data-cy='roleSelection-continue' type={'submit'} fullLength disabled={disabled} onClick={redirectConsent}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <PageTitle onGoBack={onGoBack} title={title} style={{ marginBottom: '20px' }} />
      <RadioGroup
        hookFormControl={control}
        name={ROLE}
        radios={[
          {
            label: t('ROLE_SELECTION.FARM_OWNER'),
            value: 'Owner',
          },
          {
            label: t('ROLE_SELECTION.FARM_MANAGER'),
            value: 'Manager',
            id:'Manager',
          },
          {
            label: t('ROLE_SELECTION.FARM_EO'),
            value: 'Extension Officer',
          },
        ]}
        required
        data-cy='roleSelection-role'
      />
      <Title>
        {t('ROLE_SELECTION.IS_OWNER_OPERATED')} <Label sm>{t('common:OPTIONAL')}</Label>
      </Title>
      <RadioGroup hookFormControl={control} name={OWNER_OPERATED} />
    </Form>
  );
}
