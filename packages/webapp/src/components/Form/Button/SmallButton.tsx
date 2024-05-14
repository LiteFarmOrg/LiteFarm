/*
 *  Copyright 2023, 2024 LiteFarm.org
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
import { useTranslation, TFunction } from 'react-i18next';
import { ReactComponent as XIcon } from '../../../assets/images/x-icon.svg';
import styles from './button.module.scss';

type Variant = 'remove';

type ButtonProps = {
  variant?: Variant;
  children?: ReactNode | string;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  inputRef?: any;
};

interface Config {
  [key: string]: {
    translationKey: string;
    icon: ReactNode;
    callback: (text: string) => string;
  };
}

const CONFIG: Config = {
  remove: {
    translationKey: 'common:REMOVE',
    icon: <XIcon />,
    callback: (text) => text.toLowerCase(),
  },
};

const generateContent = (t: TFunction, variant: Variant) => {
  const { translationKey, icon, callback = (text: string): string => text } = CONFIG[variant];

  return (
    <>
      {icon}
      <span>{callback(t(translationKey))}</span>
    </>
  );
};

const SmallButton = ({
  variant = 'remove',
  children,
  disabled = false,
  className,
  onClick,
  type = 'button',
  inputRef,
  ...props
}: ButtonProps) => {
  const { t } = useTranslation('common');
  const content = children || generateContent(t, variant);

  return (
    <button
      disabled={disabled}
      className={clsx(styles.smallButton, className)}
      onClick={onClick}
      type={type}
      ref={inputRef}
      {...props}
    >
      {content}
    </button>
  );
};

export default SmallButton;
