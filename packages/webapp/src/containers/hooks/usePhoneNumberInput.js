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
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCountryCode } from '../Country/saga';
import { countryReducerSelector } from '../countrySlice';
import { countryIdSelector } from '../userFarmSlice';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

export default function usePhoneNumberInput({ defaultPhone }) {
  const [phone, setPhone] = useState(defaultPhone);

  const dispatch = useDispatch();
  const { selectOptions, codeById } = useSelector(countryReducerSelector);
  const country_id = useSelector(countryIdSelector);
  const language = getLanguageFromLocalStorage();

  // Set defaultCountry only if the user has not set phone number.
  // If the existing phone number starts with "+", the library auto-selects the country.
  // Otherwise, the libary shows "international" icon.
  const defaultCountry = useMemo(() => {
    if (!defaultPhone) {
      return codeById[country_id]?.country_code;
    }
    return undefined;
  }, []);

  useEffect(() => {
    dispatch(getCountryCode());
  }, []);

  return { defaultCountry, countryOptions: selectOptions[language], phone, setPhone };
}
