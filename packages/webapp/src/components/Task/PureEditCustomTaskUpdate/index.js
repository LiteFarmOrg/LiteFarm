import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import Button from '../../Form/Button';
import React from 'react';
import PageTitle from '../../PageTitle/v2';

const PureEditCustomTaskUpdate = ({
  handleGoBack, history,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Form
        buttonGroup={
          <Button
            onClick={() => history.push('/add_task/edit_custom_task')}
            color={'primary'}
            fullLength
          >
            {t('common:UPDATE')}
          </Button>
        }
      >
        <PageTitle
          style={{ marginBottom: '20px' }}
          title={t('ADD_TASK.EDIT_CUSTOM_TASK')}
          onGoBack={() => {
            history.push('/add_task/edit_custom_task');
          }}
        />
      </Form>
    </>
  );
};

export default PureEditCustomTaskUpdate;
