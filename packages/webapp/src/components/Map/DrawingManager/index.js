import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BackIcon } from '../../../assets/images/map/back.svg';
import Button from '../../Form/Button';
import { isArea, isLine, isPoint } from '../../../containers/Map/util';

export default function PureDrawingManager({
  className,
  style,
  isDrawing,
  drawingType,
  onClickBack,
  onClickTryAgain,
  onClickConfirm,
}) {
  const { t } = useTranslation();

  // ASSUMING AREA CANNOT IMPLEMENT UNDO (reset drawing)
  return (
    <div className={[styles.container, className].join(' ')} style={style}>
      <button onClick={onClickBack} className={styles.backButton}>
        <BackIcon className={styles.svg} />
      </button>
      {!isDrawing && <div>
          <Button onClick={onClickTryAgain} className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.TRY_AGAIN')}</Button>
          <Button onClick={onClickConfirm} className={styles.drawingButton} color={'primary'} sm>{t('common:CONFIRM')}</Button>
        </div>}
      <div className={styles.flexFill} />
    </div>
  );

  // if (isAreaOrLine(drawingType)) return (
  //   <div className={[styles.container, className].join(' ')} style={style}>
  //     <button onClick={onClickBack} className={styles.backButton}>
  //       <BackIcon className={styles.svg} />
  //     </button>
  //     {isDrawing ?
  //       <div>
  //         <Button onClick={() => {console.log('undo clicked')}} className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.UNDO')}</Button>
  //       </div> :
  //       <div>
  //         <Button onClick={() => {console.log('undo clicked')}} className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.UNDO')}</Button>
  //         <Button onClick={() => {console.log('confirm clicked')}} className={styles.drawingButton} color={'primary'} sm>{t('common:CONFIRM')}</Button>
  //       </div>}
  //     <div className={styles.flexFill} />
  //   </div>
  // );

  // if (isPoint(drawingType)) return (
  //   <div className={[styles.container, className].join(' ')} style={style}>
  //     <button onClick={onClickBack} className={styles.backButton}>
  //       <BackIcon className={styles.svg} />
  //     </button>
  //     {!isDrawing && <div>
  //         <Button onClick={onClickTryAgain} className={styles.drawingButton} color={'secondary'} sm>{t('FARM_MAP.TRY_AGAIN')}</Button>
  //         <Button onClick={onClickConfirm} className={styles.drawingButton} color={'primary'} sm>{t('common:CONFIRM')}</Button>
  //       </div>}
  //     <div className={styles.flexFill} />
  //   </div>
  // );
}

PureDrawingManager.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  farmName: PropTypes.string,
  showVideo: PropTypes.func,
};
