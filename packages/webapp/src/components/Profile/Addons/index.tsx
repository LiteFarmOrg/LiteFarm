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

type PureFarmAddonsProps = {
  hasActiveConnection: {
    esci: boolean;
  };
  organizationIds: {
    esci: string;
  };
  onDisconnect: {
    esci: () => void;
  };
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
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  return (
    <div className={styles.container}>
      <Main className={styles.header}>{t('PROFILE.FARM.ADDONS')}</Main>

      {hasActiveConnection.esci && (
        <div id="esci-addon" className={styles.addonCard}>
          {/* {'TODO: LF-4696'} */}
          <Link className={styles.internalLink} to="/TODO">
            <ExternalLinkIcon />
            <span>{t('SENSOR.DETAIL.SEE_FULL_SENSOR_SETUP')}</span>
          </Link>
          <div className={styles.addonDetails}>
            <Partner {...PARTNERS.ESCI} className={styles.partner} />
            <Main className={styles.infoText}>{t('SENSOR.ESCI.DISCONNECT.INFO')}</Main>

            <div className={styles.addonConnectionInfo}>
              <div>
                <Main className={styles.orgIdLabel}>{t('SENSOR.ESCI.ORGANISATION_ID')}</Main>
                <Semibold className={styles.orgId}>{organizationIds.esci}</Semibold>
              </div>
              <Link className={styles.disconnect} to="/farm">
                <Button
                  sm
                  color="secondary-2"
                  className={styles.disconnectButton}
                  onClick={() => setShowDisconnectModal(true)}
                >
                  <BrokenLinkIcon />
                  <span>{t('SENSOR.ESCI.DISCONNECT.DISCONNECT_ESCI')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {hasActiveConnection.esci && showDisconnectModal && (
        <ModalComponent
          title={t('SENSOR.ESCI.DISCONNECT.MODAL_TITLE')}
          dismissModal={() => {
            onDisconnect.esci();
            setShowDisconnectModal(false);
          }}
          className={styles.disconnectModal}
          buttonGroup={
            <div className={styles.modalButtonGroup}>
              <Button
                onClick={() => {
                  setShowDisconnectModal(false);
                }}
                color="secondary-cta"
                sm
              >
                {t('SENSOR.ESCI.DISCONNECT.MODAL_CANCEL')}
              </Button>
              <Button
                onClick={() => {
                  onDisconnect.esci();
                  setShowDisconnectModal(false);
                }}
                color="primary"
                sm
              >
                {t('SENSOR.ESCI.DISCONNECT.MODAL_CONFIRM')}
              </Button>
            </div>
          }
        >
          {t('SENSOR.ESCI.DISCONNECT.MODAL_INFO')}
        </ModalComponent>
      )}
    </div>
  );
};

export default PureFarmAddons;
