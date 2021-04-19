import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import Infoi from '../Tooltip/Infoi';
import Input from '../Form/Input';

export default function PureCertificationSelection({
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
      <Title>{t('CERTIFICATION.CERTIFICATION_SELECTION.TITLE')}</Title>
      <Radio classes={inputClasses} label={t('CERTIFICATION.CERTIFICATION_SELECTION.ORGANIC')} />
      <Radio classes={inputClasses} label={t('CERTIFICATION.CERTIFICATION_SELECTION.PGS')} />
      <div style={{ marginBottom: '8px' }}>
        <Radio classes={inputClasses} label={t('common:OTHER')} />{' '}
        <Infoi
          placement={'bottom'}
          content={t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP')}
          style={{ transform: 'translateY(-2px)' }}
        />
      </div>
      <Input label={t('CERTIFICATION.CERTIFICATION_SELECTION.REQUEST_CERTIFICATION')} />
    </Form>
  );
}
