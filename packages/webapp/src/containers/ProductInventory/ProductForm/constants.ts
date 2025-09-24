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
import SoilAmendmentProductForm from './SoilAmendmentProductForm';
import { TASK_TYPES } from '../../Task/constants';
import { PRODUCT_FIELD_NAMES } from '../../../components/Task/AddSoilAmendmentProducts/types';
import { ElementalUnit, MolecularCompoundsUnit } from '../../../store/api/types';

export const productFormMap = {
  [TASK_TYPES.SOIL_AMENDMENT]: SoilAmendmentProductForm,
};

const {
  PRODUCT_ID,
  NAME,
  SUPPLIER,
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
  MOLECULAR_COMPOUNDS_UNIT,
} = PRODUCT_FIELD_NAMES;

export const soilAmendmentProductDetailsDefaultValues = {
  [SUPPLIER]: '',
  [COMPOSITION]: {
    [ELEMENTAL_UNIT]: ElementalUnit.RATIO,
    [N]: NaN,
    [P]: NaN,
    [K]: NaN,
    [CA]: NaN,
    [MG]: NaN,
    [S]: NaN,
    [CU]: NaN,
    [MN]: NaN,
    [B]: NaN,
  },
  [MOLECULAR_COMPOUNDS_UNIT]: MolecularCompoundsUnit.PPM,
};

export const productDefaultValues = {
  [TASK_TYPES.SOIL_AMENDMENT]: {
    [PRODUCT_ID]: '',
    [NAME]: '',
    ...soilAmendmentProductDetailsDefaultValues,
  },
};
