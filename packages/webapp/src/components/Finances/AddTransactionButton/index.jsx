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

import { forwardRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import history from '../../../history';
import DropdownButton from '../../Form/DropDownButton';
import FloatingMenu from '../../Menu/FloatingButtonMenu/FloatingMenu';
import FloatingButtonMenu from '../../Menu/FloatingButtonMenu';
import { setPersistedPaths } from '../../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import styles from './styles.module.scss';

const Menu = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleAddRevenueClick = () => {
    dispatch(setPersistedPaths(['/revenue_types', '/add_sale']));
    history.push('/revenue_types');
  };

  const handleAddExpenseClick = () => {
    dispatch(setPersistedPaths(['/expense_categories', '/add_expense']));
    history.push('/expense_categories');
  };

  return (
    <FloatingMenu
      ref={ref}
      classes={{ menuList: styles.menuList }}
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
  // this will get a boolean value later, but initialize with null so that
  // a wrong button will not be shown initially
  const [isAboveBreakPoint, setIsAboveBreakPoint] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const mqString = `(min-width: 768px)`;
    const media = matchMedia(mqString);

    setIsAboveBreakPoint(media.matches);

    media.addEventListener('change', (e) => setIsAboveBreakPoint(e.matches));

    return () => {
      media.removeEventListener('change', setIsAboveBreakPoint);
    };
  }, []);

  return (
    <>
      {isAboveBreakPoint === true ? (
        <DropdownButton type={'v2'} noIcon={true} Menu={Menu} classes={{ button: styles.button }}>
          {t('FINANCES.ADD_TRANSACTION')}
        </DropdownButton>
      ) : (
        <FloatingButtonMenu type={'add'} Menu={Menu} />
      )}
    </>
  );
}
