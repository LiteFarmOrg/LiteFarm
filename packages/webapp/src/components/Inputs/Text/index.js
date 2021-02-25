import React from 'react';
import styles from '../styles.module.scss';
import { Control } from 'react-redux-form';
import Input from '../../Form/Input';

class Text extends React.Component {
  render() {
    const { model, title, validators } = this.props;
    return (
      <Control
        style={{ marginBottom: '16px' }}
        label={title}
        component={Input}
        model={model}
        validators={validators}
      />
    );
  }
}

export default Text;
