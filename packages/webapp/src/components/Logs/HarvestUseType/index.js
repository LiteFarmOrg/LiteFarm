import React, { useMemo, useState } from 'react';
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
import { ReactComponent as Apple } from '../../../assets/images/log/v2/Apple.svg';

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
  const [isCustomHarvestUsePage, setCustomHarvestUsePage] = useState(
    history?.location?.state?.isCustomHarvestUsePage,
  );

  const filteredHarvestUseTypes = useMemo(() => {
    return useTypes.filter((type) =>
      isCustomHarvestUsePage
        ? !svgDict.hasOwnProperty(type.harvest_use_type_name)
        : svgDict.hasOwnProperty(type.harvest_use_type_name),
    );
  }, [isCustomHarvestUsePage, useTypes]);

  const onTileClick = (harvestUseTypeId) => {
    let extendedSelectedUseTypes = useTypes.filter(
      ({ harvest_use_type_id }) => harvestUseTypeId === harvest_use_type_id,
    );
    onNext({ selectedUseTypes: extendedSelectedUseTypes });
  };
  const onCustomHarvestUseTypeClick = () => {
    setCustomHarvestUsePage(true);
  };
  const title = useMemo(() => {
    if (isCustomHarvestUsePage) {
      return t('LOG_HARVEST.CUSTOM_HARVEST_USE')
        .split(' ')
        .map((word) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(' ');
    } else if (isEdit?.isEdit) {
      return t('LOG_COMMON.EDIT_A_LOG');
    } else {
      return t('LOG_COMMON.ADD_A_LOG');
    }
  }, [isEdit, isCustomHarvestUsePage]);
  return (
    <TitleLayout
      onGoBack={() =>
        isCustomHarvestUsePage ? setCustomHarvestUsePage(false) : history.push('/harvest_log')
      }
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        !isCustomHarvestUsePage && (
          <>
            <Button
              color={'success'}
              fullLength
              onClick={onCustomHarvestUseTypeClick}
              style={{ marginTop: '24px' }}
            >
              <>
                <Apple style={{ marginRight: '8px', transform: 'translateY(-3px)' }} />{' '}
                {t('LOG_HARVEST.CUSTOM_HARVEST_USE')}
              </>
            </Button>
          </>
        )
      }
    >
      {isCustomHarvestUsePage && [1, 2, 5].includes(Number(farm.role_id)) ? (
        <AddLink
          onClick={() => history.push('./add_harvest_use_type')}
          style={{ paddingBottom: '16px' }}
        >
          {t('LOG_HARVEST.ADD_CUSTOM_HARVEST_USE')}
        </AddLink>
      ) : (
        <Main style={{ marginBottom: '16px' }}>{t('LOG_HARVEST.HARVEST_USE_TYPE_SUBTITLE')}</Main>
      )}
      <UseTypeMatrix t={t} onClick={onTileClick} useTypes={filteredHarvestUseTypes} />
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

function UseTypeMatrix({ useTypes, onClick }) {
  const { t } = useTranslation(['translation', 'common', 'harvest_uses']);

  return (
    <div className={styles.matrixContainer}>
      {useTypes.map((type, i) => {
        const useTypeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
        const buttonImg = svgDict[type.harvest_use_type_name]
          ? svgDict[type.harvest_use_type_name]
          : svgDict.Other;
        return (
          <div className={styles.matrixItem} onClick={() => onClick(type.harvest_use_type_id)}>
            {buttonImg}
            <div className={styles.buttonName}>{useTypeName}</div>
          </div>
        );
      })}
    </div>
  );
}
