/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { ReactNode } from 'react';
import Icon from '../../Icons';
import TextButton from '../Button/TextButton';
import { ReactComponent as XIcon } from '../../../assets/images/x-icon.svg';
import styles from './styles.module.scss';

interface HeaderWithBackAndCloseProps {
  title: ReactNode;
  onCancel?: () => void;
  onGoBack?: () => void;
}

const HeaderWithBackAndClose = ({ title, onCancel, onGoBack }: HeaderWithBackAndCloseProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        {onGoBack && (
          <TextButton onClick={onGoBack}>
            <Icon iconName="CHEVRON_LEFT" className={styles.backButton} />
          </TextButton>
        )}
        <div className={typeof title === 'string' ? styles.textTitle : ''}>{title}</div>
      </div>
      {onCancel && (
        <TextButton className={styles.closeButtonContainer} onClick={onCancel}>
          <XIcon className={styles.closeButton} />
        </TextButton>
      )}
    </div>
  );
};

export default HeaderWithBackAndClose;
