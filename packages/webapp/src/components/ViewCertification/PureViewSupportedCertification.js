import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import Button from '../Form/Button';
import { Text, Underlined } from '../Typography';

export function PureViewSupportedCertification({ onExport, onChangePreference }) {
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
      <Underlined onClick={onChangePreference}>
        {t('CERTIFICATION.VIEW_CERTIFICATION.CHANGE_PREFERENCE')}
      </Underlined>

      <Text>
        Place holder: You are pursuing Organic certification from: Fraser Valley Organic Producers
        Association (FVOPA)
      </Text>
    </Layout>
  );
}
