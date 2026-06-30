/*
 *  Copyright 2025 LiteFarm.org
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

import { PRODUCT_FIELD_NAMES } from '../../Task/AddSoilAmendmentProducts/types';
import {
  ElementalUnit,
  MolecularCompoundsUnit,
  type SoilAmendmentProduct,
} from '../../../store/api/types';

const {
  FERTILISER_TYPE_ID,
  MOISTURE_CONTENT,
  DRY_MATTER_CONTENT,
  SUPPLIER,
  PERMITTED,
  COMPOSITION,
  ELEMENTAL_UNIT,
  N,
  P,
  K,
  CA,
  MG,
  S,
  CU,
  MN,
  B,
  AMMONIUM,
  NITRATE,
  MOLECULAR_COMPOUNDS_UNIT,
} = PRODUCT_FIELD_NAMES;

export const subtractFrom100 = (value: number) => +(100 * 100 - value * 100) / 100;

export const getSoilAmendmentFormValues = (product?: SoilAmendmentProduct) => {
  const soilAmendmentProduct = product?.soil_amendment_product;
  const newDryMatterContent =
    typeof soilAmendmentProduct?.[MOISTURE_CONTENT] === 'number'
      ? subtractFrom100(soilAmendmentProduct[MOISTURE_CONTENT] as number)
      : undefined;

  return {
    [SUPPLIER]: product?.[SUPPLIER] || '',
    [PERMITTED]: product?.[PERMITTED] || undefined,
    [FERTILISER_TYPE_ID]: soilAmendmentProduct?.[FERTILISER_TYPE_ID] || undefined,
    [MOISTURE_CONTENT]: soilAmendmentProduct?.[MOISTURE_CONTENT] ?? NaN,
    [DRY_MATTER_CONTENT]: newDryMatterContent,
    [COMPOSITION]: {
      [ELEMENTAL_UNIT]: soilAmendmentProduct?.[ELEMENTAL_UNIT] || ElementalUnit.RATIO,
      [N]: soilAmendmentProduct?.[N] ?? NaN,
      [P]: soilAmendmentProduct?.[P] ?? NaN,
      [K]: soilAmendmentProduct?.[K] ?? NaN,
      [CA]: soilAmendmentProduct?.[CA] ?? NaN,
      [MG]: soilAmendmentProduct?.[MG] ?? NaN,
      [S]: soilAmendmentProduct?.[S] ?? NaN,
      [CU]: soilAmendmentProduct?.[CU] ?? NaN,
      [MN]: soilAmendmentProduct?.[MN] ?? NaN,
      [B]: soilAmendmentProduct?.[B] ?? NaN,
    },
    [AMMONIUM]: soilAmendmentProduct?.[AMMONIUM] ?? NaN,
    [NITRATE]: soilAmendmentProduct?.[NITRATE] ?? NaN,
    [MOLECULAR_COMPOUNDS_UNIT]:
      soilAmendmentProduct?.[MOLECULAR_COMPOUNDS_UNIT] ?? MolecularCompoundsUnit.PPM,
  };
};
