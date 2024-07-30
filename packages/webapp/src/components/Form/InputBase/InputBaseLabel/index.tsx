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

import Infoi from '../../../Tooltip/Infoi';
import { ReactComponent as Leaf } from '../../../../assets/images/signUp/leaf.svg';
import { Label } from '../../../Typography';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export type InputBaseLabelProps = {
  label?: string;
  optional?: boolean;
  hasLeaf?: boolean;
  toolTipContent?: string;
  icon?: ReactNode;
  labelStyles?: React.CSSProperties;
};

export default function InputBaseLabel(props: InputBaseLabelProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.labelContainer}>
      <Label style={props.labelStyles}>
        {props.label}
        {props.optional && (
          <Label sm className={styles.sm}>
            {t('common:OPTIONAL')}
          </Label>
        )}
        {props.hasLeaf && <Leaf className={styles.leaf} />}
      </Label>
      {props.toolTipContent && (
        <div className={styles.tooltipIconContainer}>
          <Infoi content={props.toolTipContent} />
        </div>
      )}
      {props.icon && <span className={styles.icon}>{props.icon}</span>}
    </div>
  );
}
