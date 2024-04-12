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

import AddAnimalsCard from './AddAnimalsCard';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ClassValue } from 'clsx';
import Icon, { Icons } from '../../Icons';
import Button from '../../Form/Button';

type MoreAnimalCardProps = {
  className: ClassValue;
};

export const MoreAnimalsCard = ({ className }: MoreAnimalCardProps) => {
  const { t } = useTranslation();

  const iconDetails = [
    { iconName: 'PIG' },
    { iconName: 'CHICKEN' },
    { iconName: 'RABBIT' },
    { iconName: 'SHEEP' },
    { iconName: 'GOAT' },
    { iconName: 'MORE_HORIZONTAL' },
  ];

  return (
    <AddAnimalsCard>
      <Icons pill iconDetails={iconDetails} className={styles.animalIcons} />
      <p className={styles.addMoreText}>{t('ANIMAL.ADD_MORE_BODY_TEXT')}</p>
      <Button color="secondary-2" type="button">
        <Icon iconName="PLUS_CIRCLE" className={styles.buttonIcon} />
        {t('ANIMAL.ADD_MORE_BUTTON')}
      </Button>
    </AddAnimalsCard>
  );
};

export default MoreAnimalsCard;
