import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddLink, Main, Title } from '../../Typography';

import Layout from '../../Layout';

export default function PureViewNotInterestedInCertification({ onAddCertification }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Layout>
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Main style={{ paddingBottom: '15px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_CERTIFICATIONS')}
      </Main>
      <AddLink onClick={onAddCertification}>{t('CERTIFICATION.CERTIFICATION_EXPORT.ADD')}</AddLink>
    </Layout>
  );
}
