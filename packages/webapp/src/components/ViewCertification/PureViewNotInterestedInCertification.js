import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import Button from '../Form/Button';
import { AddLink, Text } from '../Typography';

export function PureViewNotInterestedInCertification({ onExport, onAddCertification }) {
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
      <AddLink onClick={onAddCertification}>
        {t('CERTIFICATION.VIEW_CERTIFICATION.ADD_CERTIFICATION')}
      </AddLink>
      <Text>place holder: You are not currently pursuing any certifications.</Text>
    </Layout>
  );
}
