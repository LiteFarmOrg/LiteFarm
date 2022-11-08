import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';

const style = {
  marginBottom: '28px',
};

export default function PureAddFarm({
  title,
  inputs = [{}, {}],
  onGoBack,
  onSubmit,
  map,
  loading,
  disabled,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      data-cy="addFarm-form"
      onSubmit={onSubmit}
      buttonGroup={
        <Button
          data-cy="addFarm-continue"
          type={'submit'}
          disabled={disabled || loading}
          fullLength
        >
          {loading ? t('common:LOADING') : t('common:CONTINUE')}
        </Button>
      }
    >
      <PageTitle onGoBack={onGoBack} title={title} style={{ marginBottom: '20px' }} />
      <Input data-cy="addFarm-farmName" style={style} {...inputs[0]} />
      <Input data-cy="addFarm-location" style={style} {...inputs[1]} />
      {map}
    </Form>
  );
}

PureAddFarm.prototype = {
  title: PropTypes.string,
  onSubmit: PropTypes.func,
  map: PropTypes.node,
  inputs: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string,
      info: PropTypes.string,
      icon: PropTypes.node,
    }),
  ),
};
