import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label } from '../Typography';
import { Controller, useForm } from 'react-hook-form';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../Form/ProgressBar';
import Radio from '../Form/Radio';

export default function PureAddCrop({ 
  onCancel, 
  onContinue, 
  onGoBack, 
  history }) {
  
  const { t } = useTranslation(['translation', 'common']);
  const { register, handleSubmit, watch, control, errors, setValue, formState } = useForm({
    mode: 'onTouched',
  });

  const cropEnum = {
    seed_type: 'seed_type',
    life_cycle: 'life_cycle',
  }
  const progress = 33;
  return (
    <Layout
    buttonGroup={
        <Button disabled={true} onClick={onContinue} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
    >
    
    <PageTitle 
    onGoBack = {() => history.push('/croplist')}
    onCancel = {onCancel}
    title={"Add a crop"}
    />
    <div style={{
      marginBottom: '16px',
      marginTop: '8px',
      }}>
      <ProgressBar value={progress}/>
    </div>
    <div className={styles.cropLabel}>{"Carrot"}</div>
    <img
          src={`crop-images/${'carrot'}.jpg`}
          alt={'carrot'}
          className={styles.circleImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'crop-images/default.jpg';
          }}
        />
    
    <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            width: 'fit-content',
            fontSize: '16px',
            color: 'var(--iconActive)',
            lineHeight: '16px',
            cursor: 'pointer',
          }}
          onClick={()=>{}}
    >
          + <Underlined>{"Add Custom Image"}</Underlined>
    </div>

    <div className={styles.label}>{t("translation:FIELDS.EDIT_FIELD.VARIETY")}</div>
    <Input  style={{ marginBottom: '24px' }}/>
    <div className={styles.label}>{"Supplier"}</div>
    <Input  style={{ marginBottom: '24px' }}/>
    
    <div>
      <div style={{ marginBottom: '20px' }}>
            <Label
              style={{
                paddingRight: '10px',
                fontSize: '16px',
                lineHeight: '20px',
                display: 'inline-block',
              }}
            >
              {"Will you plant as a seed or sedding?"}
            </Label>
        </div>
        <div>
          <Radio label='Seed' value='seed' inputRef={register({ required: true })} name={cropEnum.seed_type}/>
        </div>
        <div>
          <Radio label='Seedling or planting stock' value='seedling'  inputRef={register({ required: true })} name={cropEnum.seed_type} />
        </div> 
    </div>

    <div>
      <div style={{ marginBottom: '20px' }}>
            <Label
              style={{
                paddingRight: '10px',
                fontSize: '16px',
                lineHeight: '20px',
                display: 'inline-block',
              }}
            >
              {"Is the crop an annual or perennial?"}
            </Label>
        </div>
        <div>
          <Radio label='Annual' value='annual' inputRef={register({ required: true })} name={cropEnum.life_cycle}/>
        </div>
        <div>
          <Radio label='Perennial' value='perennial' inputRef={register({ required: true })} name={cropEnum.life_cycle}/>
        </div> 
    </div>
    
    </Layout>
  );
}

PureAddCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
