import React from 'react';
import styles from './styles.scss';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import Input from '../Form/Input';
import closeButton from '../../assets/images/grey_close_button.png';
import Button from '../Form/Button';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';

export default function PurePopupMiniForm({ title, inputInfo, onClose, onFormSubmit, isOpen }) {
  const { register, handleSubmit, watch, control, errors } = useForm();
  const NAME = 'name';

  const onSubmit = (data) => {
    onFormSubmit(data.name);
  };
  const onError = (data) => {};

  return (
    <Popup
      open={isOpen}
      closeOnDocumentClick
      onClose={onClose}
      contentStyle={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        padding: '0 5%',
      }}
      overlayStyle={{ zIndex: '1060', height: '100vh' }}
    >
      <div className={styles.modal}>
        <div className={styles.popupTitle}>
          <a className={styles.close} onClick={onClose}>
            <img src={closeButton} alt="Close" />
          </a>
          <Title className={styles.heading}>{title}</Title>
          <div className={styles.padding} />
        </div>
        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <Input
            name={NAME}
            label={inputInfo}
            inputRef={register({ required: true })}
            errors={errors[NAME] && (errors[NAME].message || 'A use type name is required')}
            style={{ 'margin-bottom': '20px' }}
            classes={{
              errors: { display: 'flex' },
            }}
          />
          <div className={styles.buttonContainer}>
            <Button style={{ background: '#028577', color: 'white' }} type={'submit'}>
              {'Save'}
            </Button>
          </div>
        </Form>
      </div>
    </Popup>
  );
}

PurePopupMiniForm.prototype = {
  title: PropTypes.string,
  inputInfo: PropTypes.string,
  onClose: PropTypes.func,
  onFormSubmit: PropTypes.func,
  isOpen: PropTypes.bool,
};
