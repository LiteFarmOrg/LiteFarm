/*
 *  Copyright 2025 LiteFarm.org
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
import { Collapse } from '@mui/material';
import useExpandable from '../../../../../components/Expandable/useExpandableItem';
import TextButton from '../../../../../components/Form/Button/TextButton';
import { ReactComponent as PlusSquareIcon } from '../../../../../assets/images/plus-square.svg';
import { ReactComponent as MinusSquareIcon } from '../../../../../assets/images/minus-square.svg';
import styles from './styles.module.scss';

const ID = 'summamry';

interface DataSummaryProps {}

const DataSummary = ({}: DataSummaryProps) => {
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const isSummaryExpanded = expandedIds.includes(ID);

  return (
    <div className={styles.dataSummary}>
      <TextButton onClick={() => toggleExpanded(ID)} className={styles.title}>
        <span>{t('MARKET_DIRECTORY.CONSENT.SEE_ALL_DATA')}</span>
        {isSummaryExpanded ? <MinusSquareIcon /> : <PlusSquareIcon />}
      </TextButton>
      <Collapse id={ID} in={isSummaryExpanded} timeout="auto" unmountOnExit>
        <div className={styles.content}>
          <DataSummaryList />
        </div>
      </Collapse>
    </div>
  );
};

const DataSummaryList = () => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <ul className={styles.dataSummaryList}>
      <li>
        {t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_PROFILE')}
        <ul>
          <li>{t('MARKET_DIRECTORY.INFO_FORM.FARM_NAME')}</li>
          <li>{t('MARKET_DIRECTORY.INFO_FORM.FARM_LOGO')}</li>
          <li>{t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_ADDRESS')}</li>
          <li>{t('MARKET_DIRECTORY.INFO_FORM.ABOUT')}</li>
        </ul>
      </li>
      <li>
        {t('common:CONTACT')}
        <ul>
          <li>{t('MARKET_DIRECTORY.INFO_SUMMARY.EMAIL')}</li>
          <li>{t('MARKET_DIRECTORY.INFO_SUMMARY.PHONE')}</li>
        </ul>
      </li>
      <li>
        {t('MARKET_DIRECTORY.INFO_FORM.ONLINE_PRESENCE')}
        <ul>
          <li>{t('MARKET_DIRECTORY.INFO_SUMMARY.ONLINE_PRESENCE_ITEM')}</li>
        </ul>
      </li>
    </ul>
  );
};

export default DataSummary;
