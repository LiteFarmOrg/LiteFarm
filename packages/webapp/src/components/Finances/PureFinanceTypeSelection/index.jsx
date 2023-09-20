/*
 *  Copyright 2023 LiteFarm.org
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
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { IconLink, Main } from '../../Typography';
import Form from '../../Form';
import Button from '../../Form/Button';
import Tiles from '../../Tile/Tiles';
import { tileTypes } from '../../Tile/constants';
import { ReactComponent as GearIcon } from '../../../assets/images/gear.svg';
import styles from './styles.module.scss';

const FallbackWrapper = ({ children }) => children;

export default function PureFinanceTypeSelection({
  title,
  types,
  leadText,
  cancelTitle,
  onContinue,
  onGoBack,
  onGoToManageCustomType,
  isTypeSelected,
  formatTileData,
  getFormatTileDataFunc,
  progressValue,
  useHookFormPersist,
  persistedFormData = {},
  iconLinkId,
  Wrapper = FallbackWrapper,
}) {
  const { t } = useTranslation();
  const { getValues, setValue } = useForm({ defaultValues: persistedFormData });
  const { historyCancel } = useHookFormPersist(getValues);

  return (
    <Wrapper>
      <Form
        buttonGroup={
          onContinue && (
            <Button disabled={!isTypeSelected} onClick={onContinue} type={'submit'} fullLength>
              {t('common:CONTINUE')}
            </Button>
          )
        }
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={historyCancel}
          cancelModalTitle={cancelTitle}
          title={title}
          value={progressValue}
          style={{ marginBottom: '24px' }}
        />
        <Main className={styles.leadText}>{leadText}</Main>
        <Tiles
          tileType={tileTypes.ICON_LABEL}
          tileData={types}
          formatTileData={getFormatTileDataFunc ? getFormatTileDataFunc(setValue) : formatTileData}
        />
        <div className={styles.manageCustomTypeLinkContainer}>
          <IconLink
            id={iconLinkId}
            icon={<GearIcon style={{ transform: 'translate(0px, 2px)' }} />}
            onClick={onGoToManageCustomType}
            isIconClickable
            underlined={false}
          >
            {t('FINANCES.MANAGE_CUSTOM_TYPE')}
          </IconLink>
        </div>
      </Form>
    </Wrapper>
  );
}

PureFinanceTypeSelection.prototype = {
  title: PropTypes.string,
  types: PropTypes.array,
  leadText: PropTypes.string,
  cancelTitle: PropTypes.string,
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onGoToManageCustomType: PropTypes.func,
  isTypeSelected: PropTypes.bool,
  formatTileData: PropTypes.func,
  /** takes setValue returned from useForm */
  getFormatTileDataFunc: PropTypes.func,
  progressValue: PropTypes.number,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  iconLinkId: PropTypes.string,
  /** used for spotlight */
  Wrapper: PropTypes.node,
};
