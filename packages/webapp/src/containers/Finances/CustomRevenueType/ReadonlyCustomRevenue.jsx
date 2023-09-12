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

import PureSimpleCustomType from '../../../components/Forms/SimpleCustomType';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { deleteRevenueType } from '../saga';
import { revenueTypeSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME } from './constants';

function ReadOnlyCustomRevenue({ history, match }) {
  const { revenue_type_id } = match.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedCustomRevenueType = useSelector(revenueTypeSelector(Number(revenue_type_id)));
  const { revenue_name } = selectedCustomRevenueType;

  const handleGoBack = () => {
    history.back();
  };

  const handleEdit = () => {
    history.push(`/edit_custom_revenue/${revenue_type_id}`);
  };

  const onRetire = () => {
    dispatch(deleteRevenueType(Number(revenue_type_id)));
  };

  return (
    <PureSimpleCustomType
      handleGoBack={handleGoBack}
      onClick={handleEdit}
      view="read-only"
      buttonText={t('common:EDIT')}
      pageTitle={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_TYPE')}
      inputLabel={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_NAME')}
      customTypeRegister={CUSTOM_REVENUE_NAME}
      defaultValue={revenue_name}
      onRetire={onRetire}
      retireLinkText={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_TYPE')}
      retireHeader={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_TYPE')}
      retireMessage={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_MESSAGE')}
    />
  );
}

export default ReadOnlyCustomRevenue;
