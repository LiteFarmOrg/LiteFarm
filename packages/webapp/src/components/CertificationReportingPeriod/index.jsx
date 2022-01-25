import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import Form from '../Form';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Main } from '../Typography';
import DateRangePicker from '../Form/DateRangePicker';
import { addDaysToDate } from '../../util/moment';

const EMAIL = 'email';

const PureCertificationReportingPeriod = ({
  onSubmit,
  onError,
  handleGoBack,
  handleCancel,
  persistedFormData,
  useHookFormPersist,
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
      // email: defaultEmail,
      ...persistedFormData,
    },
  });
  const persistedPath = ['/certification/survey'];

  const { historyCancel } = useHookFormPersist(getValues, persistedPath);

  // const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  // const emailRegister = register(EMAIL, {
  //   required: true,
  //   pattern: validEmailRegex,
  // });

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
          onCancel={historyCancel}
          title={t('CERTIFICATIONS.EXPORT_DOCS')}
          cancelModalTitle={t('CERTIFICATIONS.FLOW_TITLE')}
          value={progress}
        />

        <Main className={styles.mainText}>{t('CERTIFICATIONS.SELECT_REPORTING_PERIOD')}</Main>

        <DateRangePicker
          register={register}
          control={control}
          getValues={getValues}
          style={{ marginBottom: '40px' }}
          fromProps={{ max: addDaysToDate(new Date(), -1, { toUTC: false }) }}
        />

        {/* <Main className={styles.mainText}>{t('CERTIFICATIONS.WHERE_TO_SEND_DOCS')}</Main>
        <Input
          style={{ marginBottom: '40px' }}
          label={t('CERTIFICATIONS.EMAIL')}
          hookFormRegister={emailRegister}
          errors={errors[EMAIL] && t('CERTIFICATIONS.EMAIL_ERROR')}
        /> */}

        <Main className={styles.mainText}>{t('CERTIFICATIONS.NEXT_WE_WILL_CHECK')}</Main>
      </Form>
    </>
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
