import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Button from '../../Form/Button';

const PureEditCustomTask = ({ handleGoBack }) => {
  const { t } = useTranslation();

  return (
    <>
      <Form
        buttonGroup={
          <>
            <Button color={'secondary'} fullLength>
              {t('common:RETIRE')}
            </Button>
            <Button color={'primary'} fullLength>
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
      </Form>
    </>
  );
};

export default PureEditCustomTask;
