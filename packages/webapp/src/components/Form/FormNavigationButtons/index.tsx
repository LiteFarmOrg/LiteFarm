/*
 *  Copyright 2024 LiteFarm.org
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

import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import styles from './styles.module.scss';
import { ReactComponent as ChevronRight } from '../../../assets/images/buttons/chevron-right.svg';

export interface FormNavigationButtonsProps {
  isFinalStep?: boolean;
  isDisabled?: boolean;
  contextualContent?: React.ReactNode | string;
  informationalText?: string;
  onCancel?: () => void;
  onContinue?: () => void;
}

const FormNavigationButtons = ({
  isFinalStep = false,
  isDisabled = false,
  contextualContent,
  informationalText,
  onCancel = () => {},
  onContinue = () => {},
}: FormNavigationButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container)}>
      {contextualContent && <div className={styles.contextualContent}>{contextualContent}</div>}
      <div className={styles.buttonContainer}>
        <Button color="secondary-cta" onClick={onCancel} className={styles.button} sm>
          {t('common:CANCEL')}
        </Button>
        <Button
          color="primary"
          disabled={isDisabled}
          onClick={onContinue}
          className={styles.button}
          sm
        >
          {isFinalStep ? (
            t('common:SAVE')
          ) : (
            <>
              <span>{t('common:NEXT')}</span>
              <ChevronRight />
            </>
          )}
        </Button>
      </div>
      {informationalText && <div className={styles.informationalText}>{informationalText}</div>}
    </div>
  );
};

export default FormNavigationButtons;
