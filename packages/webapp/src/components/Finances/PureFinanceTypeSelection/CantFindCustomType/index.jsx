/*
 *  Copyright 2023 LiteFarm.org
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import styles from './styles.module.scss';
import { IconLink } from '../../../Typography';
import { ReactComponent as Edit } from '../../../../assets/images/edit.svg';
import { ReactComponent as UncheckedEnabled } from '../../../../assets/images/unchecked-enabled.svg';
import { ReactComponent as CheckedEnabled } from '../../../../assets/images/checked-enabled.svg';

export const CantFindCustomType = ({ customTypeMessages, iconLinkId, onGoToManageCustomType }) => {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = () => {
    setIsChecked((current) => !current);
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <h3 className={styles.title}>{t('FINANCES.CANT_FIND.MAIN')}</h3>
          <p className={styles.subtitle}>{customTypeMessages.info}</p>
        </div>

        <div className={styles.linkContainer}>
          <IconLink
            className={styles.manageCustomLink}
            id={iconLinkId}
            icon={<Edit />}
            onClick={onGoToManageCustomType}
            isIconClickable
            underlined
          >
            {customTypeMessages.manage}
          </IconLink>

          {customTypeMessages.misc && (
            <div className={styles.miscellaneous} onClick={handleCheck}>
              <p className={styles.miscText}>
                <Trans i18nKey="FINANCES.CANT_FIND.MISC_EXPENSE">
                  Or
                  <span className={styles.underlined}>
                    create a <b>Miscellaneous</b> expense
                  </span>
                </Trans>
              </p>

              {isChecked ? (
                <CheckedEnabled className={styles.checkbox} />
              ) : (
                <UncheckedEnabled className={styles.checkbox} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CantFindCustomType.prototype = {
  customTypeMessages: PropTypes.object,
  onGoToManageCustomType: PropTypes.func,
  iconLinkId: PropTypes.string,
};
