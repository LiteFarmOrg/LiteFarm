/*
 *  Copyright 2026 LiteFarm.org
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
import clsx from 'clsx';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { VscWarning } from 'react-icons/vsc';
import { FiSlash } from 'react-icons/fi';
import Infoi from '../../../Tooltip/Infoi';
import { Semibold } from '../../../Typography';
import { Modal } from '../../index';
import styles from './styles.module.scss';

enum TitleType {
  error = 'error',
  warning = 'warning',
}

export type ModalComponentProps = {
  children: ReactNode;
  dismissModal: () => void;
  title?: ReactNode;
  titleClassName?: string;
  icon?: ReactNode;
  buttonGroup?: ReactNode;
  tooltipContent?: string;
  className?: string;
  titleType?: TitleType;
};

/**
 * A styled modal dialog component with header, content area, and optional button group.
 *
 * Major changes from v2:
 * 1. Buttons in buttonGroup are automatically styled to fill available space (width: 100%)
 * 2. Container padding updated to 16px vertical, 24px horizontal
 * 3. Title color defaults to #000 (black) instead of --teal700
 * 4. Uses `titleType` enum prop instead of boolean `warning`/`error` props
 *
 * @example
 * <ModalComponent
 *   title="Confirm Action"
 *   titleType={TitleType.warning}
 *   buttonGroup={
 *     <>
 *       <Button onClick={onCancel}>Cancel</Button>
 *       <Button onClick={onConfirm}>Confirm</Button>
 *     </>
 *   }
 *   dismissModal={dismissModal}
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </ModalComponent>
 * ```
 */
export default function ModalComponent({
  children,
  dismissModal,
  title,
  titleClassName,
  icon,
  buttonGroup,
  tooltipContent,
  className,
  titleType,
}: ModalComponentProps) {
  return (
    <Modal dismissModal={dismissModal}>
      <div className={clsx(styles.container, className)}>
        <div className={styles.header}>
          {!!title && (
            <Semibold
              className={clsx([styles.title, titleType && styles[titleType], titleClassName])}
            >
              {titleType === TitleType.warning && <VscWarning />}
              {titleType === TitleType.error && <FiSlash />}
              {icon && icon}
              {title}
              {tooltipContent && (
                <Infoi
                  style={{ fontSize: '18px', transform: 'translateY(3px)' }}
                  content={tooltipContent}
                />
              )}
            </Semibold>
          )}
          <IconButton onClick={dismissModal} className={styles.dismissButton}>
            <Close />
          </IconButton>
        </div>
        {children}
        {!!buttonGroup && <div className={styles.buttonGroup}>{buttonGroup}</div>}
      </div>
    </Modal>
  );
}
