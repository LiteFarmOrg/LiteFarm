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

import clsx from 'clsx';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Icon, { Icons, IconProps } from '../../Icons';
import Button from '../../Form/Button';

type MoreAnimalCardProps = {
  className?: string;
  onClick: () => void;
};

export const MoreAnimalsCard = ({ className, onClick }: MoreAnimalCardProps) => {
  const { t } = useTranslation();

  const iconDetails: IconProps[] = [
    { iconName: 'PIGS' },
    { iconName: 'CHICKEN' },
    { iconName: 'RABBIT' },
    { iconName: 'SHEEP' },
    { iconName: 'GOAT' },
    { iconName: 'MORE_HORIZONTAL' },
  ];

  return (
    <div className={clsx(styles.card, className)}>
      <Icons pill iconDetails={iconDetails} className={styles.animalIcons} />
      <p className={styles.addMoreText}>{t('ANIMAL.ADD_MORE_BODY_TEXT')}</p>
      <Button color="secondary-2" type="button" onClick={onClick}>
        <Icon iconName="PLUS_CIRCLE" className={styles.buttonIcon} />
        {t('ANIMAL.ADD_MORE_BUTTON')}
      </Button>
    </div>
  );
};

export default MoreAnimalsCard;
