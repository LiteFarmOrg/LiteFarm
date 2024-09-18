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
import { useTranslation } from 'react-i18next';

const genderOptions = [
  { value: 'MALE', label: 'gender:MALE' },
  { value: 'FEMALE', label: 'gender:FEMALE' },
  { value: 'OTHER', label: 'gender:OTHER' },
  { value: 'PREFER_NOT_TO_SAY', label: 'gender:PREFER_NOT_TO_SAY' },
];

const useGenderOptions = () => {
  const { t } = useTranslation();
  const getGenderOptionLabel = (option) => t(option.label);

  return { genderOptions, getGenderOptionLabel };
};

export default useGenderOptions;
