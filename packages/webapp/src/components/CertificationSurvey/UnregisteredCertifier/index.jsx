import { Trans } from 'react-i18next';
import { Main } from '../../Typography';

const UnregisteredCertifierSurvey = ({ email }) => {
  return (
    <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
      <Trans
        i18nKey="CERTIFICATIONS.EMAIL_YOUR_EXPORT"
        values={{ email }}
        components={{ strong: <strong /> }}
      />
    </Main>
  );
};

export default UnregisteredCertifierSurvey;
