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
import TextButton from '../../Form/Button/TextButton';
import { ReactComponent as XIcon } from '../../../assets/images/x-icon.svg';
import { type Details as SexDetailsType } from '../../Form/SexDetails/SexDetailsPopover';
import {
  AnimalBreedSelect,
  AnimalTypeSelect,
  type AnimalBreedSelectProps,
  type AnimalTypeSelectProps,
  type Option,
} from './AnimalSelect';
import { useTranslation } from 'react-i18next';

const FIELD_NAMES = {
  TYPE: 'type',
  BREED: 'breed',
  SEX_DETAILS: 'sexDetails',
  COUNT: 'count',
  CREATE_INDIVIDUAL_PROFILES: 'createIndividualProfiles',
  GROUP: 'group',
  BATCH: 'batch',
} as const;

// Should be moved up to parent component that calls useForm
type FormFields = {
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
}: AddAnimalsFormCardProps) {
  const { control, watch, register } = useFormContext<FormFields>();
  const { t } = useTranslation();
  const watchAnimalCount = watch('count') || 0;
  const watchAnimalType = watch('type');
  const shouldCreateIndividualProfiles = watch('createIndividualProfiles');

  return (
    <Card className={styles.form} isActive={isActive}>
      <div className={styles.formHeader}>
        <Main>{t('ADD_ANIMAL.ADD_TO_INVENTORY')}</Main>
        {showRemoveButton && (
          <TextButton className={styles.removeBtn} onClick={onRemoveButtonClick}>
            <XIcon /> {t('common:REMOVE')}
          </TextButton>
        )}
      </div>
      <AnimalTypeSelect
        name="type"
        control={control}
        typeOptions={typeOptions}
        onTypeChange={onTypeChange}
      />
      <AnimalBreedSelect
        name="breed"
        control={control}
        breedOptions={breedOptions}
        isTypeSelected={!!watchAnimalType}
      />

      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name="count"
          control={control}
          defaultValue={0}
          label={t('common:COUNT')}
          className={styles.countInput}
          allowDecimal={false}
          showStepper
        />
        <Controller
          name="sexDetails"
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
        hookFormRegister={register('createIndividualProfiles')}
        onChange={(e) => onIndividualProfilesCheck?.((e.target as HTMLInputElement).checked)}
      />
      {shouldCreateIndividualProfiles ? (
        // @ts-ignore
        <Input
          label={t('ADD_ANIMAL.GROUP_NAME')}
          optional
          placeholder={t('ADD_ANIMAL.GROUP_NAME_PLACEHOLDER')}
          hookFormRegister={register('group')}
        />
      ) : (
        // @ts-ignore
        <Input
          label={t('ADD_ANIMAL.BATCH_NAME')}
          optional
          placeholder={t('ADD_ANIMAL.BATCH_NAME_PLACEHOLDER')}
          hookFormRegister={register('batch')}
        />
      )}
    </Card>
  );
}
