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

import styles from './styles.module.scss';
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from 'react';
import InputBaseLabel from './InputBaseLabel';
import InputBaseField from './InputBaseField';
import { Error, Info, TextWithExternalLink } from '../../Typography';
import { Cross } from '../../Icons';

export type InputBaseProps = {
  label?: string;
  optional?: boolean;
  hasLeaf?: boolean;
  toolTipContent?: string;
  icon?: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  onCrossClick?: () => void;
  info?: string;
  error?: string;
  link?: string;
  textWithExternalLink?: string;
  classes?: Record<'input' | 'label' | 'container' | 'info' | 'errors', React.CSSProperties>;
};

const InputBase = forwardRef<HTMLInputElement, InputBaseProps & ComponentPropsWithoutRef<'input'>>(
  (props, ref) => {
    const {
      label,
      optional,
      hasLeaf,
      toolTipContent,
      error,
      info,
      textWithExternalLink,
      link,
      icon,
      leftSection,
      rightSection,
      onCrossClick,
      classes,
      ...inputProps
    } = props;

    return (
      <div className={styles.inputWrapper}>
        <label>
          {label && (
            <InputBaseLabel
              label={label}
              icon={icon}
              hasLeaf={hasLeaf}
              optional={optional}
              toolTipContent={toolTipContent}
            />
          )}
          <InputBaseField
            leftSection={leftSection}
            rightSection={rightSection}
            inputProps={inputProps}
            crossIcon={!!error ? <Cross isClickable onClick={onCrossClick} /> : undefined}
            ref={ref}
          />
        </label>
        {info && !error && <Info style={classes?.info}>{info}</Info>}
        {error && (
          <Error data-cy="error" style={classes?.errors}>
            {error}
          </Error>
        )}
        {textWithExternalLink && link && (
          <TextWithExternalLink link={link}>{textWithExternalLink}</TextWithExternalLink>
        )}
      </div>
    );
  },
);

export default InputBase;
