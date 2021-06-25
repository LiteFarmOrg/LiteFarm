import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import Button from '../Form/Button';
import { Text, Underlined } from '../Typography';

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
      <Underlined onClick={onChangePreference}>
        {t('CERTIFICATION.VIEW_CERTIFICATION.CHANGE_PREFERENCE').toLowerCase()}
      </Underlined>
      <Text>
        Place holder: You’ve requested Organic certification from Oregon Tilth. LiteFarm doesn’t
        currently generate documents for this certifier. However, we can export generic forms that
        are useful for most certifiers. You can select Export to create these forms or change your
        certification preferences to see if there are new certifiers available in your area.
      </Text>
    </Layout>
  );
}
