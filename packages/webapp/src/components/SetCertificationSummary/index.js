import Button from '../Form/Button';
import React from 'react';
import { Main, Semibold, Text } from '../Typography';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import Farmland from '../../assets/images/certification/Farmland.svg';
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import { colors } from '../../assets/theme';

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
      <Text style={{ padding: '8px 0' }}>{t('CERTIFICATION.SUMMARY.TITLE')}</Text>
      <Semibold style={{ color: colors.teal700 }}>
        {certificationTranslation} {t('common:FROM')} {certifierAbbreviation}
      </Semibold>
      <div>
        <img src={Farmland} style={{ width: '100%', transform: 'translateY(-12px)' }} />
      </div>

      <Main style={{ padding: '20px 0' }}>{t('CERTIFICATION.SUMMARY.GOOD_NEWS')}</Main>
      <Main>
        {t('CERTIFICATION.SUMMARY.INFORMATION')} <Leaf style={{ marginLeft: '4px' }} />
      </Main>
    </Layout>
  );
}
