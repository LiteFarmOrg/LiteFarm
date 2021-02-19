import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { Semibold, Text } from '../../Typography';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import SalesImg from '../../../assets/images/harvestUseType/Sales.svg';
import SelfConsumptionImg from '../../../assets/images/harvestUseType/SelfConsumption.svg';
import AnimalFeedImg from '../../../assets/images/harvestUseType/AnimalFeed.svg';
import CompostImg from '../../../assets/images/harvestUseType/Compost.svg';
import GiftImg from '../../../assets/images/harvestUseType/Gift.svg';
import ExchangeImg from '../../../assets/images/harvestUseType/Exchange.svg';
import SavedForSeedImg from '../../../assets/images/harvestUseType/SavedForSeed.svg';
import NotSureImg from '../../../assets/images/harvestUseType/NotSure.svg';
import OtherImg from '../../../assets/images/harvestUseType/Other.svg';
import clsx from 'clsx';
import AddTaskModal from '../../../components/Shift/AddTaskModal';

export default function PureHarvestUseType({
  onGoBack,
  onNext,
  useTypes,
  defaultData,
  farm,
  addUseType,
  showUseTypeRequiredError,
  isEdit,
  selectedLog,
}) {
  const { t } = useTranslation();
  const [selectedUseTypes, setSelectedUseTypes] = useState([]);
  const [showAddModal, switchShowModal] = useState(false);

  useEffect(() => {
    const shrinkSelectedUseTypes = !isEdit.isEditStepTwo
      ? defaultData.selectedUseTypes.map(({ harvest_use_type_id }) => harvest_use_type_id)
      : selectedLog.harvestUse.map(({ harvest_use_type_id }) => harvest_use_type_id);
    setSelectedUseTypes(shrinkSelectedUseTypes);
  }, []);

  const onGoNext = () => {
    let extendedSelectedUseTypes = useTypes.filter(({ harvest_use_type_id }) =>
      selectedUseTypes.includes(harvest_use_type_id),
    );
    onNext({ selectedUseTypes: extendedSelectedUseTypes });
  };

  const onBack = () => {
    const extendedSelectedUseTypes = useTypes.filter(({ harvest_use_type_id }) =>
      selectedUseTypes.includes(harvest_use_type_id),
    );
    onGoBack({ selectedUseTypes: extendedSelectedUseTypes });
  };

  return (
    <TitleLayout
      onGoBack={onBack}
      title={t('LOG_HARVEST.HARVEST_USE_TYPE_TITLE')}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button color={'secondary'} fullLength onClick={onBack}>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength onClick={onGoNext} disabled={!selectedUseTypes.length}>
            {t('common:NEXT')}
          </Button>
        </>
      }
    >
      <Semibold>{t('LOG_HARVEST.HARVEST_USE_TYPE_SUBTITLE')}</Semibold>
      <UseTypeMatrix
        t={t}
        selected={selectedUseTypes}
        setUseTypes={setSelectedUseTypes}
        useTypes={useTypes}
      />
      {[1, 2, 5].includes(Number(farm.role_id)) && (
        <div className={styles.buttonContainer}>
          <Button
            style={{ backgroundColor: 'var(--teal700)', color: 'white' }}
            onClick={() => switchShowModal(true)}
          >
            {t('LOG_HARVEST.ADD_CUSTOM_USE_TYPE')}
          </Button>
        </div>
      )}
      <AddTaskModal
        showModal={showAddModal}
        switchShowModal={switchShowModal}
        addTaskType={addUseType}
        showTaskRequiredError={showUseTypeRequiredError}
      />
    </TitleLayout>
  );
}

function UseTypeMatrix({ selected, useTypes, setUseTypes }) {
  const { t } = useTranslation();
  const imgDict = {
    Sales: SalesImg,
    'Self-Consumption': SelfConsumptionImg,
    'Animal Feed': AnimalFeedImg,
    Compost: CompostImg,
    Gift: GiftImg,
    Exchange: ExchangeImg,
    'Saved for seed': SavedForSeedImg,
    'Not Sure': NotSureImg,
    Other: OtherImg,
  };

  const selectOrDeselectUseType = (useTypeID) => {
    const useTypes = selected.includes(useTypeID)
      ? selected.filter((id) => useTypeID !== id)
      : selected.concat(useTypeID);
    setUseTypes(useTypes);
  };

  return (
    <div className={styles.matrixContainer}>
      {useTypes.map((type, i) => {
        const useTypeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
        const buttonImg = imgDict[type.harvest_use_type_name]
          ? imgDict[type.harvest_use_type_name]
          : OtherImg;
        return (
          <div
            className={styles.matrixItem}
            onClick={() => selectOrDeselectUseType(type.harvest_use_type_id)}
          >
            <div
              className={clsx(
                styles.circleButton,
                selected.includes(type.harvest_use_type_id) && styles.circleSelected,
              )}
              id={type.harvest_use_type_id}
            >
              <img data-test="task_type" src={buttonImg} alt="" />
            </div>
            <div className={styles.buttonName}>
              <Text>{useTypeName}</Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}
