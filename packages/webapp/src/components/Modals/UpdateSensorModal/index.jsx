/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import { colors } from '../../../assets/theme';

export default function UpdateSensorModal({ dismissModal, onChange }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('SENSOR.MODAL.TITLE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onChange} sm>
            {t('common:CHANGE')}
          </Button>
        </>
      }
      contents={[t('SENSOR.MODAL.BODY')]}
    >
      {/* <Label
        style={{
          color: colors.grey600,
          paddingTop: '16px',
        }}
      >
        {t('MANAGEMENT_PLAN.DO_YOU_WANT_TO_ABANDON_CONTENT')}
      </Label> */}
    </ModalComponent>
  );
}
