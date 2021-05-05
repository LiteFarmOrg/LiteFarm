import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BackIcon } from '../../../assets/images/map/back.svg';
import clsx from 'clsx';
import PureWarningBox from '../../WarningBox';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import PureLineBox from '../LineMapBoxes';
import { watercourseEnum } from '../../../containers/constants';

export default function PureDrawingManager({
  className,
  style,
  isDrawing,
  drawingType,
  onClickBack,
  onClickTryAgain,
  onClickConfirm,
  showZeroAreaWarning,
  showLineModal,
  confirmLine,
  updateLineWidth,
  system,
  typeOfLine,
  lineData,
}) {
  const { t } = useTranslation();
  const showConfirmButtons = !showZeroAreaWarning && !showLineModal && !isDrawing;
  // ASSUMING AREA CANNOT IMPLEMENT UNDO (reset drawing)
  return (
    <div className={clsx(styles.container, className)} style={style}>
      {!showLineModal && (
        <button onClick={onClickBack} className={styles.backButton}>
          <BackIcon className={styles.svg} />
        </button>
      )}
      {!isDrawing && (
        <>
          {showZeroAreaWarning && (
            <PureWarningBox
              className={styles.warningBox}
              style={{ border: '1px solid var(--red700)' }}
            >
              <Label style={{ marginBottom: '12px' }}>
                {t('FARM_MAP.DRAWING_MANAGER.ZERO_AREA_DETECTED')}
              </Label>
              <Button
                onClick={onClickTryAgain}
                className={styles.drawingButton}
                color={'primary'}
                sm
              >
                {t('FARM_MAP.DRAWING_MANAGER.REDRAW')}
              </Button>
            </PureWarningBox>
          )}
          {showLineModal && lineData?.[watercourseEnum.width] && (
            <>
              <PureLineBox
                system={system}
                confirmLine={confirmLine}
                updateWidth={updateLineWidth}
                locationData={lineData}
                onClickTryAgain={onClickTryAgain}
                onClickBack={onClickBack}
                typeOfLine={typeOfLine}
              />
            </>
          )}
        </>
      )}
      {showConfirmButtons && (
        <div>
          <Button onClick={onClickTryAgain} className={styles.drawingButton} color={'secondary'} sm>
            {t('FARM_MAP.DRAWING_MANAGER.REDRAW')}
          </Button>
          <Button onClick={onClickConfirm} className={styles.drawingButton} color={'primary'} sm>
            {t('common:CONFIRM')}
          </Button>
        </div>
      )}
      {!showLineModal && <div className={styles.flexFill} />}
    </div>
  );
}

PureDrawingManager.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  farmName: PropTypes.string,
  showVideo: PropTypes.func,
  showZeroAreaWarning: PropTypes.bool,
  showLineModal: PropTypes.bool,
  confirmLine: PropTypes.func,
  updateLineWidth: PropTypes.func,
  system: PropTypes.string,
};
