import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Button from '../../Form/Button';
import RetireCustomTaskModal from '../../Modals/RetireCustomTaskModal';

const PureEditCustomTask = ({ handleGoBack, persistedPaths, handleEdit, handleRetire }) => {
  const { t } = useTranslation();

  const [showRetire, setShowRetire] = useState(false);
  return (
    <>
      <Form
        buttonGroup={
          <>
            <Button
              color={'secondary'}
              fullLength
              onClick={() => {
                setShowRetire(true);
              }}
            >
              {t('common:RETIRE')}
            </Button>
            <Button color={'primary'} fullLength onClick={handleEdit}>
              {t('common:EDIT')}
            </Button>
          </>
        }
      >
        <PageTitle
          style={{ marginBottom: '20px' }}
          title={t('ADD_TASK.CUSTOM_TASK')}
          onGoBack={handleGoBack}
        />
        {showRetire && (
          <RetireCustomTaskModal
            dismissModal={() => {
              setShowRetire(false);
            }}
            onRetire={handleRetire}
          />
        )}
      </Form>
    </>
  );
};

export default PureEditCustomTask;
