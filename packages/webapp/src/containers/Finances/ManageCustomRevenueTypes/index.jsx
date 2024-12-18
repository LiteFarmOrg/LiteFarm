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
import labelIconStyles from '../../../components/Tile/styles.module.scss';
import {
  ADD_REVENUE_URL,
  FINANCES_HOME_URL,
  MANAGE_CUSTOM_REVENUES_URL,
  REVENUE_TYPES_URL,
  ADD_CUSTOM_REVENUE_URL,
  createReadonlyCustomRevenueUrl,
  createEditCustomRevenueUrl,
} from '../../../util/siteMapConstants';
import { useLocation, useNavigate, useNavigationType } from 'react-router';

const addCustomTypePath = ADD_CUSTOM_REVENUE_URL;

const getPaths = (typeId) => ({
  readOnly: createReadonlyCustomRevenueUrl(typeId),
  edit: createEditCustomRevenueUrl(typeId),
});

export default function ManageRevenueTypes() {
  let navigate = useNavigate();
  let navType = useNavigationType();
  let location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const customTypes = useSortedCustomRevenueTypes();

  const onItemClick = (typeId) => {
    const { readOnly, edit } = getPaths(typeId);
    dispatch(setPersistedPaths([readOnly, edit]));

    navigate(readOnly);
  };

  useEffect(() => {
    // Manipulate page navigation by pushing REVENUE_TYPES_URL on top of FINANCES_HOME_URL.
    // When browser's back button or form's back button is clicked, we want to
    // navigate the user to REVENUE_TYPES_URL not FINANCES_HOME_URL.
    if (navType === 'POP' && location.pathname === FINANCES_HOME_URL) {
      dispatch(setPersistedPaths([REVENUE_TYPES_URL, ADD_REVENUE_URL]));
      navigate(REVENUE_TYPES_URL);
    }
    // unlisten when the user gets out of the page without going back to FINANCES_HOME_URL.
    // pathname: "/manage_custom_revenue" happens when the user lands on this page.
  }, [location]);

  const onAddType = () => {
    setPersistedPaths(addCustomTypePath);
    navigate(addCustomTypePath);
  };

  return (
    <PureManageCustomTypes
      title={t('SALE.ADD_SALE.MANAGE_CUSTOM_REVENUE_TYPE')}
      handleGoBack={() => navigate(-1)}
      addLinkText={t('SALE.ADD_SALE.ADD_CUSTOM_REVENUE_TYPE')}
      onAddType={onAddType}
      listItemData={customTypes}
      formatListItemData={(data) => {
        const { revenue_name, revenue_type_id, custom_description } = data;

        return {
          key: revenue_type_id,
          iconName: 'CUSTOM',
          label: revenue_name,
          className: labelIconStyles.boldLabelIcon,
          description: custom_description,
          onClick: () => onItemClick(revenue_type_id),
        };
      }}
    />
  );
}
