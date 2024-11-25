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
import MeatballsMenu from '../../Menu/MeatballsMenu';
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
  isCompactView: boolean;
  photoUrl?: Animal['photo_url'];
  count?: AnimalBatch['count'];
};

const AnimalImageWithCount = ({ isCompactView, photoUrl, count }: AnimalImageWithCountProps) => {
  return (
    <div className={clsx(styles.animalImageWithCount, isCompactView && styles.compactView)}>
      <div className={styles.animalImageWrapper}>
        {photoUrl ? <img src={photoUrl} className={styles.animalImage} /> : null}
      </div>
      {count && <span className={styles.batchCount}>{count}</span>}
    </div>
  );
};

const Age = ({ birthDate, t }: { birthDate?: Animal['birth_date']; t: TFunction }) => (
  <div className={styles.bold}>
    {birthDate
      ? getAge(new Date(birthDate))
      : t('common:PROPERTY_UNKNOWN', { property: t('common:AGE') })}
  </div>
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
  isCompactView?: boolean;
  showMenu: boolean;
  isEditing?: boolean;
  options: { label: ReactNode; onClick: () => void }[];
  onBack: () => void;
  t: TFunction;
};

const ContainerWithButtons = ({
  children,
  contentClassName,
  isCompactView,
  showMenu = true,
  isEditing,
  options,
  onBack,
  t,
}: ContainerWithButtonsProps) => {
  return (
    <div className={clsx(styles.containerWithButtons, isCompactView && styles.compactView)}>
      <TextButton className={styles.backButton} onClick={onBack}>
        <Icon iconName="CHEVRON_LEFT" className={styles.backButtonIcon} />
      </TextButton>
      <div className={clsx(styles.content, contentClassName)}>{children}</div>
      <div className={styles.statusAndButton}>
        {!isCompactView && isEditing ? <div>{t('common:EDITING')}</div> : null}
        {showMenu && (
          <MeatballsMenu
            disabled={!!isEditing}
            options={options}
            classes={{ button: isEditing ? styles.editingStatusButton : '' }}
          />
        )}
      </div>
    </div>
  );
};

export type AnimalSingleViewHeaderProps = {
  showMenu: boolean;
  isEditing?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onBack: () => void;
  animalOrBatch: (Animal | AnimalBatch) & { location?: string }; // TODO: LF-4481
  defaultTypes: DefaultAnimalType[];
  customTypes: CustomAnimalType[];
  defaultBreeds: DefaultAnimalBreed[];
  customBreeds: CustomAnimalBreed[];
};

const AnimalSingleViewHeader = ({
  showMenu = true,
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
  const isCompactView = useMediaQuery(theme.breakpoints.down('md'));

  const isAnimal = 'identifier' in animalOrBatch;

  const { name, birth_date, photo_url } = animalOrBatch;

  const typeString = chooseAnimalTypeLabel(animalOrBatch, defaultTypes, customTypes);
  const breedString = chooseAnimalBreedLabel(animalOrBatch, defaultBreeds, customBreeds);
  const typeAndBreedString = [typeString, breedString].filter(Boolean).join(' | ');
  const nameAndID = [name, isAnimal ? animalOrBatch.identifier : ''].filter(Boolean).join(' | ');
  const count = isAnimal ? undefined : animalOrBatch.count;

  const animalImageWithCount = (
    <AnimalImageWithCount photoUrl={photo_url} count={count} isCompactView={isCompactView} />
  );
  const age = <Age birthDate={birth_date} t={t} />;
  const location = <Location location={animalOrBatch.location} t={t} />;

  const menuOptions = [
    { label: <MenuItem iconName="EDIT" text={t('ADD_ANIMAL.EDIT_BASIC_INFO')} />, onClick: onEdit },
    { label: <MenuItem iconName="TRASH" text={t('common:REMOVE')} />, onClick: onRemove },
  ];

  const commonProp = { t, showMenu, isEditing, isCompactView, options: menuOptions, onBack };

  const renderCompactHeader = () => (
    <div>
      <ContainerWithButtons contentClassName={styles.compactContent} {...commonProp}>
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

  return isCompactView ? renderCompactHeader() : renderDesktopHeader();
};

export default AnimalSingleViewHeader;
