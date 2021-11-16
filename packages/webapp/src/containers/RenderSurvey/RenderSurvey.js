import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { getCurrentDateLong } from '../../util/moment';

export default function RenderSurvey() {
  const { t } = useTranslation();
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
      }}
    >
      <h1 className={styles.title}>{t('SURVEY_STACK.TITLE', { certification, certifier })}</h1>
      <p className={styles.date}>
        {t('SURVEY_STACK.PRODUCED')}: {getCurrentDateLong()}
      </p>
      {Object.keys(data.questionAnswerMap).map((label) => (
        <>
          <h3 className={styles.question}>{label}</h3>
          <p className={styles.answer}>{data.questionAnswerMap[label]}</p>
        </>
      ))}
    </div>
  );
}
