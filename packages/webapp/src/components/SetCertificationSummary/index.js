import Button from '../Form/Button';
import React from 'react';
import { Main, Semibold, Text } from '../Typography';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import { ReactComponent as Farmland } from '../../assets/images/certification/Farmland.svg';
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';

export default function PureSetCertificationSummary({
  onSubmit,
  certificationTranslation,
  certifierAbbreviation,
  history,
  onGoBack,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Layout
      onSubmit={onSubmit}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Text>{t('CERTIFICATION.SUMMARY.TITLE')}</Text>
      <Semibold>
        {certificationTranslation} {t('common:FROM')} {certifierAbbreviation}
      </Semibold>
      <Farmland />
      <Main>{t('CERTIFICATION.SUMMARY.GOOD_NEWS')}</Main>
      <Main>
        {t('CERTIFICATION.SUMMARY.INFORMATION')} <Leaf />
      </Main>
    </Layout>
  );
}
