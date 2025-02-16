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
import { validate as uuidValidate } from 'uuid';
import Input, { getInputErrors } from '../../Form/Input';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { Main } from '../../Typography';
import { PARTNERS } from '../../../containers/LocationDetails/PointDetails/SensorDetail/v2/constants';
import {
  AddSensorsFormFields,
  FarmAddonField,
  PARTNER,
} from '../../../containers/LocationDetails/PointDetails/SensorDetail/v2/types';
import styles from './styles.module.scss';

type PartnersProps = {
  hasActiveConnection: {
    esci: boolean;
  };
};

const validateUuidFormat = (value: string, errorMessage: string) => {
  return uuidValidate(value) || errorMessage;
};

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

const ORG_UUID = `${PARTNER}.${FarmAddonField.ORG_UUID}` as const;

const Partners = ({ hasActiveConnection }: PartnersProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<AddSensorsFormFields>();

  return (
    <div className={styles.wrapper}>
      <Main className={styles.lead}>{t('SENSOR.ESCI.CURRENT_SUPPORT')}</Main>
      {Object.values(PARTNERS).map((data) => (
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
              placeholder={t('SENSOR.ESCI.ORGANISATION_ID')}
              type="text"
              hookFormRegister={register(ORG_UUID, {
                required: true,
                validate: (value) =>
                  validateUuidFormat(value, t('SENSOR.ESCI.ORGANISATION_ID_ERROR')),
              })}
              errors={getInputErrors(errors, ORG_UUID)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
