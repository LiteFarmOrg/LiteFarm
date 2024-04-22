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
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PureFinanceTypeSelection from '../../../../components/Finances/PureFinanceTypeSelection';
import { listItemTypes } from '../../../../components/List/constants';
import labelIconStyles from '../../../../components/Tile/styles.module.scss';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import ManageCustomRevenueTypesSpotlight from '../ManageCustomRevenueTypeSpotlight';
import useSortedRevenueTypes from './useSortedRevenueTypes';
import { getFinanceTypeSearchableStringFunc } from '../../util';
import { ADD_REVENUE_URL, MANAGE_CUSTOM_REVENUES_URL } from '../../../../util/siteMapConstants';

export default function RevenueTypes({ useHookFormPersist, history }) {
  const { t } = useTranslation(['translation', 'revenue']);
  const revenueTypes = useSortedRevenueTypes();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const getOnTileClickFunc = (setValue) => {
    return (typeId) => {
      setValue('revenue_type_id', typeId);
      history.push(ADD_REVENUE_URL);
    };
  };

  const getFormatListItemDataFunc = (setValue) => {
    return (data) => {
      const {
        farm_id,
        revenue_translation_key,
        revenue_type_id,
        revenue_name,
        custom_description,
      } = data;

      return {
        key: revenue_type_id,
        iconName: farm_id ? 'CUSTOM' : revenue_translation_key,
        label: farm_id ? revenue_name : t(`revenue:${revenue_translation_key}.REVENUE_NAME`),
        onClick: () => getOnTileClickFunc(setValue)(revenue_type_id),
        className: labelIconStyles.boldLabelIcon,
        selected: persistedFormData?.revenue_type_id === revenue_type_id,
        description: farm_id
          ? custom_description
          : t(`revenue:${revenue_translation_key}.CUSTOM_DESCRIPTION`),
      };
    };
  };

  return (
    <HookFormPersistProvider>
      <PureFinanceTypeSelection
        title={t('SALE.ADD_SALE.ADD_REVENUE')}
        leadText={t('SALE.ADD_SALE.WHICH_TYPE_TO_RECORD')}
        cancelTitle={t('SALE.ADD_SALE.FLOW')}
        types={revenueTypes}
        onGoBack={history.back}
        progressValue={33}
        onGoToManageCustomType={() => history.push(MANAGE_CUSTOM_REVENUES_URL)}
        getFormatListItemDataFunc={getFormatListItemDataFunc}
        listItemType={listItemTypes.ICON_DESCRIPTION}
        useHookFormPersist={useHookFormPersist}
        customTypeMessages={{
          info: t('FINANCES.CANT_FIND.INFO_REVENUE'),
          manage: t('FINANCES.CANT_FIND.MANAGE_REVENUE'),
        }}
        getSearchableString={getFinanceTypeSearchableStringFunc('revenue')}
        searchPlaceholderText={t('FINANCES.SEARCH.REVENUE_TYPES')}
        iconLinkId={'manageCustomRevenueType'}
        Wrapper={ManageCustomRevenueTypesSpotlight}
        isAddRevenue={true}
      />
    </HookFormPersistProvider>
  );
}

RevenueTypes.propTypes = {
  useHookFormPersist: PropTypes.func,
  history: PropTypes.object,
};
