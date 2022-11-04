import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import styles from '../QuickAssignModal/styles.module.scss';
import Button from '../../Form/Button';

export interface IWaterUseCalculatorModal {
  dismissModal: () => void;
}

const WaterUseCalculatorModal: FC<IWaterUseCalculatorModal> = ({ dismissModal }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.ASSIGN_TASK')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button className={styles.button} color="primary" sm>
            {t('common:SAVE')}
          </Button>
        </>
      }
      icon={<Person />}
    />
  );
};
export default WaterUseCalculatorModal;
