import React from 'react';
import styles from '../styles.scss';
import {Control} from 'react-redux-form';

class Text extends React.Component {
  render() {
    const { model, title, validators } = this.props;
    return (
      <div className={styles.textContainer}>
        <label>{title}</label>
        <div className={styles.textWrapper}><Control.text model={model} validators={validators} /></div>
      </div>
    )
  }
}

export default Text;
