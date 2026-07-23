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

import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
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
import MarketDirectoryInfoForm from './InfoForm';
import MarketDirectoryConsent from './Consent';
import MarketDirectoryCertifications from './Certifications';
import { loginSelector } from '../../../userFarmSlice';
import { useGetMarketDirectoryInfoQuery } from '../../../../store/api/marketDirectoryInfoApi';
import { useGetMarketProductCategoriesQuery } from '../../../../store/api/marketProductCategoryApi';
import { useGetCertificationsQuery } from '../../../../store/api/certificationsApi';
import {
  useGetSupportedCertifiersQuery,
  useGetSupportedCertificationSystemTypesQuery,
} from '../../../../store/api/certifiersApi';

// When adding/removing forms, update farmCardsLength below to match the number of enum values
enum FormCards {
  INFO,
  CERTIFICATIONS,
}

const farmCardsLength = 2;

const MarketDirectory = () => {
  const history = useHistory();
  const routerTabs = useFarmSettingsRouterTabs();
  const { t } = useTranslation();
  const { farm_id } = useSelector(loginSelector);

  const { expandedIds, toggleExpanded, unExpand } = useExpandable({ isSingleExpandable: true });

  const [completionStatus, setCompletionStatus] = useState<Partial<Record<FormCards, boolean>>>({
    [FormCards.CERTIFICATIONS]: true,
  });

  const updateCompletionStatus = (formKey: FormCards, isComplete: boolean) => {
    setCompletionStatus((prev) => ({
      ...prev,
      [formKey]: isComplete,
    }));
  };

  // Keep undefined until all forms have reported their status to prevent
  // false->true transition issues in MarketDirectoryConsent
  const areAllFormsComplete =
    Object.keys(completionStatus).length === farmCardsLength
      ? Object.values(completionStatus).every(Boolean)
      : undefined;

  const { data: marketDirectoryInfo, isLoading: isMarketDirectoryInfoLoading } =
    useGetMarketDirectoryInfoQuery();

  const { data: marketProductCategories = [], isLoading: isMarketProductCategoriesLoading } =
    useGetMarketProductCategoriesQuery();

  const { data: activeCertifications = [], isLoading: isCertificationsLoading } =
    useGetCertificationsQuery(undefined, {
      selectFromResult: ({ data, isLoading }) => ({
        data: data?.filter((cert) => cert.is_active),
        isLoading,
      }),
    });
  const { data: certifiers = [], isLoading: isCertifiersLoading } = useGetSupportedCertifiersQuery(
    farm_id!,
  );
  const { data: systemTypes = [], isLoading: isSystemTypesLoading } =
    useGetSupportedCertificationSystemTypesQuery(farm_id!);

  const isMarketDirectoryDataLoading = [
    isMarketDirectoryInfoLoading,
    isMarketProductCategoriesLoading,
    !marketProductCategories.length,
  ].some(Boolean);

  const isCertificationDataLoading =
    isCertificationsLoading || isCertifiersLoading || isSystemTypesLoading;

  useEffect(() => {
    if (!isMarketDirectoryInfoLoading) {
      updateCompletionStatus(FormCards.INFO, !!marketDirectoryInfo);
    }
  }, [isMarketDirectoryInfoLoading, marketDirectoryInfo]);

  const formCards = [
    {
      key: FormCards.INFO,
      title: t('MARKET_DIRECTORY.MARKET_DIRECTORY_INFO'),
      content: !isMarketDirectoryDataLoading && (
        <MarketDirectoryInfoForm
          marketDirectoryInfo={marketDirectoryInfo}
          close={() => unExpand(FormCards.INFO)}
          marketProductCategories={marketProductCategories}
        />
      ),
    },
    {
      key: FormCards.CERTIFICATIONS,
      title: t('MENU.CERTIFICATIONS'),
      content: !isCertificationDataLoading && (
        <MarketDirectoryCertifications
          certifications={activeCertifications}
          systemTypes={systemTypes}
          certifiers={certifiers}
        />
      ),
    },
  ];

  return (
    <CardLayout>
      <RouterTab tabs={routerTabs} variant={TabVariants.UNDERLINE} history={history} />

      <div className={styles.container}>
        <DirectoryCallout t={t} />

        <div className={styles.formCards}>
          {formCards.map(({ key, title, content }) => {
            const isExpanded = expandedIds.includes(key);

            return (
              <div key={key} className={clsx(styles.formCard, isExpanded && styles.expanded)}>
                <ExpandableItem
                  itemKey={key}
                  isExpanded={isExpanded}
                  onClick={() => toggleExpanded(key)}
                  mainContent={
                    <ExpandableHeader
                      title={title}
                      isExpanded={isExpanded}
                      isComplete={completionStatus[key] || false}
                    />
                  }
                  expandedContent={content}
                  leftCollapseIcon
                  iconClickOnly={false}
                />
              </div>
            );
          })}
        </div>

        {areAllFormsComplete !== undefined && (
          <MarketDirectoryConsent
            canConsent={areAllFormsComplete}
            marketDirectoryInfo={marketDirectoryInfo}
            certifications={activeCertifications}
            systemTypes={systemTypes}
            certifiers={certifiers}
          />
        )}
      </div>
    </CardLayout>
  );
};

export default MarketDirectory;

const DirectoryCallout = ({ t }: { t: TFunction }) => {
  return (
    <div className={styles.callout}>
      <h4 className={styles.calloutTitle}>{t('MARKET_DIRECTORY.GET_LISTED')}</h4>
      <p>{t('MARKET_DIRECTORY.COMPLETE_PROFILE')}</p>
    </div>
  );
};

const ExpandableHeader = ({
  title,
  isExpanded,
  isComplete,
}: {
  title: string;
  isExpanded: boolean;
  isComplete: boolean;
}) => {
  return (
    <div className={clsx(styles.expandableHeader, isExpanded && styles.expanded)}>
      <p>{title}</p>
      {isComplete ? <CheckComplete /> : <CheckIncomplete />}
    </div>
  );
};
