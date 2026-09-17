/*
 *  Copyright 2026 LiteFarm.org
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

import { FunctionFactory, Model, QuestionSelectBase } from 'survey-core';

const TLU_RATES: Record<string, number> = {
  cow_bull: 0.7,
  bison: 0.7,
  water_buffalo: 0.7,
  horse: 0.8,
  reindeer: 0.4,
  donkey: 0.5,
  mule: 0.6,
  sheep: 0.1,
  goat: 0.1,
  pig: 0.2,
  camel: 0.7,
  llama: 0.4,
  rabbit: 0.02,
  chicken: 0.01,
  duck: 0.01,
  goose: 0.02,
  turkey: 0.02,
  pigeon: 0.005,
  ostrich: 0.05,
  fish: 0.001,
  crustaceans: 0.001,
  molluscs: 0.001,
  peacock: 0.02,
  crocodiles: 0.05,
};

interface ExpressionContext {
  survey?: Model;
}

// Gets the display label of the Nth selected item from a tagbox.
// Used for crop names, animal names, and product names in panel titles.
FunctionFactory.Instance.register(
  'itemName',
  function (this: ExpressionContext, [values, index, fieldName]: any[]) {
    if (!Array.isArray(values) || index == null || index < 0) {
      return '';
    }
    const code = values[index];
    if (code === undefined) {
      return '';
    }
    const question = this.survey?.getQuestionByName(fieldName) as QuestionSelectBase | undefined;
    const choice = question?.choices?.find((c) => c.value == code);
    return choice ? choice.text : code;
  },
  false,
);

// Gets the Nth selected value (stored code) from a tagbox.
// Used in biodiversity to identify which animal species each panel refers to.
FunctionFactory.Instance.register(
  'selectedAt',
  function ([values, index]: any[]) {
    if (!Array.isArray(values) || index == null || index < 0) {
      return null;
    }
    const value = values[index];
    return value === undefined ? null : value;
  },
  false,
);

// Gets a field value from another paneldynamic at the same panel index.
// Used in biodiversity to pull crop area and variety count from productivity.
FunctionFactory.Instance.register(
  'getPanelValue',
  function ([panels, index, fieldName]: any[]) {
    if (!Array.isArray(panels) || index == null || index < 0) {
      return null;
    }
    const panel = panels[index];
    return panel && panel[fieldName] !== undefined ? panel[fieldName] : null;
  },
  false,
);

FunctionFactory.Instance.register(
  'getTLUFactor',
  function ([animalCode]: any[]) {
    return TLU_RATES[animalCode] ?? 0;
  },
  false,
);
