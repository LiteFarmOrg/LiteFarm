import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';
import Layout from '../../Layout';
import RetireCustomTaskModal from '../../Modals/RetireCustomTaskModal';
import PropTypes from 'prop-types';
import { Loading } from '../../Loading/Loading';

const PureSimpleCustomType = ({
  handleGoBack,
  history,
  useHookFormPersist,
  persistedFormData,
  onSave,
  EDIThandleGoBack,
  EDIThandleEdit,
  EDIThandleRetire,
  EDITselectedType,
  UPEDIThistory,
  //one of add, read-only, edit, loading = default
  view = 'loading',
  onAdd,
  handleEdit,
  onUpdate,
  onRetire,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    // EDIT defaultValues: { task_name: EDITselectedType?.task_name },
  });

  const add = view === 'add' || false;
  const edit = view === 'edit' || false;
  const readonly = view === 'read-only' || false;
  const loading = view === 'loading' || false;

  const TASK_NAME = 'task_name';
  const [showRetire, setShowRetire] = useState(false);
  return (
    <>
      {readonly && (
        <Layout
          buttonGroup={
            <>
              <Button
                color={'secondary'}
                onClick={() => {
                  setShowRetire(true);
                }}
              >
                {t('common:RETIRE')}
              </Button>
              <Button color={'primary'} fullLength onClick={EDIThandleEdit}>
                {t('common:EDIT')}
              </Button>
            </>
          }
        >
          <PageTitle
            style={{ marginBottom: '20px' }}
            title={t('ADD_TASK.CUSTOM_TASK')}
            onGoBack={EDIThandleGoBack}
          />

          <Input
            label={t('ADD_TASK.CUSTOM_TASK_NAME')}
            name={TASK_NAME}
            hookFormRegister={register(TASK_NAME)}
            disabled
          />
          {showRetire && (
            <RetireCustomTaskModal
              dismissModal={() => {
                setShowRetire(false);
              }}
              onRetire={EDIThandleRetire}
            />
          )}
        </Layout>
      )}
      {add && (
        <Form
          onSubmit={handleSubmit(onSave)}
          buttonGroup={
            <Button color={'primary'} fullLength disabled={!isValid}>
              {t('common:SAVE')}
            </Button>
          }
        >
          <PageTitle
            style={{ marginBottom: '20px' }}
            onGoBack={handleGoBack}
            title={t('ADD_TASK.ADD_A_CUSTOM_TASK')}
          />

          <Input
            style={{ marginBottom: '20px' }}
            label={t('ADD_TASK.TASK_NAME')}
            hookFormRegister={register(TASK_NAME, {
              required: true,
              maxLength: { value: 25, message: t('ADD_TASK.CUSTOM_TASK_CHAR_LIMIT') },
            })}
            name={TASK_NAME}
            hookFormSetValue={setValue}
            errors={getInputErrors(errors, TASK_NAME)}
            optional={false}
          />
        </Form>
      )}
      {edit && (
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
              UPEDIThistory.push('/add_task/edit_custom_task');
            }}
          />
        </Form>
      )}
      {loading && <Loading />}
    </>
  );
};

PureSimpleCustomType.propTypes = {
  view: PropTypes.oneOf(['add', 'read-only', 'edit', 'loading']),
  handleGoBack: PropTypes.func,
  history: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  onSave: PropTypes.func,
  EDIThandleGoBack: PropTypes.func,
  EDIThandleEdit: PropTypes.func,
  EDIThandleRetire: PropTypes.func,
  EDITselectedType: PropTypes.any,
  UPEDIThandleGoBack: PropTypes.func,
  UPEDIThistory: PropTypes.object,
};

export default PureSimpleCustomType;
