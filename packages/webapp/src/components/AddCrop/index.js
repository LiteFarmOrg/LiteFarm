import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label } from '../Typography';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../components/ProgressBar';
import Radio from '../Form/Radio';
import Form from '../Form';

export default function PureAddCrop({
  history,
  cropEnum,
  disabled,
  onContinue,
  varietyRegister,
  supplierRegister,
  seedTypeRegister,
  lifeCycleRegister,
  imageKey,
  isSeekingCert,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);

  const progress = 33;

  const cropTraslationKey = imageKey.toUpperCase();
  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={onContinue}
    >
      <PageTitle
        onGoBack={() => history.push(`/crop_catalogue`)}
        onCancel={() => history.push(`/crop_catalogue`)}
        title={'Add a crop'}
      />
      <div
        style={{
          marginBottom: '24px',
          marginTop: '8px',
        }}
      >
        <ProgressBar value={progress} />
      </div>
      <div className={styles.cropLabel}>{t(`crop:${cropTraslationKey}`)}</div>
      <img
        src={`crop-images/${imageKey}.jpg`}
        alt={imageKey}
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
          marginBottom: '24px',
          display: 'flex',
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
        onClick={() => {}}
      >
        + <Underlined>{'Add Custom Image'}</Underlined>
      </div>

      <Input
        style={{ marginBottom: '40px' }}
        label={t('translation:FIELDS.EDIT_FIELD.VARIETY')}
        type="text"
        hookFormRegister={varietyRegister}
        hasLeaf={true}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={'Supplier'}
        type="text"
        hookFormRegister={supplierRegister}
        hasLeaf={true}
        optional={!isSeekingCert}
      />

      <div>
        <div style={{ marginBottom: '24px' }}>
          <Label
            style={{
              paddingRight: '10px',
              fontSize: '16px',
              lineHeight: '20px',
              display: 'inline-block',
            }}
          >
            {'Will you plant as a seed or seedling?'}
          </Label>
        </div>
        <div>
          <Radio
            label="Seed"
            value={'seed'}
            hookFormRegister={seedTypeRegister}
            name={cropEnum.seed_type}
          />
        </div>
        <div>
          <Radio
            label="Seedling or planting stock"
            value={'seedling'}
            hookFormRegister={seedTypeRegister}
            name={cropEnum.seed_type}
          />
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
            {'Is the crop an annual or perennial?'}
          </Label>
        </div>
        <div>
          <Radio
            label="Annual"
            value={'ANNUAL'}
            hookFormRegister={lifeCycleRegister}
            name={cropEnum.life_cycle}
          />
        </div>
        <div>
          <Radio
            label="Perennial"
            value={'PERENNIAL'}
            hookFormRegister={lifeCycleRegister}
            name={cropEnum.life_cycle}
          />
        </div>
      </div>
    </Form>
  );
}

PureAddCrop.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
