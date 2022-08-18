import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/CalendarIcon.svg';
import { getDateInputFormat } from '../../../util/moment';
import PropTypes from 'prop-types';

export default function DateQuickAssignModal({ dismissModal, due_date, onChangeTaskDate }) {
  const { t } = useTranslation();

  const [date, setDate] = useState(getDateInputFormat(due_date));

  const disabled = date === getDateInputFormat(due_date);

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.ASSIGN_DATE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button
            data-cy="dateAssign-update"
            onClick={() => {
              onChangeTaskDate(date);
              dismissModal();
            }}
            disabled={disabled}
            className={styles.button}
            color="primary"
            sm
          >
            {t('common:UPDATE')}
          </Button>
        </>
      }
      icon={<CalendarIcon />}
    >
      <Input
        data-cy="dateAssign-date"
        value={date}
        type={'date'}
        label={t('TASK.SELECT_DATE')}
        onChange={(e) => {
          setDate(e.target.value);
        }}
      />
    </ModalComponent>
  );
}
DateQuickAssignModal.propTypes = {
  dismissModal: PropTypes.func,
  due_date: PropTypes.string,
  onChangeTaskDate: PropTypes.func,
};
