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

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { Main } from '../../Typography';
import EsciLogo from '../../../assets/images/partners/esci_logo.png';
import styles from './styles.module.scss';

type PartnersProps = {
  hasActiveConnection: {
    esci: boolean;
  };
};

const PARTNERS = [{ name: 'Ensemble scientific', url: 'www.esci.io', logoPath: EsciLogo }];

const Partner = ({ name, url, logoPath }: { name: string; url: string; logoPath: string }) => {
  return (
    <div className={styles.partner}>
      <div className={styles.logo}>
        <img src={logoPath} />
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <a className={styles.url} href={`https://${url}`} target="_blank" rel="noreferrer">
          {url}
        </a>
      </div>
    </div>
  );
};

const Partners = ({ hasActiveConnection }: PartnersProps) => {
  const { t } = useTranslation();
  const { register } = useFormContext();

  return (
    <div className={styles.wrapper}>
      <Main className={styles.lead}>{t('SENSOR.ESCI.CURRENT_SUPPORT')}</Main>
      {PARTNERS.map((data) => (
        <Partner key={data.name} {...data} />
      ))}
      {hasActiveConnection.esci ? (
        <>{/* LF-4693 */}</>
      ) : (
        <div className={styles.sensorSetup}>
          <div>{t('SENSOR.ESCI.CONNECT_NEW_SENSOR')}</div>
          <div className={styles.idInputWrapper}>
            <InputBaseLabel label={t('SENSOR.ESCI.ENTER_ID')} />
            {/* @ts-ignore */}
            <Input
              placeholder={t('SENSOR.ESCI.ORGANIZATION_ID')}
              type="text"
              hookFormRegister={register('partner.organization_uuid', { required: true })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
