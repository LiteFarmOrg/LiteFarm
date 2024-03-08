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

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { setPersistedPaths } from '../../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import history from '../../../history';
import DropdownButton from '../../Form/DropDownButton';
import FloatingButtonMenu from '../../Menu/FloatingButtonMenu';
import FloatingMenu from '../../Menu/FloatingButtonMenu/FloatingMenu';
import {
  ADD_EXPENSE_URL,
  ADD_REVENUE_URL,
  EXPENSE_CATEGORIES_URL,
  REVENUE_TYPES_URL,
} from '../../../util/siteMapConstants';

const Menu = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleAddRevenueClick = () => {
    dispatch(setPersistedPaths([REVENUE_TYPES_URL, ADD_REVENUE_URL]));
    history.push(REVENUE_TYPES_URL);
  };

  const handleAddExpenseClick = () => {
    dispatch(setPersistedPaths([EXPENSE_CATEGORIES_URL, ADD_EXPENSE_URL]));
    history.push(EXPENSE_CATEGORIES_URL);
  };

  return (
    <FloatingMenu
      ref={ref}
      options={[
        { label: t('FINANCES.ADD_REVENUE'), onClick: handleAddRevenueClick },
        { label: t('FINANCES.ADD_EXPENSE'), onClick: handleAddExpenseClick },
      ]}
      {...props}
    />
  );
});
Menu.displayName = 'Menu';

export default function AddTransactionButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isAboveBreakPoint = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      {isAboveBreakPoint === true ? (
        <DropdownButton type={'v2'} noIcon={true} Menu={Menu}>
          {t('FINANCES.ADD_TRANSACTION')}
        </DropdownButton>
      ) : (
        <FloatingButtonMenu type={'add'} Menu={Menu} />
      )}
    </>
  );
}
