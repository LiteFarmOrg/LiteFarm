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

import { ReactNode } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import Icon, { IconName } from '../../Icons';
import TextButton from '../../Form/Button/TextButton';
import ThreeDotsMenu from '../../Menu/ThreeDotsMenu';
import { getAge } from '../../../util/age';
import {
  Animal,
  AnimalBatch,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
} from '../../../store/api/types';
import {
  chooseAnimalBreedLabel,
  chooseAnimalTypeLabel,
} from '../../../containers/Animals/Inventory/useAnimalInventory';
import styles from './styles.module.scss';

type MenuItemProps = { iconName: IconName; text: string };

const MenuItem = ({ iconName, text }: MenuItemProps) => {
  return (
    <div className={styles.menuItem}>
      <Icon iconName={iconName} className={styles.menuItemIcon} />
      {text}
    </div>
  );
};

type AnimalImageWithCountProps = {
  isResponsive: boolean;
  photoUrl?: Animal['photo_url'];
  count?: AnimalBatch['count'];
};

const AnimalImageWithCount = ({ isResponsive, photoUrl, count }: AnimalImageWithCountProps) => {
  return (
    <div className={clsx(styles.animalImageWithCount, isResponsive && styles.responsive)}>
      <div className={styles.animalImageWrapper}>
        {photoUrl ? <img src={photoUrl} className={styles.animalImage} /> : null}
      </div>
      {count && <span className={styles.batchCount}>{count}</span>}
    </div>
  );
};

const Age = ({ birthDate, t }: { birthDate?: Animal['birth_date']; t: TFunction }) => (
  <div className={styles.bold}>{birthDate ? getAge(new Date(birthDate)) : t('common:UNKNOWN')}</div>
);

const Location = ({ location, t }: { location?: string; t: TFunction }) => (
  <div className={clsx(styles.bold, styles.location)}>
    <Icon iconName="LOCATION" className={styles.locationIcon} />
    <span className={styles.locationText}>{location || t('common:UNKNOWN')}</span>
  </div>
);

type ContainerWithButtonsProps = {
  children: ReactNode;
  contentClassName?: string;
  isResponsive?: boolean;
  isEditing?: boolean;
  options: { label: ReactNode; onClick: () => void }[];
  onBack: () => void;
  t: TFunction;
};

const ContainerWithButtons = ({
  children,
  contentClassName,
  isResponsive,
  isEditing,
  options,
  onBack,
  t,
}: ContainerWithButtonsProps) => {
  return (
    <div className={clsx(styles.containerWithButtons, isResponsive && styles.responsive)}>
      <TextButton className={styles.backButton} onClick={onBack}>
        <Icon iconName="CHEVRON_LEFT" className={styles.backButtonIcon} />
      </TextButton>
      <div className={clsx(styles.content, contentClassName)}>{children}</div>
      <div className={styles.statusAndButton}>
        {!isResponsive && isEditing ? <div>{t('common:EDITING')}</div> : null}
        <ThreeDotsMenu
          options={options}
          classes={{ button: isEditing ? styles.editingStatusButton : '' }}
        />
      </div>
    </div>
  );
};

function isAnimal(animalOrBatch: Animal | AnimalBatch): animalOrBatch is Animal {
  return 'identifier' in animalOrBatch;
}

export type AnimalSingleViewHeaderProps = {
  isEditing?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onBack: () => void;
  animalOrBatch: (Animal | AnimalBatch) & { location?: string }; // location is TBD
  defaultTypes: DefaultAnimalType[];
  customTypes: CustomAnimalType[];
  defaultBreeds: DefaultAnimalBreed[];
  customBreeds: CustomAnimalBreed[];
};

const AnimalSingleViewHeader = ({
  isEditing,
  onEdit,
  onRemove,
  onBack,
  animalOrBatch,
  defaultTypes,
  customTypes,
  defaultBreeds,
  customBreeds,
}: AnimalSingleViewHeaderProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isResponsive = useMediaQuery(theme.breakpoints.down('md'));

  const isAnimalType = isAnimal(animalOrBatch);

  const { name, birth_date, photo_url } = animalOrBatch;

  const typeString = chooseAnimalTypeLabel(animalOrBatch, defaultTypes, customTypes);
  const breedString = chooseAnimalBreedLabel(animalOrBatch, defaultBreeds, customBreeds);
  const typeAndBreedString = [typeString, breedString].filter(Boolean).join(' | ');
  const nameAndID = [name, isAnimalType ? animalOrBatch.identifier : '']
    .filter(Boolean)
    .join(' | ');
  const count = isAnimalType ? undefined : animalOrBatch.count;

  const animalImageWithCount = (
    <AnimalImageWithCount photoUrl={photo_url} count={count} isResponsive={isResponsive} />
  );
  const age = <Age birthDate={birth_date} t={t} />;
  const location = <Location location={animalOrBatch.location} t={t} />;

  const menuOptions = [
    { label: <MenuItem iconName="EDIT" text={t('ADD_ANIMAL.EDIT_BASIC_INFO')} />, onClick: onEdit },
    { label: <MenuItem iconName="TRASH" text={t('common:REMOVE')} />, onClick: onRemove },
  ];

  const commonProp = { t, isEditing, isResponsive, options: menuOptions, onBack };

  const renderResponsiveHeader = () => (
    <div>
      <ContainerWithButtons contentClassName={styles.responsiveContent} {...commonProp}>
        {nameAndID}
      </ContainerWithButtons>
      <div className={styles.mobileHeaderMain}>
        <div className={clsx(styles.mobileMainHeaderLeft, count && styles.withCount)}>
          {animalImageWithCount}
          {age}
        </div>
        {location}
      </div>
    </div>
  );

  const renderDesktopHeader = () => (
    <ContainerWithButtons contentClassName={styles.desktopContent} {...commonProp}>
      <div className={styles.desktopBasicInfo}>
        {animalImageWithCount}
        <div className={styles.nameAndType}>
          <div className={styles.bold}>{nameAndID}</div>
          <div>{typeAndBreedString}</div>
        </div>
      </div>
      {age}
      {location}
    </ContainerWithButtons>
  );

  return isResponsive ? renderResponsiveHeader() : renderDesktopHeader();
};

export default AnimalSingleViewHeader;
