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

import { CreatableSelect } from '../../Form/ReactSelect';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

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

type Option = {
  label: string;
  value: string | number;
};

type FormFields = {
  type?: Option;
  breed?: Option;
  sexDetails: SexDetailsType;
  count?: number;
  createIndividualProfiles?: boolean;
  group?: string;
};

type AddAnimalsFormCardProps = {
  typeOptions: Option[];
  breedOptions: Option[];
  sexDetailsOptions: SexDetailsType;
  onTypeChange?: (type: Option) => void;
  onIndividualProfilesCheck?: (isChecked: boolean) => void;
  onRemoveButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSubmit: SubmitHandler<FormFields>;
  showRemoveButton?: boolean;
  isActive?: boolean;
};

export default function AddAnimalsFormCard({
  typeOptions,
  breedOptions,
  sexDetailsOptions,
  onTypeChange,
  onIndividualProfilesCheck,
  onSubmit,
  showRemoveButton,
  isActive,
}: AddAnimalsFormCardProps) {
  const { control, watch, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      count: 0,
      sexDetails: sexDetailsOptions,
    },
  });
  const watchCount = watch('count') || 0;
  return (
    <Card as="form" className={styles.form} isActive={isActive} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formHeader}>
        <Text>Add animal to your inventory</Text>
        {showRemoveButton && (
          <TextButton className={styles.removeBtn}>
            {' '}
            <XIcon /> remove
          </TextButton>
        )}
      </div>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <CreatableSelect
            label="Type"
            options={typeOptions}
            onChange={(option) => {
              if (option) {
                field.onChange(option);
                onTypeChange?.(option);
              }
            }}
          />
        )}
      />
      <Controller
        name="breed"
        control={control}
        render={({ field }) => (
          <CreatableSelect
            label="Breed"
            options={breedOptions}
            onChange={(option) => field.onChange(option)}
          />
        )}
      />
      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name="count"
          // @ts-ignore
          control={control}
          initialValue={0}
          label="count"
          allowDecimal={false}
          showStepper
        />
        <Controller
          name="sexDetails"
          control={control}
          render={({ field }) => (
            <SexDetails
              initialDetails={field.value}
              maxCount={watchCount}
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
