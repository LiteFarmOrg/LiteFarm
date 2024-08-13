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

import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styles from './styles.module.scss';
import AddAnimalsFormCard from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import MoreAnimalsCard from '../../../../components/Animals/AddAnimalsForm/MoreAnimalsCard';
import { useAnimalOptions } from '../useAnimalOptions';
import { BasicsFields, DetailsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { STEPS } from '..';

export const animalBasicsDefaultValues = {
  [BasicsFields.TYPE]: undefined,
  [BasicsFields.BREED]: undefined,
  [BasicsFields.SEX_DETAILS]: undefined,
  [BasicsFields.COUNT]: NaN, // setting default here overrides form values
  [BasicsFields.CREATE_INDIVIDUAL_PROFILES]: false,
  [BasicsFields.GROUP_NAME]: '',
  [BasicsFields.BATCH_NAME]: '',
};

const AddAnimalBasics = () => {
  const { control, getValues, setValue } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove, update } = useFieldArray({
    name: STEPS.BASICS,
    control,
  });

  // Update form values based on details fields
  useEffect(() => {
    const detailsFields = getValues(STEPS.DETAILS);

    if (!detailsFields) {
      return;
    }

    const updatedData = (detailsData: any) => {
      return {
        [BasicsFields.BATCH_NAME]: detailsData?.[DetailsFields.BATCH_NAME],
        [BasicsFields.COUNT]: detailsData?.[DetailsFields.COUNT],
        [BasicsFields.SEX_DETAILS]: detailsData?.[DetailsFields.SEX_DETAILS],
      };
    };

    fields.forEach((field, index) => {
      const basicsCardId = field[BasicsFields.FIELD_ARRAY_ID];

      const detailsData = detailsFields.find(
        (field) => field[DetailsFields.BASICS_FIELD_ARRAY_ID] === basicsCardId,
      );

      update(index, {
        ...field,
        ...updatedData(detailsData),
      });
    });
  }, []);

  const onAddCard = (): void => {
    append(animalBasicsDefaultValues);
  };

  const onRemoveCard = (index: number): void => {
    const basicsCardBeingRemoved = fields[index];

    const basicsCardId = basicsCardBeingRemoved[BasicsFields.FIELD_ARRAY_ID];

    // Remove the corresponding details entries
    const detailsFields = getValues(STEPS.DETAILS);
    const updatedDetailsFields = detailsFields.filter(
      (field) => field[DetailsFields.BASICS_FIELD_ARRAY_ID] !== basicsCardId,
    );
    setValue(STEPS.DETAILS, updatedDetailsFields);

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
            key={field.id} // uuid used b/c this is not kept between renders
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
