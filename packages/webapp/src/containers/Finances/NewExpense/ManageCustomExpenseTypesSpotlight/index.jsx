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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../../Map/saga';
import { TourProviderWrapper } from '../../../../components/TourProviderWrapper/TourProviderWrapper';

export default function ManageCustomExpenseTypesSpotlight({ children }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { manage_custom_expense_type } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('manage_custom_expense_type'));

  return (
    <TourProviderWrapper
      open={!manage_custom_expense_type}
      steps={[
        {
          title: t('SALE.FINANCES.MANAGE_CUSTOM_EXPENSE_TYPES_SPOTLIGHT.TITLE'),
          contents: [t('SALE.FINANCES.MANAGE_CUSTOM_EXPENSE_TYPES_SPOTLIGHT.BODY')],
          selector: `#manageCustomExpenseType`,
          position: 'center',
        },
      ]}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
