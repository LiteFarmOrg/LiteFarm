import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main, Title, Underlined } from '../Typography';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../Form/ProgressBar';
import Radio from '../Form/Radio';

export default function PureAddCrop({ title, onCancel, onContinue, onGoBack, toShowSpotlight, style, history }) {
  const { t } = useTranslation(['translation', 'common']);
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
    <div style={{marginBottom: '8px',}}>
      <ProgressBar />
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
            marginBottom: '20px',
            marginLeft: '120px',
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
    <div className={styles.labelContainer}>
              <div className={styles.label}>{"Will you plant as a seed or sedding?"}</div>
    </div>
    <Radio label='Seed'/>
    <Radio label='Seedling or planting stock'/>
    <div className={styles.labelContainer}>
              <div className={styles.label}>{"Is the crop an annual or perennial?"}</div>
    </div>
    <Radio label='Annual'/>
    <Radio label='Perennial'/>
    
    </Layout>
  );
}

PureAddCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
