import Layout from '../../Layout';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';

function MainDocumentView({ onRetire, onUpdate, onGoBack, document, imageComponent }) {
  const { t } = useTranslation();
  const isArchived = document.valid_until !== null && new Date(document.valid_until) < new Date();
  return (
    <Layout
      buttonGroup={
        <>
          <Button color={'secondary'} onClick={onRetire} disabled={isArchived} fullLength>
            { t('DOCUMENTS.ARCHIVE') }
          </Button>
          <Button color={'primary'} onClick={onUpdate} fullLength>
            { t('common:EDIT') }
          </Button>
        </>
      }
    >
      <PageTitle
        onGoBack={onGoBack}
        title={document.name}
        style={{ marginBottom: '24px' }}
      />
      <Input
        label={t('DOCUMENTS.ADD.DOCUMENT_NAME')}
        classes={{ container: { paddingBottom: '32px' } }}
        value={document.name}
        disabled
      />

      <Input
        type={'date'}
        value={document.valid_until}
        label={t('DOCUMENTS.ADD.VALID_UNTIL')}
        optional
        disabled
        classes={{ container: { paddingBottom: '40px' } }}
      />
      <div style={{ width: '312px', height: '383px', margin: 'auto', paddingBottom: '32px' }}>
        {document.files?.map(({ thumbnail_url }) => (
          <>
            {imageComponent({
              width: '100%',
              style: { position: 'relative', zIndex: 0 },
              height: '100%',
              src: thumbnail_url,
            })}
          </>
        ))}
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