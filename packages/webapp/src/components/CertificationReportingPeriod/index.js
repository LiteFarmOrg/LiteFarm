import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import Form from '../Form';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import Input from '../Form/Input';
import { Error, Main } from '../Typography';
import useHookFormPersist from '../../containers/hooks/useHookFormPersist';

const FROM_DATE = 'from_date';
const TO_DATE = 'to_date';
const EMAIL = 'email';

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
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      email: defaultEmail,
      ...persistedFormData,
    },
  });
  const persistedPath = ['/certification', '/certification/survey'];

  useHookFormPersist(getValues, persistedPath);

  const fromDateRegister = register(FROM_DATE, {
    required: true,
    validate: {
      beforeToDate: (v) => v < getValues(TO_DATE),
    },
  });
  const toDateRegister = register(TO_DATE, {
    required: true,
    validate: {
      afterFromDate: (v) => v > getValues(FROM_DATE),
    },
  });
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const emailRegister = register(EMAIL, {
    required: true,
    pattern: validEmailRegex,
  });

  const progress = 33;
  return (
    <>
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
          cancelModalTitle={t('CERTIFICATIONS.FLOW_TITLE')}
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
          <DateError control={control} errorMessage={t('CERTIFICATIONS.TO_MUST_BE_AFTER_FROM')} />
        </div>

        <Main className={styles.mainText}>{t('CERTIFICATIONS.WHERE_TO_SEND_DOCS')}</Main>
        <Input
          style={{ marginBottom: '40px' }}
          label={t('CERTIFICATIONS.EMAIL')}
          hookFormRegister={emailRegister}
          errors={errors[EMAIL] && t('CERTIFICATIONS.EMAIL_ERROR')}
        />

        <Main className={styles.mainText}>{t('CERTIFICATIONS.NEXT_WE_WILL_CHECK')}</Main>
      </Form>
    </>
  );
};

const DateError = ({ control, errorMessage }) => {
  const from_date = useWatch({ control, name: FROM_DATE });
  const to_date = useWatch({ control, name: TO_DATE });
  const areDatesProperlySet =
    (from_date && to_date && from_date < to_date) || !from_date || !to_date;

  return <>{!areDatesProperlySet && <Error>{errorMessage}</Error>}</>;
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
