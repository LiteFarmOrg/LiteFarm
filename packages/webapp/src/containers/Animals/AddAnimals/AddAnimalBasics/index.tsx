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

import { useFieldArray, useFormContext } from 'react-hook-form';
import styles from './styles.module.scss';
import AddAnimalsFormCard from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import MoreAnimalsCard from '../../../../components/Animals/AddAnimalsForm/MoreAnimalsCard';
import { useAnimalOptions } from '../useAnimalOptions';
import { BasicsFields, DetailsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { STEPS } from '..';
import { useUpdateBasics } from './useUpdateBasics';

export const animalBasicsDefaultValues = {
  [BasicsFields.TYPE]: undefined,
  [BasicsFields.BREED]: undefined,
  [BasicsFields.SEX_DETAILS]: undefined,
  [BasicsFields.COUNT]: 1,
  [BasicsFields.CREATE_INDIVIDUAL_PROFILES]: false,
  [BasicsFields.GROUP_NAME]: '',
  [BasicsFields.BATCH_NAME]: '',
};

const AddAnimalBasics = () => {
  const { control, getValues, setValue } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove, replace } = useFieldArray({
    name: STEPS.BASICS,
    control,
  });

  const { typeOptions, breedOptions, sexDetailsOptions } = useAnimalOptions(
    'type',
    'breed',
    'sexDetails',
  );

  // Update basics form based on details data
  useUpdateBasics(fields, replace);

  const onAddCard = (): void => {
    append(animalBasicsDefaultValues);
  };

  const onRemoveCard = (index: number): void => {
    // Remove the corresponding details entries
    const removedBasicsCardId = fields[index][BasicsFields.FIELD_ARRAY_ID];
    const detailsFields = getValues(STEPS.DETAILS);
    const updatedDetailsFields = detailsFields.filter(
      (field) => field[DetailsFields.BASICS_FIELD_ARRAY_ID] !== removedBasicsCardId,
    );
    setValue(STEPS.DETAILS, updatedDetailsFields);

    // Remove the basics card
    remove(index);
  };

  return (
    <div className={styles.cardContainer}>
      {fields.map((field, index) => {
        const namePrefix = `${STEPS.BASICS}.${index}.`;

        return (
          <AddAnimalsFormCard
            key={field.id}
            typeOptions={typeOptions}
            breedOptions={breedOptions}
            sexDetailsOptions={sexDetailsOptions}
            showRemoveButton={fields.length > 1}
            onRemoveButtonClick={() => onRemoveCard(index)}
            namePrefix={namePrefix}
          />
        );
      })}
      <MoreAnimalsCard onClick={onAddCard} />
    </div>
  );
};

export default AddAnimalBasics;
