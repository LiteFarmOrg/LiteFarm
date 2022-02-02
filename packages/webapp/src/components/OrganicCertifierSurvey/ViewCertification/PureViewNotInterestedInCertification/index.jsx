import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddLink, Main, Title } from '../../../Typography';

import Layout from '../../../Layout';
import { PureSnackbar } from '../../../PureSnackbar';

export default function PureViewNotInterestedInCertification({
  showSuccessSnackBar,
  onAddCertification,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const [showSnackBar, setShowSnackBar] = useState(showSuccessSnackBar);
  const onDismiss = () => setShowSnackBar(false);
  return (
    <Layout
      buttonGroup={
        showSnackBar ? (
          <PureSnackbar
            onDismiss={onDismiss}
            type={'success'}
            message={t('CERTIFICATION.CERTIFICATION_EXPORT.UPDATE_SUCCESS')}
          />
        ) : undefined
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Main style={{ paddingBottom: '15px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_CERTIFICATIONS')}
      </Main>
      <AddLink onClick={onAddCertification}>{t('CERTIFICATION.CERTIFICATION_EXPORT.ADD')}</AddLink>
    </Layout>
  );
}
