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

import { useRef, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectInstance } from 'react-select';
import NumberInput from '../../Form/NumberInput';
import Checkbox from '../../Form/Checkbox';
import SexDetails from '../../Form/SexDetails';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import Card from '../../CardV2';
import { Main } from '../../Typography';
import SmallButton from '../../Form/Button/SmallButton';
import { type Details as SexDetailsType } from '../../Form/SexDetails/SexDetailsPopover';
import { ANIMAL_BASICS_FIELD_NAMES as FIELD_NAMES } from '../../../containers/Animals/AddAnimals/types';
import {
  AnimalBreedSelect,
  AnimalTypeSelect,
  type AnimalBreedSelectProps,
  type AnimalTypeSelectProps,
} from './AnimalSelect';
import { hookFormMinValidation } from '../../Form/hookformValidationUtils';

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
  const { control, watch, register, trigger, getValues } = useFormContext();
  const { t } = useTranslation();
  const watchAnimalCount = watch(`${namePrefix}.${FIELD_NAMES.COUNT}`) || 0;
  const watchAnimalType = watch(`${namePrefix}.${FIELD_NAMES.TYPE}`);
  const shouldCreateIndividualProfiles = watch(
    `${namePrefix}.${FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES}`,
  );

  const filteredBreeds = breedOptions.filter(({ type }) => type === watchAnimalType?.value);

  const breedSelectRef = useRef<SelectInstance>(null);

  useEffect(() => {
    breedSelectRef?.current?.clearValue();
  }, [watchAnimalType?.value]);

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
        breedSelectRef={breedSelectRef}
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
          rules={{
            required: {
              value: true,
              message: t('common:REQUIRED'),
            },
            min: hookFormMinValidation(1),
          }}
          onChange={() => trigger(`${namePrefix}.${FIELD_NAMES.COUNT}`)}
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
