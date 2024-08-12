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
import { BasicsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { STEPS } from '..';

export const animalBasicsDefaultValues = {
  [BasicsFields.TYPE]: undefined,
  [BasicsFields.BREED]: undefined,
  [BasicsFields.SEX_DETAILS]: [{ id: '', label: '', count: NaN }],
  [BasicsFields.COUNT]: 1,
  [BasicsFields.CREATE_INDIVIDUAL_PROFILES]: false,
  [BasicsFields.GROUP]: '',
  [BasicsFields.BATCH]: '',
};

const AddAnimalBasics = () => {
  const { control } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove } = useFieldArray({
    name: STEPS.BASICS,
    control,
  });

  const onAddCard = (): void => {
    append(animalBasicsDefaultValues);
  };

  const onRemoveCard = (index: number): void => {
    remove(index);
  };

  const { typeOptions, breedOptions, sexDetailsOptions } = useAnimalOptions(
    'type',
    'breed',
    'sexDetails',
  );

  return (
    <div className={styles.cardContainer}>
      {fields.map((field, index) => {
        const namePrefix = `${STEPS.BASICS}.${index}`;

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
