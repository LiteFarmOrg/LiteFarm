import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { AddLink, Main } from '../../Typography';
import styles from './styles.module.scss';
import { ReactComponent as CollectSoilSample } from '../../../assets/images/AddTask/Collect Soil Sample.svg';
import { ReactComponent as Custom } from '../../../assets/images/AddTask/Custom.svg';
import { ReactComponent as Transport } from '../../../assets/images/AddTask/Transport.svg';
import { ReactComponent as Fertilize } from '../../../assets/images/AddTask/Fertilize.svg';
import { ReactComponent as FieldWork } from '../../../assets/images/AddTask/Field Work.svg';
import { ReactComponent as Harvest } from '../../../assets/images/AddTask/Harvest.svg';
import { ReactComponent as Irrigate } from '../../../assets/images/AddTask/Irrigate.svg';
import { ReactComponent as Maintenance } from '../../../assets/images/AddTask/Maintenance.svg';
import { ReactComponent as PestControl } from '../../../assets/images/AddTask/Pest Control.svg';
import { ReactComponent as Plant } from '../../../assets/images/AddTask/Plant.svg';
import { ReactComponent as RecordSoilSample } from '../../../assets/images/AddTask/Record Soil Sample.svg';
import { ReactComponent as Sales } from '../../../assets/images/AddTask/Sales.svg';
import { ReactComponent as Scout } from '../../../assets/images/AddTask/Scout.svg';
import { ReactComponent as SocialEvent } from '../../../assets/images/AddTask/Social Event.svg';
import { ReactComponent as SoilAmendment } from '../../../assets/images/AddTask/Soil Amendment.svg';
import { ReactComponent as Transplant } from '../../../assets/images/AddTask/Transplant.svg';
import { ReactComponent as WashAndPack } from '../../../assets/images/AddTask/Wash _ Pack.svg';
import PageTitle from '../../PageTitle/v2';

const PureTaskTypeSelection = ({ onSubmit, handleGoBack, handleCancel }) => {
  // prob have to define handleGoBack here as there are 2 paths that lead to this page
  const { t } = useTranslation();

  return (
    <>
      <Form>
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={14}
        />

        <Main>{t('ADD_TASK.SELECT_TASK_TYPE')}</Main>

        <div className={styles.tileContainer}>
          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <CollectSoilSample />
              <div>{t('ADD_TASK.COLLECT_SOIL_SAMPLE')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Fertilize />
              <div>{t('ADD_TASK.FERTILIZE')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <FieldWork />
              <div>{t('ADD_TASK.FIELD_WORK')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Harvest />
              <div>{t('ADD_TASK.HARVEST')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Irrigate />
              <div>{t('ADD_TASK.IRRIGATE')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Maintenance />
              <div>{t('ADD_TASK.MAINTENANCE')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <PestControl />
              <div>{t('ADD_TASK.PEST_CONTROL')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Plant />
              <div>{t('ADD_TASK.PLANT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <RecordSoilSample />
              <div>{t('ADD_TASK.RECORD_SOIL_SAMPLE')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Sales />
              <div>{t('ADD_TASK.SALES')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Scout />
              <div>{t('ADD_TASK.SCOUT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <SocialEvent />
              <div>{t('ADD_TASK.SOCIAL_EVENT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <SoilAmendment />
              <div>{t('ADD_TASK.SOIL_AMENDMENT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Transplant />
              <div>{t('ADD_TASK.TRANSPLANT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <Transport />
              <div>{t('ADD_TASK.TRANSPORT')}</div>
            </div>
          </div>

          <div onClick={() => {}}>
            <div className={styles.typeContainer}>
              <WashAndPack />
              <div>{t('ADD_TASK.WASH_AND_PACK')}</div>
            </div>
          </div>
        </div>

        <AddLink style={{ paddingTop: '20px' }}>{t('ADD_TASK.CREATE_CUSTOM_TASK')}</AddLink>
      </Form>
    </>
  );
};

export default PureTaskTypeSelection;
