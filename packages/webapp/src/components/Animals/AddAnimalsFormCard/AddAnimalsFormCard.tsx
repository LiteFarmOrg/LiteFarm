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
import { Text } from '../../Typography';
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

type FormFields = {
  type?: Option;
  breed?: Option;
  sexDetails: SexDetailsType;
  count?: number;
  createIndividualProfiles?: boolean;
  group?: string;
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
  isActive,
}: AddAnimalsFormCardProps) {
  const { control, watch } = useFormContext<FormFields>();
  const watchAnimalCount = watch('count') || 0;
  const watchAnimalType = watch('type');

  return (
    <Card className={styles.form} isActive={isActive}>
      <div className={styles.formHeader}>
        <Text>Add animal to your inventory</Text>
        {showRemoveButton && (
          <TextButton className={styles.removeBtn}>
            {' '}
            <XIcon /> remove
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
        showNoTypeSelectedMessage={!watchAnimalType}
      />

      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name="count"
          control={control}
          defaultValue={0}
          label="count"
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
        label="Create individual animal profiles"
        tooltipContent="tooltip content"
        onChange={(e) => onIndividualProfilesCheck?.((e.target as HTMLInputElement).checked)}
      />
      {/*@ts-ignore*/}
      <Input label="Group name" optional />
    </Card>
  );
}
