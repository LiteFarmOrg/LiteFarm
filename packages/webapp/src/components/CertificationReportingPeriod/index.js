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

const PureCertificationReportingPeriod = ({ onSubmit, onError, handleGoBack, handleCancel }) => {
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
      // crop_variety_photo_url:
      //   crop.crop_photo_url ||
      //   `https://${process.env.REACT_APP_DO_BUCKET_NAME}.nyc3.digitaloceanspaces.com//default_crop/default.jpg`,
      // ...persistedFormData,
    },
  });

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
          // hookFormRegister={certRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
        <div className={styles.dateDivider} />
        <Input
          style={{ marginBottom: '40px' }}
          label={t('CERTIFICATIONS.TO')}
          type="date"
          // hookFormRegister={certRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
      </div>

      <Main style={{ marginBottom: '24px' }}>{t('CERTIFICATIONS.WHERE_TO_SEND_DOCS')}</Main>
      <Input
        style={{ marginBottom: '40px' }}
        label={t('CERTIFICATIONS.EMAIL')}
        // defaultValue={email}
        // hookFormRegister={certRegister}
      />
    </Form>
  );
};

PureCertificationReportingPeriod.propTypes = {};

export default PureCertificationReportingPeriod;
