// import Floater from 'react-floater';
import React from 'react';
import styles from './styles.scss';
import { Info, Title } from '../Typography';
// import ModalComponent from './ModalComponent';
import PropTypes from 'prop-types';
import Input from '../Form/Input';
import closeButton from '../../assets/images/grey_close_button.png';
import Button from '../Form/Button';
import Form from '../Form';
// import { Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

export default function PurePopupMiniForm({
  title,
  inputInfo,
  onClose,
  onFormSubmit,
}) {
  const { register, handleSubmit, watch, control, errors } = useForm();
  const NAME = 'name';

  const onSubmit = (data) => {
    onFormSubmit(data.name);
  }
  const onError = (data) => {}

  return (
    // <>
    //   {/* <div className={styles.popupTitle}>
    //     <a className={styles.close} onClick={closeModal}>
    //       <img src={closeButton} alt="" />
    //     </a>
    //     <Title>{title}</Title>
    //   </div> */}
    //   <a className={styles.close} onClick={onClose}>
    //     <img src={closeButton} alt="" />
    //   </a>
    //   <Title>{title}</Title>
    //   <div className={styles.customContainer}>
    //     <Info>{inputInfo}</Info>
    //     <Input/>
    //   </div>
    //   {/* <Info>{inputInfo}</Info>
    //   <Input/> */}
    //   <div className={styles.buttonContainer}>
    //     <Button style={{background: '#028577', color: 'white'}} onClick={handleSubmit}>{"Save"}</Button>
    //   </div>
    // </>
    <>
      <a className={styles.close} onClick={onClose}>
        <img src={closeButton} alt="Close" />
      </a>
      <Title>{title}</Title>
      <Form
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <div className={styles.customContainer}>
          <Input
            name={NAME}
            label={inputInfo}
            inputRef={register({ required: true })}
            errors={
              errors[NAME] &&
              (errors[NAME].message ||
                "A use type name is required")
            }
          />
        </div>
        <div className={styles.buttonContainer}>
          <Button style={{background: '#028577', color: 'white'}} type={'submit'}>{"Save"}</Button>
        </div>
      </Form>
    </>
  );
}

PurePopupMiniForm.prototype = {
  title: PropTypes.string,
  inputInfo: PropTypes.string,
  onClose: PropTypes.func,
  onFormSubmit: PropTypes.func,
};
