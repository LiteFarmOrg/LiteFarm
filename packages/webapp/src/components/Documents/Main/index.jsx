import Layout from '../../Layout';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Checkbox from '../../Form/Checkbox';
import CertifierSelectionMenuItem
  from '../../OrganicCertifierSurvey/CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';

function MainDocumentView({ onRetire, onUpdate, onGoBack, document, imageComponent }) {
  const { t } = useTranslation();
  const isArchived = document.valid_until !== null && new Date(document.valid_until) < new Date();
  const validUntil = document.valid_until?.split('T')[0];
  return (
    <Layout
      buttonGroup={
        <>
          <Button color={'secondary'} onClick={onRetire} disabled={isArchived} fullLength>
            {t('DOCUMENTS.ARCHIVE')}
          </Button>
          <Button color={'primary'} onClick={onUpdate} fullLength>
            {t('common:EDIT')}
          </Button>
        </>
      }
    >
      <PageTitle onGoBack={onGoBack} title={document.name} style={{ marginBottom: '24px' }} />
      <Input
        label={t('DOCUMENTS.ADD.DOCUMENT_NAME')}
        classes={{ container: { paddingBottom: '32px' } }}
        value={document.name}
        disabled
      />
      {document.valid_until && (
        <Input
          type={'date'}
          value={validUntil}
          label={t('DOCUMENTS.ADD.VALID_UNTIL')}
          optional
          disabled
          classes={{ container: { paddingBottom: '40px' } }}
        />
      )}
      {document.no_expiration && (
        <Checkbox
          label={t('DOCUMENTS.ADD.DOES_NOT_EXPIRE')}
          checked={document.no_expiration}
          classes={{ container: { paddingBottom: '42px' } }}
        />
      )}

      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          rowGap: '24px',
          paddingBottom: '32px',
          alignItems: 'center',
        }}
      >
        {document.files?.map(({ thumbnail_url, file_name, url }, index) =>
          thumbnail_url ? (
            imageComponent({
              style: { width: '100%', maxWidth: '312px', position: 'relative', zIndex: 0 },
              src: thumbnail_url,
              key: index,
            })
          ) : (
            <CertifierSelectionMenuItem key={index} certifierName={file_name} />
          ),
        )}
      </div>
      <InputAutoSize
        label={t('common:NOTES')}
        optional
        value={document.notes}
        disabled
        classes={{ container: { paddingBottom: '40px' } }}
      />
    </Layout>
  );
}

export default MainDocumentView;
