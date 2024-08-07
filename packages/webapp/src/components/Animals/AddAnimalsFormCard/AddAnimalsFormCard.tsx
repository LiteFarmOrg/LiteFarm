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

import { Controller, useFormContext } from 'react-hook-form';

import NumberInput from '../../Form/NumberInput';
import Checkbox from '../../Form/Checkbox';
import SexDetails from '../../Form/SexDetails';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import Card from '../../CardV2';
import { Main } from '../../Typography';
import SmallButton from '../../Form/Button/SmallButton';
import { type Details as SexDetailsType } from '../../Form/SexDetails/SexDetailsPopover';
import {
  AnimalBreedSelect,
  AnimalTypeSelect,
  type AnimalBreedSelectProps,
  type AnimalTypeSelectProps,
  type Option,
} from './AnimalSelect';
import { useTranslation } from 'react-i18next';
import { parseUniqueAnimalId } from '../../../util/animal';
import { ANIMAL_ID_ENTITY } from '../../../containers/Animals/types';

export const FIELD_NAMES = {
  TYPE: 'type',
  BREED: 'breed',
  SEX_DETAILS: 'sexDetails',
  COUNT: 'count',
  CREATE_INDIVIDUAL_PROFILES: 'createIndividualProfiles',
  GROUP: 'group',
  BATCH: 'batch',
} as const;

export type FormFields = {
  [FIELD_NAMES.TYPE]?: Option;
  [FIELD_NAMES.BREED]?: Option;
  [FIELD_NAMES.SEX_DETAILS]: SexDetailsType;
  [FIELD_NAMES.COUNT]?: number;
  [FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES]?: boolean;
  [FIELD_NAMES.GROUP]?: string;
  [FIELD_NAMES.BATCH]?: string;
};

type AddAnimalsFormCardProps = AnimalTypeSelectProps &
  AnimalBreedSelectProps & {
    sexDetailsOptions: SexDetailsType;
    onIndividualProfilesCheck?: (isChecked: boolean) => void;
    onRemoveButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    showRemoveButton?: boolean;
    isActive?: boolean;
    namePrefix?: string;
  };

export default function AddAnimalsFormCard({
  typeOptions,
  breedOptions,
  sexDetailsOptions,
  onTypeChange,
  onIndividualProfilesCheck,
  showRemoveButton,
  onRemoveButtonClick,
  isActive,
  namePrefix = '',
}: AddAnimalsFormCardProps) {
  const { control, watch, register } = useFormContext();
  const { t } = useTranslation();
  const watchAnimalCount = watch(`${namePrefix}.${FIELD_NAMES.COUNT}`) || 0;
  const watchAnimalType = watch(`${namePrefix}.${FIELD_NAMES.TYPE}`);
  const shouldCreateIndividualProfiles = watch(
    `${namePrefix}.${FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES}`,
  );

  const typeKey = watchAnimalType?.value
    ? parseUniqueAnimalId(watchAnimalType.value, ANIMAL_ID_ENTITY.TYPE)
    : {};

  const filteredBreeds = breedOptions.filter(
    ({ custom_type_id, default_type_id }) =>
      (custom_type_id && custom_type_id === typeKey.custom_type_id) ||
      (default_type_id && default_type_id === typeKey.default_type_id),
  );

  return (
    <Card className={styles.form} isActive={isActive}>
      <div className={styles.formHeader}>
        <Main>{t('ADD_ANIMAL.ADD_TO_INVENTORY')}</Main>
        {showRemoveButton && <SmallButton variant="remove" onClick={onRemoveButtonClick} />}
      </div>
      <AnimalTypeSelect
        name={`${namePrefix}.${FIELD_NAMES.TYPE}`}
        control={control}
        typeOptions={typeOptions}
        onTypeChange={onTypeChange}
      />
      <AnimalBreedSelect
        name={`${namePrefix}.${FIELD_NAMES.BREED}`}
        control={control}
        breedOptions={filteredBreeds}
        isTypeSelected={!!watchAnimalType}
      />

      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name={`${namePrefix}.${FIELD_NAMES.COUNT}`}
          control={control}
          defaultValue={0}
          label={t('common:COUNT')}
          className={styles.countInput}
          allowDecimal={false}
          showStepper
        />
        <Controller
          name={`${namePrefix}.${FIELD_NAMES.SEX_DETAILS}`}
          control={control}
          render={({ field }) => (
            <SexDetails
              initialDetails={sexDetailsOptions}
              maxCount={watchAnimalCount}
              onConfirm={(details) => field.onChange(details)}
            />
          )}
        />
      </div>
      <Checkbox
        label={t('ADD_ANIMAL.CREATE_INDIVIDUAL_PROFILES')}
        tooltipContent={t('ADD_ANIMAL.CREATE_INDIVIDUAL_PROFILES_TOOLTIP')}
        hookFormRegister={register(`${namePrefix}.${FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES}`)}
        onChange={(e) => onIndividualProfilesCheck?.((e.target as HTMLInputElement).checked)}
      />
      {shouldCreateIndividualProfiles ? (
        // @ts-ignore
        <Input
          label={t('ADD_ANIMAL.GROUP_NAME')}
          optional
          placeholder={t('ADD_ANIMAL.GROUP_NAME_PLACEHOLDER')}
          hookFormRegister={register(`${namePrefix}.${FIELD_NAMES.GROUP}`)}
        />
      ) : (
        // @ts-ignore
        <Input
          label={t('ADD_ANIMAL.BATCH_NAME')}
          optional
          placeholder={t('ADD_ANIMAL.BATCH_NAME_PLACEHOLDER')}
          hookFormRegister={register(`${namePrefix}.${FIELD_NAMES.BATCH}`)}
        />
      )}
    </Card>
  );
}
