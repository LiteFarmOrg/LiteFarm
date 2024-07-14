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

import { SoilAmendmentPurpose } from '../store/api/types';

interface PurposeRelationship {
  purpose_id: number;
  other_purpose?: string;
}

type DBSoilAmendmentTaskProduct = {
  purpose_relationships: PurposeRelationship[];
  [key: string]: any;
};

type FormSoilAmendmentTaskProduct = {
  purposes: number[];
  other_purpose?: string;
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

export const formatSoilAmendmentTaskToFormStructure = (
  task: DBSoilAmendmentTask,
): FormSoilAmendmentTask => {
  const taskClone = structuredClone(task);

  const formattedTaskProducts = task.soil_amendment_task_products.map(
    (dbTaskProduct: DBSoilAmendmentTaskProduct): FormSoilAmendmentTaskProduct => {
      const { purpose_relationships, ...rest } = dbTaskProduct;
      const formattedTaskProduct = { ...rest, purposes: [] } as FormSoilAmendmentTaskProduct;

      dbTaskProduct.purpose_relationships.forEach(({ purpose_id, other_purpose }) => {
        if (other_purpose) {
          formattedTaskProduct.other_purpose = other_purpose;
        }
        formattedTaskProduct.purposes.push(purpose_id);
      });

      return formattedTaskProduct;
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
    return { purpose_id, other_purpose: purpose_id === otherPurposeId ? otherPurpose : undefined };
  });
};

export const formatSoilAmendmentProductToDBStructure = (
  soilAmendmentTaskProducts: FormSoilAmendmentTaskProduct[],
  { purposes }: { purposes: SoilAmendmentPurpose[] },
): DBSoilAmendmentTaskProduct[] => {
  const otherPurposeId = purposes?.find(({ key }) => key === 'OTHER')?.id;
  if (!otherPurposeId) {
    throw Error('id for OTHER purpose does not exist');
  }
  return soilAmendmentTaskProducts.map(({ purposes: purposeIds, other_purpose, ...rest }) => {
    return {
      ...rest,
      purpose_relationships: formatPurposeIdsToRelationships(
        purposeIds,
        other_purpose,
        otherPurposeId,
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
