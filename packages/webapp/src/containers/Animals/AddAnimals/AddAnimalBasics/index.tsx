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

import { useLayoutEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styles from './styles.module.scss';
import AddAnimalsFormCard from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import MoreAnimalsCard from '../../../../components/Animals/AddAnimalsForm/MoreAnimalsCard';
import { useAnimalOptions } from '../useAnimalOptions';
import { BasicsFields, DetailsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { STEPS } from '..';
import { Details as SexDetailsType } from '../../../../components/Form/SexDetails/SexDetailsPopover';

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

  const detailsFields = getValues(STEPS.DETAILS);

  // Update form values based on changes made within details, including removal
  useLayoutEffect(() => {
    if (!detailsFields.length) {
      return;
    }

    const updatedSexDetails = (detailsData: any): SexDetailsType => {
      return sexDetailsOptions.map((option: { id: number; label: string; count: number }) => ({
        ...option,
        count: detailsData.filter(({ sex }: { sex: number }) => sex === option.id).length,
      }));
    };

    // Update fields with details fields or regenerate count + sexDetails
    const updatedData = (detailsData: any) => {
      return {
        [BasicsFields.BATCH_NAME]: detailsData?.[0]?.[DetailsFields.BATCH_NAME],
        [BasicsFields.COUNT]: detailsData?.[0]?.[DetailsFields.COUNT] || detailsData.length,
        [BasicsFields.SEX_DETAILS]:
          detailsData?.[0]?.[DetailsFields.SEX_DETAILS] || updatedSexDetails(detailsData),
      };
    };

    // Track basics cards with no corresponding details
    const removalIndices: number[] = [];

    const updatedBasicFields = fields.map((field, index) => {
      const basicsCardId = field[BasicsFields.FIELD_ARRAY_ID];

      const detailsData = detailsFields.filter(
        (entity) => entity[DetailsFields.BASICS_FIELD_ARRAY_ID] === basicsCardId,
      );

      if (!detailsData.length) {
        removalIndices.push(index);
        return field;
      } else {
        return {
          ...field,
          ...updatedData(detailsData),
        };
      }
    });

    // Remove cards that have no corresponding details
    const filteredFields = updatedBasicFields.filter((_, index) => !removalIndices.includes(index));
    replace(filteredFields);
  }, [detailsFields, !!sexDetailsOptions]);

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
