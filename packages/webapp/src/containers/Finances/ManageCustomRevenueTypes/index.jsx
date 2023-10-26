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
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureManageCustomTypes from '../../../components/Forms/ManageCustomTypes';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useSortedCustomRevenueTypes from '../useSortedCustomRevenueTypes';
import { icons } from '../AddSale/RevenueTypes';
import labelIconStyles from '../../../components/Tile/styles.module.scss';

const addCustomTypePath = '/add_custom_revenue';

const getPaths = (typeId) => ({
  readOnly: `/readonly_custom_revenue/${typeId}`,
  edit: `/edit_custom_revenue/${typeId}`,
});

export default function ManageRevenueTypes({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const customTypes = useSortedCustomRevenueTypes();

  const onTileClick = (typeId) => {
    const { readOnly, edit } = getPaths(typeId);
    dispatch(setPersistedPaths([readOnly, edit]));

    history.push(readOnly);
  };

  useEffect(() => {
    // Manipulate page navigation by pushing "/revenue_types" on top of "/Finances".
    // When browser's back button or form's back button is clicked, we want to
    // navigate the user to "/revenue_types" not "/Finances".
    const unlisten = history.listen(() => {
      if (history.action === 'POP' && history.location.pathname === '/Finances') {
        dispatch(setPersistedPaths(['/revenue_types', '/add_sale']));
        unlisten();
        history.push('/revenue_types');
      } else if (
        // unlisten when the user gets out of the page without going back to '/Finances'.
        // pathname: "/manage_custom_revenue" happens when the user lands on this page.
        !(
          history.location.pathname === `/manage_custom_revenues` ||
          (history.action === 'POP' && history.location.pathname === '/Finances')
        )
      ) {
        unlisten();
      }
    });
  }, []);

  const onAddType = () => {
    setPersistedPaths(addCustomTypePath);
    history.push(addCustomTypePath);
  };

  return (
    <PureManageCustomTypes
      title={t('SALE.ADD_SALE.MANAGE_CUSTOM_REVENUE_TYPE')}
      handleGoBack={history.back}
      addLinkText={t('SALE.ADD_SALE.ADD_CUSTOM_REVENUE_TYPE')}
      onAddType={onAddType}
      tileData={customTypes}
      formatTileData={(data) => {
        const {
          farm_id,
          revenue_translation_key,
          revenue_name,
          revenue_type_id,
          custom_description,
        } = data;

        return {
          key: revenue_type_id,
          icon: icons[farm_id ? 'CUSTOM' : revenue_translation_key],
          label: farm_id ? revenue_name : t(`revenue:${revenue_translation_key}.REVENUE_NAME`),
          className: labelIconStyles.boldLabelIcon,
          description: farm_id
            ? custom_description
            : t(`revenue:${revenue_translation_key}.REVENUE_NAME`),
          onClick: () => onTileClick(revenue_type_id),
        };
      }}
    />
  );
}
