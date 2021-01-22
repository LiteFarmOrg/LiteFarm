// import Floater from 'react-floater';
import React from 'react';
import styles from './styles.scss';
import { Info, Title } from '../Typography';
// import ModalComponent from './ModalComponent';
import PropTypes from 'prop-types';
import Input from '../Form/Input';
import closeButton from '../../assets/images/grey_close_button.png';
import Button from '../Form/Button';
// import { Button } from 'react-bootstrap';

export default function PurePopupMiniForm({
  title,
  inputInfo,
}) {
  const closeModal = () => {
    console.log("end it all please");
  }
  const onSubmit = () => {
    console.log("front end work sucks");
  }

  return (
    <>
      {/* <div className={styles.popupTitle}>
        <a className={styles.close} onClick={closeModal}>
          <img src={closeButton} alt="" />
        </a>
        <Title>{title}</Title>
      </div> */}
      <a className={styles.close} onClick={closeModal}>
        <img src={closeButton} alt="" />
      </a>
      <Title>{title}</Title>
      <div className={styles.customContainer}>
        <Info>{inputInfo}</Info>
        <Input/>
      </div>
      {/* <Info>{inputInfo}</Info>
      <Input/> */}
      <div className={styles.buttonContainer}>
        <Button style={{background: '#028577', color: 'white'}} onClick={onSubmit}>{"Save"}</Button>
      </div>
    </>
  );
}

PurePopupMiniForm.prototype = {
  title: PropTypes.string,
  inputInfo: PropTypes.string,
};
