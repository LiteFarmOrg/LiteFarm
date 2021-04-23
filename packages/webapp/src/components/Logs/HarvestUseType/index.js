import React, { useEffect, useMemo, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { AddLink, Main } from '../../Typography';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

import { ReactComponent as Sales } from '../../../assets/images/log/v2/Sales.svg';
import { ReactComponent as SelfConsumption } from '../../../assets/images/log/v2/SelfConsumption.svg';
import { ReactComponent as AnimalFeed } from '../../../assets/images/log/v2/AnimalFeed.svg';
import { ReactComponent as Compost } from '../../../assets/images/log/v2/Compost.svg';
import { ReactComponent as NotSure } from '../../../assets/images/log/v2/NotSure.svg';
import { ReactComponent as Gift } from '../../../assets/images/log/v2/Gift.svg';
import { ReactComponent as Exchange } from '../../../assets/images/log/v2/Exchange.svg';
import { ReactComponent as Seed } from '../../../assets/images/log/v2/Seed.svg';
import { ReactComponent as Custom } from '../../../assets/images/log/v2/Custom.svg';
import clsx from 'clsx';

export default function PureHarvestUseType({
  onGoBack,
  onNext,
  useTypes,
  defaultData,
  farm,
  addUseType,
  showUseTypeRequiredError,
  history,
  isEdit,
  selectedLog,
}) {
  const { t } = useTranslation(['translation', 'common', 'harvest_uses']);
  const [selectedUseTypes, setSelectedUseTypes] = useState([]);
  useEffect(() => {
    const shrinkSelectedUseTypes = defaultData.selectedUseTypes.map(
      ({ harvest_use_type_id }) => harvest_use_type_id,
    );
    setSelectedUseTypes(shrinkSelectedUseTypes);
  }, []);

  const onTileClick = (harvestUseTypeId) => {
    const useTypes = selectedUseTypes.includes(harvestUseTypeId)
      ? selectedUseTypes.filter((id) => harvestUseTypeId !== id)
      : selectedUseTypes.concat(harvestUseTypeId);
    setSelectedUseTypes(useTypes);
  };

  const onGoNext = () => {
    const extendedSelectedUseTypes = useTypes.filter(({ harvest_use_type_id }) =>
      selectedUseTypes.includes(harvest_use_type_id),
    );
    onNext({ selectedUseTypes: extendedSelectedUseTypes });
  };

  const title = useMemo(() => {
    if (isEdit?.isEdit) {
      return t('LOG_COMMON.EDIT_A_LOG');
    } else {
      return t('LOG_COMMON.ADD_A_LOG');
    }
  }, [isEdit]);
  return (
    <TitleLayout
      onGoBack={() => history.push('/harvest_log')}
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button
            color={'primary'}
            fullLength
            onClick={onGoNext}
            disabled={!selectedUseTypes.length}
            style={{ marginTop: '24px' }}
          >
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Main style={{ marginBottom: '16px' }}>{t('LOG_HARVEST.HARVEST_USE_TYPE_SUBTITLE')}</Main>
      <UseTypeMatrix
        t={t}
        onClick={onTileClick}
        useTypes={useTypes}
        selectedUseTypes={selectedUseTypes}
      />
      {[1, 2, 5].includes(Number(farm.role_id)) && (
        <AddLink
          onClick={() => history.push('./add_harvest_use_type')}
          style={{ paddingTop: '16px' }}
        >
          {t('LOG_HARVEST.ADD_CUSTOM_HARVEST_USE')}
        </AddLink>
      )}
    </TitleLayout>
  );
}

const svgDict = {
  Sales: <Sales />,
  'Self-Consumption': <SelfConsumption />,
  'Animal Feed': <AnimalFeed />,
  Compost: <Compost />,
  Gift: <Gift />,
  Exchange: <Exchange />,
  'Saved for seed': <Seed />,
  'Not Sure': <NotSure />,
  Other: <Custom />,
};

function UseTypeMatrix({ useTypes, onClick, selectedUseTypes }) {
  const { t } = useTranslation(['translation', 'common', 'harvest_uses']);

  return (
    <div className={styles.matrixContainer}>
      {useTypes.map((type, i) => {
        const useTypeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
        const buttonImg = svgDict[type.harvest_use_type_name]
          ? svgDict[type.harvest_use_type_name]
          : svgDict.Other;
        return (
          <div
            className={clsx(
              styles.matrixItem,
              selectedUseTypes.includes(type.harvest_use_type_id) && styles.selectedMatrixItem,
            )}
            onClick={() => onClick(type.harvest_use_type_id)}
          >
            {buttonImg}
            <div className={styles.buttonName}>{useTypeName}</div>
          </div>
        );
      })}
    </div>
  );
}
