/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import i18n from '../../locales/i18n';

export const getUnitOptionMap = () => ({
  h: { label: 'h', value: 'h' },
  min: { label: 'm', value: 'min' },
  deg: { label: '%', value: '%' },
  mm: { label: 'mm', value: 'mm' },
  m2: { label: 'm²', value: 'm2' },
  ha: { label: 'ha', value: 'ha' },
  ft2: { label: 'ft²', value: 'ft2' },
  ac: { label: 'ac', value: 'ac' },
  cm: { label: 'cm', value: 'cm' },
  m: { label: 'm', value: 'm' },
  km: { label: 'km', value: 'km' },
  in: { label: 'in', value: 'in' },
  ft: { label: 'ft', value: 'ft' },
  'fl-oz': { label: 'fl oz', value: 'fl-oz' },
  gal: { label: 'gal', value: 'gal' },
  l: { label: 'l', value: 'l' },
  ml: { label: 'ml', value: 'ml' },
  mi: { label: 'mi', value: 'mi' },
  'l/min': { label: 'l/m', value: 'l/min' },
  'l/h': { label: 'l/h', value: 'l/h' },
  'gal/min': { label: 'g/m', value: 'gal/min' },
  'gal/h': { label: 'g/h', value: 'gal/h' },
  g: { label: 'g', value: 'g' },
  kg: { label: 'kg', value: 'kg' },
  mt: { label: 'mt', value: 'mt' },
  oz: { label: 'oz', value: 'oz' },
  lb: { label: 'lb', value: 'lb' },
  t: { label: 't', value: 't' },
  d: { label: i18n.t('UNIT.TIME.DAY'), value: 'd' },
  year: { label: i18n.t('UNIT.TIME.YEAR'), value: 'year' },
  week: { label: i18n.t('UNIT.TIME.WEEK'), value: 'week' },
  month: { label: i18n.t('UNIT.TIME.MONTH'), value: 'month' },
});
