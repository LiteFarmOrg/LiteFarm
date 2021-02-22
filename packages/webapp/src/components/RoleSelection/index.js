import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';

export default function PureRoleSelection({
  onSubmit,
  title,
  inputs,
  inputClasses = {},
  redirectConsent,
  onGoBack,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength onClick={redirectConsent}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Title>{title}</Title>
      <Radio classes={inputClasses} {...inputs[0]} />
      <Radio classes={inputClasses} {...inputs[1]} />
      <Radio classes={inputClasses} {...inputs[2]} />
    </Form>
  );
}
