import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';
import { VscWarning } from 'react-icons/vsc';

const UnregisteredCertifierSurvey = ({ email }) => {
  const { t } = useTranslation();

  return (
    <>
      <Semibold
        style={{
          color: colors.brown700,
          marginBottom: '16px',
          display: 'inline-flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <VscWarning style={{ fontSize: '20px' }} />
        {t('CERTIFICATIONS.UH_OH')}
      </Semibold>

      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.COULD_NOT_CONTACT_CERTIFIER')}
      </Main>

      <Semibold>{email}</Semibold>
    </>
  );
};

UnregisteredCertifierSurvey.propTypes = {};

export default UnregisteredCertifierSurvey;
