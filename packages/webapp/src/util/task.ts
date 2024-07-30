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

interface UnitOption {
  label: string;
  value: string;
}

interface PurposeRelationship {
  purpose_id: number;
  other_purpose?: string;
}

type DBSoilAmendmentTaskProduct = {
  purpose_relationships: PurposeRelationship[];
  other_purpose?: string;
  weight?: number | null;
  weight_unit?: string | null;
  volume?: number | null;
  volume_unit?: string | null;
  percent_of_location_amended?: number;
  total_area_amended: number;
  application_rate_weight?: number | null;
  application_rate_weight_unit?: string | null;
  application_rate_volume?: number | null;
  application_rate_volume_unit?: string | null;
  [key: string]: any;
};

type FormSoilAmendmentTaskProduct = {
  purposes: number[];
  other_purpose?: string;
  weight?: number;
  weight_unit?: UnitOption | string;
  volume?: number;
  volume_unit?: UnitOption | string;
  percent_of_location_amended: number;
  total_area_amended: number;
  total_area_amended_unit?: UnitOption | string;
  application_rate_weight?: number;
  application_rate_weight_unit?: UnitOption | string;
  application_rate_volume?: number;
  application_rate_volume_unit?: UnitOption | string;
  is_weight: boolean;
  [key: string]: any;
};

type DBSoilAmendmentTask = {
  soil_amendment_task_products: DBSoilAmendmentTaskProduct[];
  [key: string]: any;
};

type FormSoilAmendmentTask = {
  soil_amendment_task_products: FormSoilAmendmentTaskProduct[];
  [key: string]: any;
};

// Type guard
function isFormSoilAmendmentTask(
  task: DBSoilAmendmentTask | FormSoilAmendmentTask,
): task is FormSoilAmendmentTask {
  return (
    task.soil_amendment_task_products?.[0] && 'purposes' in task.soil_amendment_task_products[0]
  );
}

export const formatSoilAmendmentTaskToFormStructure = (
  task: DBSoilAmendmentTask | FormSoilAmendmentTask,
): FormSoilAmendmentTask => {
  if (isFormSoilAmendmentTask(task)) {
    return task as FormSoilAmendmentTask;
  }

  const taskClone = structuredClone(task);

  const formattedTaskProducts = task.soil_amendment_task_products.map(
    (dbTaskProduct: DBSoilAmendmentTaskProduct): FormSoilAmendmentTaskProduct => {
      const { purpose_relationships, percent_of_location_amended, ...rest } = dbTaskProduct;
      const isWeight = !!(rest.weight || rest.weight === 0);

      const formattedTaskProduct = {
        ...rest,
        purposes: [],
        is_weight: isWeight,
        percent_of_location_amended: percent_of_location_amended ?? 100,
      } as FormSoilAmendmentTaskProduct;

      dbTaskProduct.purpose_relationships.forEach(({ purpose_id, other_purpose }) => {
        if (other_purpose) {
          formattedTaskProduct.other_purpose = other_purpose;
        }
        formattedTaskProduct.purposes.push(purpose_id);
      });

      return {
        ...formattedTaskProduct,
        weight_unit: rest.weight_unit ?? undefined,
        volume_unit: rest.volume_unit ?? undefined,
        total_area_amended_unit: rest.total_area_amended_unit ?? undefined,
        application_rate_weight_unit: rest.application_rate_weight_unit ?? undefined,
        application_rate_volume_unit: rest.application_rate_volume_unit ?? undefined,
      };
    },
  );

  return { ...taskClone, soil_amendment_task_products: formattedTaskProducts };
};

const formatPurposeIdsToRelationships = (
  purposeIds: number[],
  otherPurpose: string | undefined,
  otherPurposeId: number,
): PurposeRelationship[] => {
  return purposeIds.map((purpose_id) => {
    return { purpose_id, other_purpose: purpose_id == otherPurposeId ? otherPurpose : undefined };
  });
};

type RemainingFormSATProductKeys = keyof Omit<
  FormSoilAmendmentTaskProduct,
  'purposes' | 'other_purpose' | 'is_weight'
>;

export const formatSoilAmendmentProductToDBStructure = (
  soilAmendmentTaskProducts: FormSoilAmendmentTaskProduct[] | undefined,
): DBSoilAmendmentTaskProduct[] | undefined => {
  if (!soilAmendmentTaskProducts) {
    return undefined;
  }
  return soilAmendmentTaskProducts.map((formTaskProduct) => {
    const {
      purposes: purposeIds,
      other_purpose,
      other_purpose_id,
      is_weight,
      ...rest
    } = formTaskProduct;

    const propertiesToDelete: RemainingFormSATProductKeys[] = [
      'application_rate_weight',
      'application_rate_volume',
      'total_area_amended_unit',
    ];

    propertiesToDelete.forEach((property) => delete rest[property]);

    return {
      ...rest,
      weight: is_weight ? rest.weight : null,
      weight_unit: is_weight ? (rest.weight_unit as UnitOption)?.value : null,
      application_rate_weight_unit: is_weight
        ? (rest.application_rate_weight_unit as UnitOption)?.value
        : null,
      volume: !is_weight ? rest.volume : null,
      volume_unit: !is_weight ? (rest.volume_unit as UnitOption)?.value : null,
      application_rate_volume_unit: !is_weight
        ? (rest.application_rate_volume_unit as UnitOption)?.value
        : null,
      purpose_relationships: formatPurposeIdsToRelationships(
        purposeIds,
        other_purpose,
        other_purpose_id,
      ),
    };
  });
};

export const formatTaskReadOnlyDefaultValues = (task: {
  taskType?: { task_translation_key: string };
  [key: string]: any;
}) => {
  if (task.taskType?.task_translation_key === 'SOIL_AMENDMENT_TASK') {
    return formatSoilAmendmentTaskToFormStructure(task as DBSoilAmendmentTask);
  }

  return structuredClone(task);
};

// Defined for getRemovedTaskProductIds, could be integrated with the types above later
interface DBTaskProduct {
  id: number;
  [key: string]: any;
}

const extractTaskProductIds = (taskProducts: DBTaskProduct[]): number[] => {
  return taskProducts.map(({ id }) => id);
};

export const getRemovedTaskProductIds = (
  oldTaskProducts: DBTaskProduct[],
  newTaskProducts: DBTaskProduct[],
): number[] => {
  const [oldIds, newIds] = [oldTaskProducts, newTaskProducts].map(extractTaskProductIds);

  return oldIds.filter((id) => !newIds.includes(id));
};
