import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { getCurrentDateLong } from '../../util/moment';

export default function RenderSurvey() {
  const { t } = useTranslation();
  window.data = {
    questionAnswerMap: {
      'sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag': 'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
      '2sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag': 'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
    },
    certifier: { certifier_name: 'certifier_name' },
    organicCertifierSurvey: {
      requested_certification: 'requested_certification',
      requested_certifier: 'requested_certifier',
      certification: { certification_translation_key: 'ORGANIC' },
    },
  };
  const data = window.data;
  const organicCertifierSurvey = data.organicCertifierSurvey;
  const certification = data.certification
    ? t(`certifications:${data.certification.certification_translation_key}`)
    : organicCertifierSurvey.requested_certification;
  const certifier = data.certifier
    ? data.certifier.certifier_name
    : organicCertifierSurvey.requested_certifier;
  return (
    <div
      style={{
        backgroundColor: 'white',
        transform: 'translateY(-76px)',
        width: '100%',
        zIndex: 9999,
        padding: '48px',
      }}
    >
      <h1 className={styles.title}>{t('SURVEY_STACK.TITLE', { certification, certifier })}</h1>
      <p className={styles.date}>
        {t('SURVEY_STACK.PRODUCED')}: {getCurrentDateLong()}
      </p>
      {Object.keys(data.questionAnswerMap).map((label, index) => (
        <div key={index}>
          <h3 className={styles.question}>{label}</h3>
          <p className={styles.answer}>{data.questionAnswerMap[label]}</p>
        </div>
      ))}
    </div>
  );
}
