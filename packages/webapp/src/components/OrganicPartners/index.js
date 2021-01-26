import styles from './styles.scss';
import Form from '../Form';
import Button from '../Form/Button';
import signup7 from '../../assets/images/signUp/signup7.svg';
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import Checkbox from '../Form/Checkbox';
import Input from '../Form/Input';
import PropTypes from 'prop-types';
import React from 'react';
import { Label, Text } from '../Typography';
import { useTranslation } from 'react-i18next';

export function PureOrganicPartners({ inputs = [{}, {}], onSubmit, onGoBack, disabled }) {
  const { t } = useTranslation();

  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={disabled}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <img src={signup7} alt={'Avatar'} className={styles.svg} loading={'lazy'} />

      <div className={styles.svgtitle}>{t('common:GREAT')}! </div>
      <Text style={{ marginBottom: '24px' }}>
        {' '}
        {t('ORGANIC.PARTNERS.WILL_INDICATE')}{' '}
        <span className={styles.leaf}>
          <Leaf />
        </span>{' '}
        {t('ORGANIC.PARTNERS.THROUGH_APP')}
      </Text>
      <Label style={{ marginBottom: '8px' }}>{t('ORGANIC.PARTNERS.SELECT_CERTIFIER')}</Label>
      <Checkbox style={{ marginBottom: '16px' }} {...inputs[0]} />
      <Checkbox style={{ marginBottom: '12px' }} {...inputs[1]} />
      <Input {...inputs[2]} />
    </Form>
  );
}

PureOrganicPartners.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string,
      info: PropTypes.string,
      icon: PropTypes.node,
    }),
  ),
};
