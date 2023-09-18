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
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { ReactComponent as CropSaleIcon } from '../../../../assets/images/log/crop_sale.svg';
import { ReactComponent as CustomTypeIcon } from '../../../../assets/images/log/custom_revenue.svg';
import PureFinanceTypeSelection from '../../../../components/Finances/PureFinanceTypeSelection';
import useSortedRevenueTypes from './useSortedRevenueTypes';
import styles from '../../NewExpense/ExpenseCategories/styles.module.scss';

export const icons = {
  CROP_SALE: <CropSaleIcon />,
  CUSTOM: <CustomTypeIcon />,
};

export default function RevenueTypes({ useHookFormPersist, history }) {
  const { t } = useTranslation(['translation', 'revenue']);
  const revenueTypes = useSortedRevenueTypes();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const getOnTileClickFunc = (setValue) => {
    return (typeId) => {
      setValue('revenue_type_id', typeId);
      history.push('/add_sale');
    };
  };

  const getFormatTileDataFunc = (setValue) => {
    return (data) => {
      const { farm_id, revenue_translation_key, revenue_type_id, revenue_name } = data;

      return {
        key: revenue_type_id,
        tileKey: revenue_type_id,
        icon: icons[farm_id ? 'CUSTOM' : revenue_translation_key],
        label: farm_id ? revenue_name : t(`revenue:${revenue_translation_key}`),
        onClick: () => getOnTileClickFunc(setValue)(revenue_type_id),
        className: styles.labelIcon,
        selected: persistedFormData?.revenue_type_id === revenue_type_id,
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
        onGoToManageCustomType={() => history.push('/manage_custom_revenues')}
        getFormatTileDataFunc={getFormatTileDataFunc}
        useHookFormPersist={useHookFormPersist}
      />
    </HookFormPersistProvider>
  );
}

RevenueTypes.propTypes = {
  useHookFormPersist: PropTypes.func,
  history: PropTypes.object,
};
