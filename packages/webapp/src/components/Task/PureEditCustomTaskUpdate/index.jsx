import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Form from '../../Form';
import Button from '../../Form/Button';
import PageTitle from '../../PageTitle/v2';

const PureEditCustomTaskUpdate = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <>
      <Form
        buttonGroup={
          <Button
            onClick={() => navigate('/add_task/edit_custom_task')}
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
            navigate('/add_task/edit_custom_task');
          }}
        />
      </Form>
    </>
  );
};

export default PureEditCustomTaskUpdate;
