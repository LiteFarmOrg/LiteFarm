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
import { BsChevronRight } from 'react-icons/bs';
import TextButton from '../../../Form/Button/TextButton';
import history from '../../../../history';
import { transactionTypeEnum } from '../../../../containers/Finances/useTransactions';
import CropSaleTable from './CropSaleTable';
import styles from './styles.module.scss';
import LabourTable from './LabourTable';

// TODO LF-3748, 3749
const components = {
  EXPENSE: (props) => <div>expense placeholder</div>,
  REVENUE: (props) => <div>revenue placeholder</div>,
  LABOUR_EXPENSE: ({ data }) => <LabourTable transaction={data} />,
  CROP_SALE: (props) => <CropSaleTable {...props} />,
};

const getDetailPageLink = ({ transactionType, relatedId }) => {
  return {
    LABOUR_EXPENSE: '/labour',
    EXPENSE: `/expense/${relatedId}`,
    REVENUE: `/revenue/${relatedId}`,
  }[transactionType];
};

export default function ExpandedContent({ data, currencySymbol, mobileView }) {
  const { transactionType, cropGenerated } = data;

  const { t } = useTranslation();

  const toDetailText =
    transactionType === transactionTypeEnum.labourExpense
      ? t('FINANCES.TRANSACTION.VIEW_LABOUR')
      : t('FINANCES.TRANSACTION.VIEW_AND_EDIT');

  const componentKey = cropGenerated ? 'CROP_SALE' : transactionType;
  const Component = components[componentKey];

  return (
    <div className={styles.expandedContent}>
      <TextButton className={styles.toDetail} onClick={() => history.push(getDetailPageLink(data))}>
        {toDetailText}
        <BsChevronRight />
      </TextButton>
      <Component data={data} currencySymbol={currencySymbol} mobileView={mobileView} />
    </div>
  );
}
