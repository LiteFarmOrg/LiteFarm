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
import { DIRECTORY_INFO_FIELDS } from '../InfoForm/types';
import { MarketDirectoryInfo } from '../../../../../store/api/types';
import styles from './styles.module.scss';

const ID = 'summamry';

interface ComponentProps {
  marketDirectoryInfo?: MarketDirectoryInfo;
}

const DataSummary = ({ marketDirectoryInfo }: ComponentProps) => {
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
          <DataSummaryList marketDirectoryInfo={marketDirectoryInfo} />
        </div>
      </Collapse>
    </div>
  );
};

const DataSummaryList = ({ marketDirectoryInfo }: ComponentProps) => {
  const { t } = useTranslation(['translation', 'common']);

  const getClassName = (properties: (keyof MarketDirectoryInfo)[]) => {
    for (let property of properties) {
      if (marketDirectoryInfo?.[property]) {
        return styles.hasData;
      }
    }
    return undefined;
  };

  return (
    <ul className={styles.dataSummaryList}>
      <li>
        {t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_PROFILE')}
        <ul>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.FARM_NAME])}>
            {t('MARKET_DIRECTORY.INFO_FORM.FARM_NAME')}
          </li>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.LOGO])}>
            {t('MARKET_DIRECTORY.INFO_FORM.FARM_LOGO')}
          </li>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.ADDRESS])}>
            {t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_ADDRESS')}
          </li>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.ABOUT])}>
            {t('MARKET_DIRECTORY.INFO_FORM.ABOUT')}
          </li>
        </ul>
      </li>
      <li>
        {t('common:CONTACT')}
        <ul>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.CONTACT_EMAIL])}>
            {t('MARKET_DIRECTORY.INFO_SUMMARY.EMAIL')}
          </li>
          <li className={getClassName([DIRECTORY_INFO_FIELDS.PHONE_NUMBER])}>
            {t('MARKET_DIRECTORY.INFO_SUMMARY.PHONE')}
          </li>
        </ul>
      </li>
      <li>
        {t('MARKET_DIRECTORY.INFO_FORM.ONLINE_PRESENCE')}
        <ul>
          <li
            className={getClassName([
              DIRECTORY_INFO_FIELDS.WEBSITE,
              DIRECTORY_INFO_FIELDS.INSTAGRAM,
              DIRECTORY_INFO_FIELDS.FACEBOOK,
              DIRECTORY_INFO_FIELDS.X,
            ])}
          >
            {t('MARKET_DIRECTORY.INFO_SUMMARY.ONLINE_PRESENCE_ITEM')}
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default DataSummary;
