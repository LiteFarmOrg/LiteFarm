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
import { Error, Main } from '../Typography';
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

  const fromDateRegister = register(FROM_DATE, {
    required: true,
    valueAsDate: true,
    validate: {
      beforeToDate: (v) => v < watch(TO_DATE),
    },
  });
  const toDateRegister = register(TO_DATE, {
    required: true,
    valueAsDate: true,
    validate: {
      afterFromDate: (v) => v > watch(FROM_DATE),
    },
  });
  const emailRegister = register(EMAIL, { required: true });
  const areNotDatesProperlySet =
    !isNaN(watch(FROM_DATE)) && !isNaN(watch(FROM_DATE)) && watch(FROM_DATE) >= watch(TO_DATE);

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

      <Main className={styles.mainText}>{t('CERTIFICATIONS.SELECT_REPORTING_PERIOD')}</Main>

      <div className={styles.dateInput}>
        <div className={styles.dateContainer}>
          <Input
            label={t('CERTIFICATIONS.FROM')}
            type="date"
            hookFormRegister={fromDateRegister}
            classes={{
              container: { flex: '1' },
            }}
          />
          <div className={styles.dateDivider} />
          <Input
            label={t('CERTIFICATIONS.TO')}
            type="date"
            hookFormRegister={toDateRegister}
            classes={{
              container: { flex: '1' },
            }}
          />
        </div>
        {areNotDatesProperlySet && <Error>{t('CERTIFICATIONS.TO_MUST_BE_AFTER_FROM')}</Error>}
      </div>

      <Main className={styles.mainText}>{t('CERTIFICATIONS.WHERE_TO_SEND_DOCS')}</Main>
      <Input
        style={{ marginBottom: '40px' }}
        label={t('CERTIFICATIONS.EMAIL')}
        hookFormRegister={emailRegister}
      />

      <Main className={styles.mainText}>{t('CERTIFICATIONS.NEXT_WE_WILL_CHECK')}</Main>
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
