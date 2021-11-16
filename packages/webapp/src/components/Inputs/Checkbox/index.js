import React from 'react';
import { Control } from 'react-redux-form';
import styles from '../styles.module.scss';

class Checkbox extends React.Component {
  render() {
    const { title, model, stylesheet } = this.props;
    return (
      <div className={stylesheet || styles.checkBoxContainer}>
        <label>{title}</label>
        <Control.checkbox model={model} />
      </div>
    );
  }
}

export default Checkbox;
