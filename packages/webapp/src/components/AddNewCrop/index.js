import Button from '../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label, Semibold } from '../Typography';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../components/ProgressBar';
import Form from '../Form';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from '../Form/ReactSelect';
import { BsChevronDown } from 'react-icons/bs';

export default function PureAddNewCrop({ handleGoBack, handleCancel, handleSubmit }) {
  const { t } = useTranslation();

  const progress = 33;
  const disabled = true;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit}
    >
      <PageTitle
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={'Add a new crop'} //TODO: i18n
      />
      <div
        style={{
          marginBottom: '24px',
          marginTop: '8px',
        }}
      >
        <ProgressBar value={progress} />
      </div>

      <Input
        style={{ marginBottom: '40px' }}
        label={'New Crop Name'} //TODO: i18n
        // hookFormRegister={register}
      />

      {/* <Controller
        // control={control}
        // name={SUPPORT_TYPE}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => ( */}
      <ReactSelect
        label={'Crop group'}
        options={[]}
        // onChange={onChange}
        // value={value}
        style={{ marginBottom: '40px' }}
      />
      {/* )}
      /> */}

      <PhysiologyAnatomyDropDown />
    </Form>
  );
}

PureAddNewCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};

const inputs = ['initial kc', 'initial kc', 'initial kc', 'initial kc', 'initial kc'];

const nutrientInputs = ['initial kc', 'initial kc', 'initial kc', 'initial kc', 'initial kc'];

function PhysiologyAnatomyDropDown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.dropdownHead} onClick={() => setOpen(!open)}>
        <Semibold>{'Physiology and Anatomy'}</Semibold>
        <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
      </div>
      <div className={styles.dropdownBody} style={{ display: open ? 'flex' : 'none' }}>
        <div className={styles.paFieldContainer} style={{ marginBottom: '40px' }}>
          {inputs.map((input) => {
            return (
              <Input
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={input} //TODO: i18n
                type={'number'}
                // hookFormRegister={register}
              />
            );
          })}
        </div>
        <Semibold className={styles.nutrientsHeader}>
          {' '}
          {'Nutrients inedible portion (per 100g)'}
        </Semibold>
        <div className={styles.paFieldContainer} style={{ marginBottom: '40px' }}>
          {nutrientInputs.map((nutrientInput) => {
            return (
              <Input
                style={{ flex: '1 0 41%', margin: '40px 8px 0 8px' }}
                label={nutrientInput} //TODO: i18n
                type={'number'}
                // hookFormRegister={register}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
