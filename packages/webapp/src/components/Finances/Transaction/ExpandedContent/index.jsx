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

import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { transactionTypeEnum } from '../../../../containers/Finances/useTransactions';
import {
  createExpenseDetailsUrl,
  createRevenueDetailsUrl,
  LABOUR_URL,
} from '../../../../util/siteMapConstants';
import TextButton from '../../../Form/Button/TextButton';
import CropSaleTable from './CropSaleTable';
import GeneralTransactionTable from './GeneralTransactionTable';
import LabourTable from './LabourTable';
import styles from './styles.module.scss';

const components = {
  EXPENSE: (props) => <GeneralTransactionTable {...props} />,
  REVENUE: (props) => <GeneralTransactionTable {...props} />,
  LABOUR_EXPENSE: (props) => <LabourTable {...props} />,
  CROP_REVENUE: (props) => <CropSaleTable {...props} />,
};

const getDetailPageLink = ({ transactionType, relatedId }) => {
  return {
    LABOUR_EXPENSE: LABOUR_URL,
    EXPENSE: createExpenseDetailsUrl(relatedId),
    REVENUE: createRevenueDetailsUrl(relatedId),
    CROP_REVENUE: createRevenueDetailsUrl(relatedId),
  }[transactionType];
};

export default function ExpandedContent({ data, currencySymbol, mobileView }) {
  let navigate = useNavigate();
  const { transactionType } = data;

  const { t } = useTranslation();

  const toDetailText =
    transactionType === transactionTypeEnum.labourExpense
      ? t('FINANCES.TRANSACTION.VIEW_LABOUR')
      : t('FINANCES.TRANSACTION.VIEW_AND_EDIT');

  const Component = components[transactionType];

  return (
    <div className={styles.expandedContent}>
      <TextButton className={styles.toDetail} onClick={() => navigate(getDetailPageLink(data))}>
        {toDetailText}
        <BsChevronRight />
      </TextButton>
      <Component data={data} currencySymbol={currencySymbol} mobileView={mobileView} />
    </div>
  );
}
