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

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BiPencil } from 'react-icons/bi';
import { useGetMarketDirectoryPartnersQuery } from '../../../../../store/api/marketDirectoryPartnersApi';
import { useUpdateMarketDirectoryInfoMutation } from '../../../../../store/api/marketDirectoryInfoApi';
import {
  PureMarketDirectoryTile,
  MarketplaceSuggestionTile,
} from '../../../../../components/MarketDirectoryTile';
import Checkbox from '../../../../../components/Form/Checkbox';
import InFormButtons from '../../../../../components/Form/InFormButtons';
import Button from '../../../../../components/Form/Button';
import DataSummary from '../DataSummary';
import { PARTNERS_INFO } from './partners';
import { MarketDirectoryInfo, MarketDirectoryPartner } from '../../../../../store/api/types';
import styles from './styles.module.scss';

interface MarketDirectoryConsentProps {
  canConsent: boolean;
  setFeedbackSurveyOpen: () => void;
  marketDirectoryInfo?: MarketDirectoryInfo;
}

const CONSENTED_TO_SHARE = 'consented_to_share';
const PARTNER_PERMISSION_IDS = 'partnerPermissionIds';

const MarketDirectoryConsent = ({
  canConsent,
  setFeedbackSurveyOpen,
  marketDirectoryInfo,
}: MarketDirectoryConsentProps) => {
  const { t } = useTranslation();
  const { data: marketDirectoryPartners = [] } =
    useGetMarketDirectoryPartnersQuery('?filter=country');
  const [updateMarketDirectoryInfo] = useUpdateMarketDirectoryInfoMutation();

  // When the initial canConsent is true, start in read-only mode.
  // User clicks "Edit" to modify.
  const [isConsentReadonly, setIsConsentReadonly] = useState(canConsent);

  const isConsentFormDisabled = !canConsent || isConsentReadonly;

  const defaultPartnerPermissionIds = useMemo(() => {
    return new Set(
      marketDirectoryInfo?.partner_permissions?.map(
        ({ market_directory_partner_id }) => market_directory_partner_id,
      ) || [],
    );
  }, [marketDirectoryInfo?.partner_permissions]);

  const defaultValues = {
    [CONSENTED_TO_SHARE]: marketDirectoryInfo?.[CONSENTED_TO_SHARE],
    [PARTNER_PERMISSION_IDS]: defaultPartnerPermissionIds,
  };

  const {
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({ defaultValues });

  const consented = watch(CONSENTED_TO_SHARE);
  const partnerPermissionIds = watch(PARTNER_PERMISSION_IDS);

  const onDirectoryConsentChange = (partnerId: number) => {
    const newValue = new Set(partnerPermissionIds);
    partnerPermissionIds.has(partnerId) ? newValue.delete(partnerId) : newValue.add(partnerId);

    setValue(PARTNER_PERMISSION_IDS, newValue);
  };

  const onCancel = () => {
    reset(defaultValues);
    setIsConsentReadonly(true);
  };

  const onConfirm = async (data: {
    [CONSENTED_TO_SHARE]: MarketDirectoryInfo['consented_to_share'];
    [PARTNER_PERMISSION_IDS]: Set<MarketDirectoryPartner['id']>;
  }) => {
    // TODO: Implement snackbar and handle error
    updateMarketDirectoryInfo({
      [CONSENTED_TO_SHARE]: data[CONSENTED_TO_SHARE],
      partner_permissions: [...data[PARTNER_PERMISSION_IDS]].map((id) => ({
        market_directory_partner_id: id,
      })),
    });
  };

  return (
    <div className={styles.consentContainer}>
      <div className={styles.consent}>
        <h3 className={styles.sectionTitle}>{t('MARKET_DIRECTORY.CONSENT.TITLE')}</h3>
        {!canConsent && <WarningBanner t={t} />}
        <DataSummary marketDirectoryInfo={marketDirectoryInfo} />
        <div className={clsx(styles.consentMain, isConsentFormDisabled && styles.disabled)}>
          <p>
            <Trans
              i18nKey="MARKET_DIRECTORY.CONSENT.CONSENT_TO_SHARE_INFORMATION"
              components={{ br: <br /> }}
            />
          </p>
          <Checkbox
            hookFormRegister={register(CONSENTED_TO_SHARE)}
            classNames={{ container: styles.checkbox, label: styles.label }}
            label={t('MARKET_DIRECTORY.CONSENT.I_AGREE')}
            disabled={isConsentFormDisabled}
          />
        </div>
      </div>
      <div className={styles.marketDirectories}>
        <h3 className={styles.sectionTitle}>{t('MARKET_DIRECTORY.MARKET_DIRECTORIES')}</h3>
        <p className={styles.lead}>{t('MARKET_DIRECTORY.WHERE_TO_BE_FEATURED')}</p>
        <div className={clsx(styles.marketTiles)}>
          {marketDirectoryPartners.map(({ id, key }) => {
            return (
              <PureMarketDirectoryTile
                key={key}
                {...PARTNERS_INFO[key]}
                hasConsent={partnerPermissionIds.has(id)}
                onConsentChange={() => onDirectoryConsentChange(id)}
                isReadOnly={isConsentFormDisabled || !consented}
              />
            );
          })}
          <MarketplaceSuggestionTile onClick={setFeedbackSurveyOpen} />
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        {isConsentReadonly ? (
          <Button
            type="button"
            color="secondary"
            className={styles.editButton}
            onClick={() => setIsConsentReadonly(false)}
          >
            <BiPencil />
            <span>{t('common:EDIT')}</span>
          </Button>
        ) : (
          <InFormButtons
            confirmText={
              consented && partnerPermissionIds.size
                ? t('common:CONFIRM_AND_PUBLISH')
                : t('common:CONFIRM')
            }
            onCancel={onCancel}
            onConfirm={handleSubmit(onConfirm)}
            isDisabled={!canConsent || !isDirty}
            isCancelDisabled={!canConsent}
            confirmButtonType="submit"
            confirmButtonColor="primary"
            className={styles.consentButtons}
          />
        )}
      </div>
    </div>
  );
};

export default MarketDirectoryConsent;

const WarningBanner = ({ t }: { t: TFunction }) => {
  return (
    <div className={styles.warningBanner}>
      <p>{t('MARKET_DIRECTORY.CONSENT.ALMOST_READY')}</p>
    </div>
  );
};
