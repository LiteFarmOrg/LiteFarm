import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BackIcon } from '../../../assets/images/map/back.svg';
import Button from '../../Form/Button';

export default function PureDrawingManager({ className, style, farmName, showVideo }) {
  const { t } = useTranslation();
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <div className={[styles.container, className].join(' ')} style={style}>
      <button className={styles.backButton}>
        <BackIcon className={styles.svg} />
      </button>
      {isDrawing ?
        <div>
          <Button className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.UNDO')}</Button>
        </div> :
        <div>
          <Button className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.UNDO')}</Button>
          <Button className={styles.drawingButton} color={'primary'} sm>{t('common:CONFIRM')}</Button>
        </div>}
      <div className={styles.flexFill} />
    </div>
  );
}

PureDrawingManager.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  farmName: PropTypes.string,
  showVideo: PropTypes.func,
};
