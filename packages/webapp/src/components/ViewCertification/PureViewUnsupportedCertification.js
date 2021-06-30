import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import Button from '../Form/Button';
import { Text } from '../Typography';

export function PureViewUnsupportedCertification({ onExport, onChangePreference }) {
  const { t } = useTranslation();
  return (
    <Layout
      buttonGroup={
        <>
          <Button fullLength onClick={onExport}>
            {t('CERTIFICATION.VIEW_CERTIFICATION.EXPORT')}
          </Button>
        </>
      }
    >
      <Text>
        {t('CERTIFICATION.VIEW_CERTIFICATION.NO_SUPPORT_FIRST')}

        <span
          style={{
            textDecorationLine: 'underline',
            color: 'var(--iconActive)',
            cursor: 'pointer',
          }}
          onClick={onChangePreference}
        >
          {t('CERTIFICATION.VIEW_CERTIFICATION.CHANGE_PREFERENCE').toLowerCase()}
        </span>

        {t('CERTIFICATION.VIEW_CERTIFICATION.NO_SUPPORT_SECOND')}
      </Text>
    </Layout>
  );
}
