import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';

const PureSimpleCustomType = ({
  handleGoBack,
  onSubmit,
  onClick,
  view,
  buttonText,
  pageTitle,
  inputLabel,
  inputRegisterKey,
  defaultValue,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { [inputRegisterKey]: defaultValue || undefined },
  });
  const MAX_CHARS = 25;
  const add = view === 'add' || false;
  const edit = view === 'edit' || false;
  const readonly = view === 'read-only' || false;
  const disabled = readonly;

  return (
    <Form
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      buttonGroup={
        <Button
          color={'primary'}
          fullLength
          disabled={!isValid}
          onClick={onClick ? onClick : undefined}
        >
          {buttonText}
        </Button>
      }
    >
      <PageTitle style={{ marginBottom: '20px' }} onGoBack={handleGoBack} title={pageTitle} />
      <Input
        style={{ marginBottom: '20px' }}
        label={inputLabel}
        hookFormRegister={register(inputRegisterKey, {
          required: true,
          maxLength: {
            value: MAX_CHARS,
            message: t('common:CHAR_LIMIT_ERROR', { value: MAX_CHARS }),
          },
        })}
        name={inputRegisterKey}
        errors={getInputErrors(errors, inputRegisterKey)}
        optional={false}
        disabled={disabled}
      />
    </Form>
  );
};

PureSimpleCustomType.propTypes = {
  handleGoBack: PropTypes.func,
  onSubmit: PropTypes.func,
  onClick: PropTypes.func,
  view: PropTypes.oneOf(['add', 'read-only', 'edit']),
  buttonText: PropTypes.string,
  pageTitle: PropTypes.string,
  inputLabel: PropTypes.string,
  inputRegisterKey: PropTypes.string,
  defaultValue: PropTypes.string,
};

export default PureSimpleCustomType;
