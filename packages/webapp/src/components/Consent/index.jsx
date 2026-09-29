import Button from '../Form/Button';
import clsx from 'clsx';
import styles from './consent.module.scss';
import Checkbox from '../Form/Checkbox';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';

export default function PureConsent({
  onSubmit,
  checkboxArgs,
  onGoBack,
  shortVersion,
  consent,
  disabled,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate={true}>
      <div className={styles.card}>
        <PageTitle
          title={t('CONSENT.DATA_POLICY')}
          onGoBack={onGoBack}
          classNames={{ wrapper: styles.titleWrapper }}
        />
        <section className={styles.shortVersion}>
          <h4 className={styles.shortVersionHeading}>{t('CONSENT.SHORT_VERSION')}</h4>
          <div className={styles.shortVersionText}>{shortVersion}</div>
        </section>
        <h4 className={styles.fullPolicyHeading}>{t('CONSENT.FULL_POLICY')}</h4>
        <div className={styles.policySection}>
          <div data-cy="consentPage-content" className={clsx(styles.consentTextContainer)}>
            {consent}
          </div>
          <div className={styles.endOfPolicy}>{t('CONSENT.END_OF_POLICY')}</div>
          <div className={styles.agreement}>
            <Checkbox
              data-cy="consent-agree"
              style={{ marginBottom: 0 }}
              shouldBoldSelected={false}
              classNames={{ container: styles.checkbox, label: styles.checkboxLabel }}
              {...checkboxArgs}
              label={t('CONSENT.CHECKBOX_LABEL')}
            />
            {onSubmit && (
              <Button
                data-cy="consent-continue"
                type={'submit'}
                fullLength
                disabled={disabled}
                className={styles.submitButton}
              >
                {t('CONSENT.AGREE_AND_CONTINUE')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
