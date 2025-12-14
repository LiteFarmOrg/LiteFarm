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
import PrivateBadge from '../../../../../components/SimpleBadges/PrivateBadge';
import { ReactComponent as PlusSquareIcon } from '../../../../../assets/images/plus-square.svg';
import { ReactComponent as MinusSquareIcon } from '../../../../../assets/images/minus-square.svg';
import { MarketDirectoryInfo } from '../../../../../store/api/types';
import styles from './styles.module.scss';

const ID = 'summary';

type MarketDirectoryInfoValue = MarketDirectoryInfo[keyof MarketDirectoryInfo];

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
  const {
    farm_name,
    about,
    logo,
    contact_first_name,
    contact_email,
    address,
    phone_number,
    email,
    website,
    instagram,
    facebook,
    x,
    market_product_categories,
  } = marketDirectoryInfo || {};

  return (
    <ul className={styles.dataSummaryList}>
      <li>
        {t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_PROFILE')}
        <ul>
          <ListItem label={t('MARKET_DIRECTORY.INFO_FORM.FARM_NAME')} values={[farm_name]} />
          <ListItem label={t('MARKET_DIRECTORY.INFO_FORM.ABOUT')} values={[about]} />
          <ListItem label={t('MARKET_DIRECTORY.INFO_FORM.FARM_LOGO')} values={[logo]} />
          <ListItem label={t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_ADDRESS')} values={[address]} />
          <ListItem label={t('MARKET_DIRECTORY.INFO_FORM.PHONE_NUMBER')} values={[phone_number]} />
          <ListItem label={t('MARKET_DIRECTORY.INFO_SUMMARY.FARM_EMAIL')} values={[email]} />
        </ul>
      </li>
      <li>
        {t('MARKET_DIRECTORY.INFO_SUMMARY.PRODUCTS_AND_SERVICES')}
        <ul>
          <ListItem
            label={t('MARKET_DIRECTORY.INFO_SUMMARY.PRODUCTS_CATEGORIES')}
            values={[market_product_categories]}
          />
        </ul>
      </li>
      <li>
        <div className={styles.inlineGroup}>
          {t('MARKET_DIRECTORY.INFO_SUMMARY.CONTACT')} <PrivateBadge />
        </div>
        <ul>
          <ListItem
            label={t('MARKET_DIRECTORY.INFO_SUMMARY.FIRST_NAME_AND_LAST_NAME')}
            values={[contact_first_name]}
          />
          <ListItem label={t('common:EMAIL')} values={[contact_email]} />
        </ul>
      </li>

      <li>
        {t('MARKET_DIRECTORY.INFO_FORM.ONLINE_PRESENCE')}
        <ul>
          <ListItem
            label={t('MARKET_DIRECTORY.INFO_SUMMARY.ONLINE_PRESENCE_ITEM')}
            values={[website, instagram, facebook, x]}
          />
        </ul>
      </li>
    </ul>
  );
};

const ListItem = ({ label, values }: { label: string; values: MarketDirectoryInfoValue[] }) => {
  const hasData = values.some((value) => (Array.isArray(value) ? value.length > 0 : !!value));
  return <li className={hasData ? styles.hasData : undefined}>{label}</li>;
};

export default DataSummary;
