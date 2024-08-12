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

import { ReactElement, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Info, Semibold } from '../../../../components/Typography';
import ExpandableItem from '../../../../components/Expandable/ExpandableItem';
import useExpandable from '../../../../components/Expandable/useExpandableItem';
import { AnimalFormHeaderItem } from '../../../../components/Animals/AddAnimalsForm/AnimalFormHeaderItem';
import AnimalDetails from '../../../../components/Animals/AddAnimalsDetails';
import BatchDetails from '../../../../components/Animals/AddBatchDetails';
import { useCurrencySymbol } from '../../../hooks/useCurrencySymbol';
import { useAnimalOptions } from '../useAnimalOptions';
import { STEPS } from '..';
import { DetailsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { AnimalOrBatchKeys } from '../../types';

const AddAnimalDetails = () => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const { t } = useTranslation(['animal', 'common', 'translation']);
  const { control, getValues } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove, replace } = useFieldArray({
    name: STEPS.DETAILS,
    control,
  });

  const onRemoveCard = (index: number): void => {
    remove(index);
  };

  const {
    typeOptions,
    breedOptions,
    sexOptions,
    sexDetailsOptions,
    useOptions,
    tagTypeOptions,
    tagColorOptions,
    tagPlacementOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
    'type',
    'breed',
    'sex',
    'sexDetails',
    'use',
    'tagType',
    'tagColor',
    'tagPlacement',
    'organicStatus',
    'origin',
  );

  /* Populate details values based on basics data */
  useEffect(() => {
    replace([]); // TODO: figure out how to correctly update rather than clear + append

    getValues(STEPS.BASICS).forEach((animalOrBatch) => {
      // Animals
      if (animalOrBatch.createIndividualProfiles) {
        for (let i = 0; i < animalOrBatch.count; i++) {
          append({
            [DetailsFields.TYPE]: animalOrBatch.type!, // existence should be enforced by form
            [DetailsFields.BREED]: animalOrBatch.breed,
            // Ignore/delete group?
            [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
          });
        }
      } else {
        // Batch
        append({
          [DetailsFields.TYPE]: animalOrBatch.type!, // existence should be enforced by form
          [DetailsFields.BREED]: animalOrBatch.breed,
          [DetailsFields.COUNT]: animalOrBatch.count,
          [DetailsFields.NAME]: animalOrBatch.batch,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
        });
      }
    });
  }, []);

  /* Render logic */
  const animalElements: ReactElement[] = [];
  const batchElements: ReactElement[] = [];

  const generalDetailProps = {
    typeOptions,
    breedOptions,
    sexOptions,
    useOptions,
    sexDetailsOptions,
  };

  const otherDetailsProps = {
    organicStatusOptions,
  };

  const currency = useCurrencySymbol();
  const originProps = {
    currency: currency,
    originOptions,
  };

  let animalIndex = 1;
  let batchIndex = 1;

  const animalCount = fields.filter(
    (field) => field.animal_or_batch === AnimalOrBatchKeys.ANIMAL,
  ).length;
  const batchCount = fields.filter(
    (field) => field.animal_or_batch === AnimalOrBatchKeys.BATCH,
  ).length;

  fields.forEach((field, index) => {
    const namePrefix = `${STEPS.DETAILS}.${index}`;
    const isExpanded = expandedIds.includes(field.id);

    const isAnimal = field.animal_or_batch === AnimalOrBatchKeys.ANIMAL;

    const commonProps = {
      itemKey: field.id,
      isExpanded: isExpanded,
      iconClickOnly: false,
      onClick: () => toggleExpanded(field.id),
    };

    const mainContent = (
      <AnimalFormHeaderItem
        key={field.id}
        isExpanded={isExpanded}
        onRemove={() => onRemoveCard(index)}
        type={field.type.label}
        breed={field.breed?.label}
        totalCount={isAnimal ? animalCount : batchCount}
        number={isAnimal ? animalIndex : batchIndex}
        iconKey={'CUSTOM_ANIMAL'} // TODO: Need to get the key instead of label and pass
        isBatch={!isAnimal}
        count={field.count}
        sex={sexOptions.label}
      />
    );

    const expandedContent =
      field.animal_or_batch === AnimalOrBatchKeys.ANIMAL ? (
        <AnimalDetails
          key={field.id}
          generalDetailProps={generalDetailProps}
          uniqueDetailsProps={{
            tagTypeOptions,
            tagColorOptions,
            tagPlacementOptions,
          }}
          otherDetailsProps={otherDetailsProps}
          originProps={originProps}
          namePrefix={namePrefix}
        />
      ) : (
        <BatchDetails
          key={field.id}
          generalDetailProps={generalDetailProps}
          otherDetailsProps={otherDetailsProps}
          originProps={originProps}
          namePrefix={namePrefix}
        />
      );

    const expandableItem = (
      <div key={field.id}>
        <ExpandableItem
          {...commonProps}
          mainContent={mainContent}
          expandedContent={expandedContent}
          classes={{
            expandedContainer: styles.expandedContainer,
            mainContentWithIcon: styles.expandableHeader,
            expandedMainContentWithIcon: styles.expandedHeader,
          }}
          leftCollapseIcon
        />
      </div>
    );

    if (field.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
      animalElements.push(expandableItem);
      animalIndex++;
    } else if (field.animal_or_batch === AnimalOrBatchKeys.BATCH) {
      batchElements.push(expandableItem);
      batchIndex++;
    }
  });

  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className={styles.sectionHeader}>
      <Semibold>
        {title} ({count})
      </Semibold>
      <Info>Fill in your animal details below or save and pick this up later on.</Info>
    </div>
  );

  return (
    <div className={styles.container}>
      {!!animalCount && <SectionHeader title="Individuals" count={animalCount} />}

      {animalElements}

      {!!batchCount && <SectionHeader title="Batches" count={batchCount} />}

      {batchElements}
    </div>
  );
};

export default AddAnimalDetails;
