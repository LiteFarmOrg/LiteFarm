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

import { useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../../Snackbar/snackbarSlice';
import { areSetsEqual } from '../../../../../util/comparisons';
import { MarketDirectoryInfo, MarketDirectoryPartner } from '../../../../../store/api/types';
import styles from './styles.module.scss';
import { useNavMenuControls } from '../../../../../contexts/appContext';

interface MarketDirectoryConsentProps {
  canConsent: boolean;
  marketDirectoryInfo?: MarketDirectoryInfo;
}

const CONSENTED_TO_SHARE = 'consented_to_share';
const PARTNER_PERMISSION_IDS = 'partnerPermissionIds';

const MarketDirectoryConsent = ({
  canConsent,
  marketDirectoryInfo,
}: MarketDirectoryConsentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { feedback: feedbackFormControls } = useNavMenuControls();

  const savedConsent = marketDirectoryInfo?.[CONSENTED_TO_SHARE] || false;

  const { data: marketDirectoryPartners = [] } =
    useGetMarketDirectoryPartnersQuery('?filter=country');
  const [updateMarketDirectoryInfo, { isLoading }] = useUpdateMarketDirectoryInfoMutation();

  const [isConsentReadonly, setIsConsentReadonly] = useState(savedConsent === true);

  const isConsentFormDisabled = !canConsent || isConsentReadonly;

  const defaultValues = useMemo(() => {
    const partnerPermissionIds = marketDirectoryInfo?.partner_permissions?.map(
      ({ market_directory_partner_id }) => market_directory_partner_id,
    );

    return {
      [CONSENTED_TO_SHARE]: marketDirectoryInfo?.[CONSENTED_TO_SHARE],
      [PARTNER_PERMISSION_IDS]: new Set(partnerPermissionIds || []),
    };
  }, [marketDirectoryInfo]);

  const { register, setValue, watch, reset, handleSubmit } = useForm({ defaultValues });

  const consented = watch(CONSENTED_TO_SHARE);
  const partnerPermissionIds = watch(PARTNER_PERMISSION_IDS);

  // react-hook-form's isDirty does not work for PARTNER_PERMISSION_IDS
  const hasFormModified =
    defaultValues[CONSENTED_TO_SHARE] !== consented ||
    !areSetsEqual(defaultValues[PARTNER_PERMISSION_IDS], partnerPermissionIds);

  const onPartnerPermissionChange = (partnerId: number) => {
    const newValue = new Set(partnerPermissionIds);
    partnerPermissionIds.has(partnerId) ? newValue.delete(partnerId) : newValue.add(partnerId);

    setValue(PARTNER_PERMISSION_IDS, newValue);
  };

  const onCancel = () => {
    reset(defaultValues);
    setIsConsentReadonly(true);
  };

  const onSave = async (data: {
    [CONSENTED_TO_SHARE]: MarketDirectoryInfo['consented_to_share'];
    [PARTNER_PERMISSION_IDS]: Set<MarketDirectoryPartner['id']>;
  }) => {
    const formattedData: Partial<MarketDirectoryInfo> = { id: marketDirectoryInfo!.id };
    const hasConsentChanged = defaultValues[CONSENTED_TO_SHARE] !== data[CONSENTED_TO_SHARE];
    const havePartnersChanged = !areSetsEqual(
      defaultValues[PARTNER_PERMISSION_IDS],
      data[PARTNER_PERMISSION_IDS],
    );

    if (hasConsentChanged) {
      formattedData[CONSENTED_TO_SHARE] = data[CONSENTED_TO_SHARE];
    }
    if (havePartnersChanged) {
      formattedData.partner_permissions = [...data[PARTNER_PERMISSION_IDS]].map((id) => ({
        market_directory_partner_id: id,
      }));
    }

    try {
      await updateMarketDirectoryInfo(formattedData).unwrap();

      const message = havePartnersChanged
        ? t('message:MARKET_DIRECTORY_CONSENT.SUCCESS.PARTNER')
        : t('message:MARKET_DIRECTORY_CONSENT.SUCCESS.CONSENT');

      setIsConsentReadonly(data[CONSENTED_TO_SHARE] === true);
      dispatch(enqueueSuccessSnackbar(message));
    } catch (error) {
      console.error(error);
      dispatch(enqueueErrorSnackbar('message:MARKET_DIRECTORY_CONSENT.ERROR'));
    }
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
            onChange={() => setValue(PARTNER_PERMISSION_IDS, new Set())}
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
                onConsentChange={() => onPartnerPermissionChange(id)}
                isReadOnly={isConsentFormDisabled || !consented}
              />
            );
          })}
          <MarketplaceSuggestionTile
            onClick={() => feedbackFormControls.setFeedbackSurveyOpen(true)}
            noPartner={marketDirectoryPartners.length === 0}
          />
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
            onConfirm={handleSubmit(onSave)}
            isDisabled={isLoading || !canConsent || !hasFormModified}
            isCancelDisabled={savedConsent === false}
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
