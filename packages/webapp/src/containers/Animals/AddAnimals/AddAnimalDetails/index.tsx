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

import { ReactElement } from 'react';
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
import { AnimalOrBatchKeys, AnimalOrigins } from '../../types';
import { parseUniqueAnimalId } from '../../../../util/animal';
import { getDefaultAnimalIconName } from '../../Inventory/useAnimalInventory';
import usePopulateDetails from './usePopulateDetails';

const AddAnimalDetails = () => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const { t } = useTranslation();
  const { control, getValues, watch } = useFormContext<AddAnimalsFormFields>();

  const { fields, remove, replace } = useFieldArray({
    name: STEPS.DETAILS,
    control,
  });

  const onRemoveCard = (index: number): void => {
    remove(index);
  };

  const {
    defaultTypes,
    sexOptions,
    sexDetailsOptions,
    useOptions,
    tagTypeOptions,
    tagColorOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
    'default_types',
    'sex',
    'sexDetails',
    'use',
    'tagType',
    'tagColor',
    'organicStatus',
    'origin',
  );

  /* Populate details form based on basics data */
  usePopulateDetails(getValues, replace);

  /* Render logic */
  const animalElements: ReactElement[] = [];
  const batchElements: ReactElement[] = [];

  const generalDetailProps = {
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
    const namePrefix = `${STEPS.DETAILS}.${index}` as const;
    const isExpanded = expandedIds.includes(field.id);

    const isAnimal = field.animal_or_batch === AnimalOrBatchKeys.ANIMAL;

    const countFieldName = `${namePrefix}.${DetailsFields.COUNT}` as const;
    const watchedCount = watch(countFieldName);

    const originField = `${namePrefix}.${DetailsFields.ORIGIN}` as const;
    const watchedOrigin = watch(originField);

    const origin = !watchedOrigin
      ? undefined
      : watchedOrigin === 1 // TODO enum
        ? AnimalOrigins.BROUGHT_IN
        : AnimalOrigins.BORN_AT_FARM;

    const commonProps = {
      itemKey: field.id,
      isExpanded: isExpanded,
      iconClickOnly: false,
      onClick: () => toggleExpanded(field.id),
    };

    const mainContent = (
      <AnimalFormHeaderItem
        showRemove={fields.length > 1}
        key={field.id}
        isExpanded={isExpanded}
        onRemove={() => onRemoveCard(index)}
        type={field.type.label}
        breed={field.breed?.label}
        totalCount={isAnimal ? animalCount : batchCount}
        number={isAnimal ? animalIndex : batchIndex}
        iconKey={getDefaultAnimalIconName(defaultTypes, parseUniqueAnimalId(field.type.value))}
        isBatch={!isAnimal}
        count={!isAnimal ? watchedCount : undefined}
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
          }}
          otherDetailsProps={otherDetailsProps}
          originProps={{ ...originProps, origin }}
          namePrefix={namePrefix}
        />
      ) : (
        <BatchDetails
          key={field.id}
          generalDetailProps={generalDetailProps}
          otherDetailsProps={otherDetailsProps}
          originProps={{ ...originProps, origin }}
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
      <Info>{t('ADD_ANIMAL.ADD_DETAILS_INFO')}</Info>
    </div>
  );

  return (
    <div className={styles.container}>
      {!!animalCount && (
        <SectionHeader title={t('ANIMAL.FILTER.INDIVIDUALS')} count={animalCount} />
      )}

      {animalElements}

      {!!batchCount && <SectionHeader title={t('ANIMAL.FILTER.BATCHES')} count={batchCount} />}

      {batchElements}
    </div>
  );
};

export default AddAnimalDetails;
