import React from 'react';
import CropHeader from '../cropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { Label, Underlined, AddLink } from '../../Typography';
import Layout from '../../Layout';
import Input from '../../Form/Input';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as Pencil } from '../../../assets/images/managementPlans/pencil.svg';

export default function PureManagementDetail({
  onCopy,
  onCompleted,
  onBack,
  variety,
  plan,
}) {

  const { t } = useTranslation();

  return (
    <Layout
      buttonGroup={
        <>
          <Button fullLength onClick={onCopy}>
            {t('common:MARK_COMPLETED')}
          </Button>
          <Button color={'secondary'} onClick={onCompleted} fullLength>
            {t('common:COPY')}
          </Button>
        </>
      }
    >
      <CropHeader
        onBackClick={onBack}
        crop_translation_key={variety.crop_translation_key}
        crop_variety_name={variety.crop_variety_name}
        crop_variety_photo_url={variety.crop_variety_photo_url}
        supplierName={variety.supplier}
      />

      <div className={styles.titlewrapper}>
        <Label
          className={styles.title}
          style={{ marginTop: '24px' }}
        >
          {'Plan 1'}
        </Label>
        <div>
          <Pencil
            className={styles.pencil}
            style={{ marginRight: '5px' }}
          />
          <Underlined onClick={() => {console.log('Go to edit page')}}>
            {t('MANAGEMENT_DETAIL.EDIT_PLAN')}
          </Underlined>
        </div>
      </div>

      <Input
        style={{ marginTop: '24px' }}
        label={t('MANAGEMENT_DETAIL.PLAN_NOTES')}
        type={'text'}
        disabled={true}
      />
      
      <Label 
        className={styles.subtitle}
        style={{ marginTop: '32px' }}
      >
        {t('MANAGEMENT_DETAIL.ASSOCIATED_TASKS')}
      </Label>

      <AddLink
        style={{ marginTop: '16px' }}
        onClick={() => {console.log('Go to add task page')}}
      >
        {t('MANAGEMENT_DETAIL.ADD_A_TASK')}
      </AddLink>

      {
        // TODO - Add task list
      }

      <div 
        className={styles.abandonwrapper}
        style={{ marginTop: '24px' }}
      >
        <Label>
          {t('MANAGEMENT_DETAIL.FAILED_CROP')}
        </Label>
        <AddLink
          style={{ marginLeft: '6px' }}
          onClick={() => {console.log('Go to abandon page')}}
        >
          {t('MANAGEMENT_DETAIL.ABANDON_PLAN')}
        </AddLink>
      </div>

    </Layout>
  )
}

PureManagementDetail.prototype = {
  onBack: PropTypes.func,
  onCopy: PropTypes.func,
  onCompleted: PropTypes.func,
  plan: PropTypes.object,
};
