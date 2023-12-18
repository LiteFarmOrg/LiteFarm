/*
 *  Copyright 2023 LiteFarm.org
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
import { expect, describe, test } from 'vitest';
import i18n from '../locales/i18n';
import { formatTransactionDate } from '../containers/Finances/util';

describe('Finance utility tests', () => {
  describe('format transaction date in English', () => {
    test(`Today's date should be "Today"`, () => {
      const today = new Date();
      expect(formatTransactionDate(today, 'en')).toBe(i18n.t('common:TODAY'));
    });
    test(`The previous date should be "Yesterday"`, () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatTransactionDate(yesterday, 'en')).toBe(i18n.t('common:YESTERDAY'));
    });
    test('"2024-01-01" should be "January 1, 2024"', () => {
      const date = new Date(2024, 0, 1);
      expect(formatTransactionDate(date, 'en')).toBe('January 1, 2024');
    });
  });
});
