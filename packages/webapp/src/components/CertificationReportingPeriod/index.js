import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Form from '../Form';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Input from '../Form/Input';
import { Main } from '../Typography';
import useHookFormPersist from '../../containers/hooks/useHookFormPersist';

const PureCertificationReportingPeriod = ({
  onSubmit,
  onError,
  handleGoBack,
  handleCancel,
  persistedFormData,
  defaultEmail,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      email: defaultEmail,
      ...persistedFormData,
    },
  });
  const persistedPath = [];

  useHookFormPersist(persistedPath, getValues);

  const FROM_DATE = 'from_date';
  const TO_DATE = 'to_date';
  const EMAIL = 'email';

  const fromDateRegister = register(FROM_DATE, { required: true });
  const toDateRegister = register(TO_DATE, { required: true });
  const emailRegister = register(EMAIL, { required: true });

  const progress = 33;
  return (
    <Form
      buttonGroup={
        <Button disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={t('CERTIFICATIONS.EXPORT_DOCS')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('CERTIFICATIONS.SELECT_REPORTING_PERIOD')}</Main>

      <div className={styles.dateContainer}>
        <Input
          style={{ marginBottom: '40px' }}
          label={t('CERTIFICATIONS.FROM')}
          type="date"
          hookFormRegister={fromDateRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
        <div className={styles.dateDivider} />
        <Input
          style={{ marginBottom: '40px' }}
          label={t('CERTIFICATIONS.TO')}
          type="date"
          hookFormRegister={toDateRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
      </div>

      <Main style={{ marginBottom: '24px' }}>{t('CERTIFICATIONS.WHERE_TO_SEND_DOCS')}</Main>
      <Input
        style={{ marginBottom: '40px' }}
        label={t('CERTIFICATIONS.EMAIL')}
        hookFormRegister={emailRegister}
      />
    </Form>
  );
};

PureCertificationReportingPeriod.propTypes = {
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  persistedFormData: PropTypes.object,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
  defaultEmail: PropTypes.string,
};

export default PureCertificationReportingPeriod;
