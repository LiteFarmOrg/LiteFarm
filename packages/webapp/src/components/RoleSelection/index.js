import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import React, { useEffect } from 'react';
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
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { isValid },
  } = useForm();
  const ROLE = 'role';
  const OWNER_OPERATED = 'owner_operated';
  const role = watch(ROLE);

  useEffect(() => {
    setValue(ROLE, defaultRole);
    setValue(OWNER_OPERATED, defaultOwnerOperated?.toString());
  }, []);

  const disabled = !role;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button type={'submit'} fullLength disabled={disabled} onClick={redirectConsent}>
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
          },
          {
            label: t('ROLE_SELECTION.FARM_EO'),
            value: 'Extension Officer',
          },
        ]}
        required
      />
      <Title>
        {t('ROLE_SELECTION.IS_OWNER_OPERATED')} <Label sm>{t('common:OPTIONAL')}</Label>
      </Title>
      <RadioGroup hookFormControl={control} name={OWNER_OPERATED} />
    </Form>
  );
}
