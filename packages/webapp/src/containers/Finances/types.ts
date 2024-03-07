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

export interface ExpenseType {
  expense_name: string;
  farm_id: string | null;
  expense_type_id: string;
  deleted: boolean;
  expense_translation_key: string;
  custom_description: string | null;
  retired: boolean;
}

export interface RevenueType {
  revenue_type_id: number;
  revenue_name: string;
  revenue_translation_key: string;
  farm_id: string | null;
  deleted: boolean;
  agriculture_associated: boolean | null;
  crop_generated: boolean;
  custom_description: string | null;
  retired: boolean;
}
