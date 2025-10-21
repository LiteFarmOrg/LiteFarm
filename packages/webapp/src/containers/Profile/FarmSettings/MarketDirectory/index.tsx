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

import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from './styles.module.scss';
import CardLayout from '../../../../components/Layout/CardLayout';
import { useFarmSettingsRouterTabs } from '../useFarmSettingsRouterTabs';
import RouterTab from '../../../../components/RouterTab';
import { Variant as TabVariants } from '../../../../components/RouterTab/Tab';
import ExpandableItem from '../../../../components/Expandable/ExpandableItem';
import useExpandable from '../../../../components/Expandable/useExpandableItem';
import { ReactComponent as CheckComplete } from '../../../../assets/images/check-complete.svg';
import { ReactComponent as CheckIncomplete } from '../../../../assets/images/check-incomplete.svg';
import MarketDirectoryInfoForm from './MarketDirectoryInfoForm';
import MarketDirectoryConsent from './MarketDirectoryConsent';

enum FormCards {
  INFO,
}

const MarketDirectory = () => {
  const history = useHistory();
  const routerTabs = useFarmSettingsRouterTabs();
  const { t } = useTranslation();

  const { expandedIds, toggleExpanded, unExpand } = useExpandable({ isSingleExpandable: true });

  const [isComplete, setIsComplete] = useState(false);

  const formCards = [
    {
      key: FormCards.INFO,
      title: t('MARKET_DIRECTORY.MARKET_DIRECTORY_INFO'),
      content: (
        <MarketDirectoryInfoForm
          isComplete={isComplete}
          setIsComplete={setIsComplete}
          close={() => unExpand(FormCards.INFO)}
        />
      ),
    },
  ];

  return (
    <CardLayout>
      <RouterTab tabs={routerTabs} variant={TabVariants.UNDERLINE} history={history} />

      <div className={styles.container}>
        <DirectoryBadge t={t} />

        {formCards.map(({ key, title, content }) => {
          const isExpanded = expandedIds.includes(key);
          return (
            <div key={key} className={clsx(styles.form, isExpanded && styles.expanded)}>
              <ExpandableItem
                itemKey={key}
                isExpanded={isExpanded}
                onClick={() => toggleExpanded(key)}
                mainContent={
                  <FormHeader title={title} isExpanded={isExpanded} isComplete={isComplete} />
                }
                expandedContent={content}
                leftCollapseIcon
                iconClickOnly={false}
              />
            </div>
          );
        })}

        <MarketDirectoryConsent disabled={!isComplete} />
      </div>
    </CardLayout>
  );
};

export default MarketDirectory;

const DirectoryBadge = ({ t }: { t: TFunction }) => {
  return (
    <div className={styles.badge}>
      <h4 className={styles.title}>{t('MARKET_DIRECTORY.BADGES.GET_LISTED')}</h4>
      <p>{t('MARKET_DIRECTORY.BADGES.COMPLETE_PROFILE')}</p>
    </div>
  );
};

const FormHeader = ({
  title,
  isExpanded,
  isComplete,
}: {
  title: string;
  isExpanded: boolean;
  isComplete: boolean;
}) => {
  return (
    <div className={clsx(styles.formHeader, isExpanded && styles.expanded)}>
      <p>{title}</p>
      {isComplete ? <CheckComplete /> : <CheckIncomplete />}
    </div>
  );
};
