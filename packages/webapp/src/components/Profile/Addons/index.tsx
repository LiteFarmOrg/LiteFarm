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
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { PARTNERS } from '../../../containers/LocationDetails/PointDetails/SensorDetail/v2/constants';
import { ReactComponent as ExternalLinkIcon } from '../../../assets/images/icon_external_link.svg';
import { ReactComponent as BrokenLinkIcon } from '../../../assets/images/link-broken.svg';
import styles from './styles.module.scss';
import { Partner } from '../../Sensor/v2/Partners';
import Button from '../../Form/Button';
import ModalComponent from '../../Modals/ModalComponent/v2';
import { AddonPartner } from '../../../types';
import { createSensorsUrl } from '../../../util/siteMapConstants';

type PureFarmAddonsProps = {
  hasActiveConnection: Record<AddonPartner, boolean>;
  organizationIds: Record<AddonPartner, string>;
  onDisconnect: Record<AddonPartner, () => void>;
};

const PureFarmAddons = ({
  hasActiveConnection,
  organizationIds,
  onDisconnect,
}: PureFarmAddonsProps) => {
  const { t } = useTranslation(['translation', 'common']);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const [disconnectModalContents, setDisconnectModalContents] = useState<{
    title: string;
    infoText: string;
    onConfirm: () => void;
  } | null>(null);

  return (
    <div className={styles.container}>
      <Main className={styles.header}>{t('PROFILE.FARM.ADDONS')}</Main>

      {hasActiveConnection.esci && (
        <div id="esci-addon" className={styles.addonCard}>
          <Link className={styles.internalLink} to={createSensorsUrl(PARTNERS.ESCI.id)}>
            <ExternalLinkIcon />
            <span>{t('SENSOR.ESCI.SEE_ENSEMBLE_SENSOR_LIST')}</span>
          </Link>
          <div className={styles.addonDetails}>
            <Partner {...PARTNERS.ESCI} className={styles.partner} />
            <Main className={styles.infoText}>{t('ADDON.ESCI.INFO')}</Main>

            <div className={styles.addonConnectionInfo}>
              <div>
                <Main className={styles.orgIdLabel}>{t('ADDON.ORGANISATION_ID')}</Main>
                <Semibold className={styles.orgId}>{organizationIds.esci}</Semibold>
              </div>
              <Link className={styles.disconnect} to="/farm">
                <Button
                  sm
                  color="secondary-2"
                  className={styles.disconnectButton}
                  onClick={() => {
                    setDisconnectModalContents({
                      title: t('ADDON.ESCI.MODAL_TITLE'),
                      infoText: t('ADDON.ESCI.MODAL_INFO'),
                      onConfirm: onDisconnect.esci,
                    });
                  }}
                >
                  <BrokenLinkIcon />
                  <span>{t('ADDON.ESCI.DISCONNECT_ESCI')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {disconnectModalContents && (
        <DisconnectModal
          title={disconnectModalContents.title}
          infoText={disconnectModalContents.infoText}
          onConfirm={() => {
            disconnectModalContents.onConfirm();
            setDisconnectModalContents(null);
          }}
          onCancel={() => {
            setDisconnectModalContents(null);
          }}
        />
      )}
    </div>
  );
};

export default PureFarmAddons;

type DisconnectModalProps = {
  title: string;
  infoText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DisconnectModal = ({ title, infoText, onConfirm, onCancel }: DisconnectModalProps) => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <ModalComponent
      title={title}
      dismissModal={onCancel}
      className={styles.disconnectModal}
      buttonGroup={
        <div className={styles.modalButtonGroup}>
          <Button onClick={onCancel} color="secondary-cta" sm>
            {t('ADDON.DISCONNECT_MODAL.CANCEL')}
          </Button>
          <Button onClick={onConfirm} color="primary" sm>
            {t('ADDON.DISCONNECT_MODAL.CONFIRM')}
          </Button>
        </div>
      }
    >
      {infoText}
    </ModalComponent>
  );
};
