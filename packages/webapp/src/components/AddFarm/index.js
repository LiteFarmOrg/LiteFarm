import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import PropTypes from 'prop-types';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';

const style = {
  marginBottom: '28px',
};

export default function PureAddFarm({
  title,
  inputs = [{}, {}],
  onSubmit,
  map,
  loading,
  disabled,
}) {
export default function PureAddFarm({ title, inputs = [{}, {}], onSubmit, map, loading }) {
  // const { title: titleClass, ...inputClasses } = styles;
  const { t } = useTranslation();
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <Button type={'submit'} disabled={disabled || loading} fullLength>
          {loading ? t('common:LOADING') : t('common:CONTINUE')}
        </Button>
      }
    >
      <Title>{title}</Title>
      <Input style={style} {...inputs[0]} />
      <Input style={style} {...inputs[1]} />
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
