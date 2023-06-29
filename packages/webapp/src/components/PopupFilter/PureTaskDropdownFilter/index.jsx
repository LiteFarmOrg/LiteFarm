import { FiFilter } from 'react-icons/fi';
import { colors } from '../../../assets/theme';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './styles.module.scss';
import { BsChevronDown } from 'react-icons/bs';
import { Main, Semibold } from '../../Typography';
import Radio from '../../Form/Radio';
import { ReactComponent as CalendarDown } from '../../../assets/images/taskFilter/CalendarDown.svg';
import { ReactComponent as CalendarUp } from '../../../assets/images/taskFilter/CalendarUp.svg';
import clsx from 'clsx';
import PageBreak from '../../PageBreak';
import { ClickAwayListener } from '@mui/material';

export default function PureTaskDropdownFilter({
  isDropDownOpen,
  isAscending,
  onDateOrderChange,
  assigneeValue,
  onAssigneeChange,
  isFilterActive,
  onFilterOpen,
}) {
  const { t } = useTranslation();
  const [isDropdownOpen, setDropdownOpen] = useState(isDropDownOpen);
  const onDropdownClick = () => setDropdownOpen((isDropdownOpen) => !isDropdownOpen);
  const assigneeTranslationMap = {
    myTask: t('TASK.FILTER.MY_TASK'),
    unassigned: t('TASK.FILTER.UNASSIGNED'),
    all: t('common:ALL'),
  };
  return (
    <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
      <div className={styles.container}>
        <div className={styles.dropdownContainer}>
          <div
            onClick={onDropdownClick}
            className={clsx(
              styles.dropdown,
              isDropdownOpen && styles.active,
              isDropdownOpen && styles.dropDownActive,
            )}
          >
            {assigneeTranslationMap[assigneeValue] && (
              <>
                <Semibold style={{ color: colors.grey600 }}>{t('TASK.FILTER.VIEW')}:</Semibold>
                <Main style={{ color: colors.grey600 }}>
                  {assigneeTranslationMap[assigneeValue]}
                </Main>
              </>
            )}
            {isAscending ? <CalendarUp /> : <CalendarDown />}
            <BsChevronDown
              className={clsx(styles.chevron, isDropdownOpen && styles.chevronActive)}
            />
          </div>

          {isDropdownOpen && (
            <div className={styles.dropdownMenuContainer}>
              <div className={clsx(styles.dropdownMenu, styles.active)}>
                <Semibold style={{ marginBottom: '16px' }}>{t('TASK.FILTER.VIEW')}:</Semibold>
                <Radio
                  checked={assigneeValue === 'myTask'}
                  label={t('TASK.FILTER.MY_TASK')}
                  name={'assignee'}
                  value={'myTask'}
                  onChange={onAssigneeChange}
                />
                <Radio
                  checked={assigneeValue === 'unassigned'}
                  label={t('TASK.FILTER.UNASSIGNED')}
                  name={'assignee'}
                  value={'unassigned'}
                  onChange={onAssigneeChange}
                />
                <Radio
                  checked={assigneeValue === 'all'}
                  label={t('common:ALL')}
                  name={'assignee'}
                  value={'all'}
                  onChange={onAssigneeChange}
                />
                <PageBreak style={{ margin: '0 8px', transform: 'translateY(-8px)' }} />
                <Semibold style={{ marginBottom: '16px' }}>{t('TASK.FILTER.SORT_BY')}:</Semibold>
                <div className={styles.dateRadioContainer}>
                  <Radio
                    checked={isAscending}
                    label={
                      <>
                        <strong>{t('common:DATE')}:</strong> {t('TASK.FILTER.ASCENDING')}
                      </>
                    }
                    name={'date'}
                    value={'ascending'}
                    onChange={onDateOrderChange}
                  />
                  <CalendarUp />
                </div>
                <div className={styles.dateRadioContainer}>
                  <Radio
                    checked={!isAscending}
                    style={{ marginBottom: '0' }}
                    label={
                      <>
                        <strong>{t('common:DATE')}:</strong> {t('TASK.FILTER.DESCENDING')}
                      </>
                    }
                    name={'date'}
                    value={'descending'}
                    onChange={onDateOrderChange}
                  />
                  <CalendarDown />
                </div>
              </div>
            </div>
          )}
        </div>
        {isFilterActive && <div className={styles.circle} />}
        <FiFilter className={styles.filter} onClick={onFilterOpen} />
      </div>
    </ClickAwayListener>
  );
}

PureTaskDropdownFilter.propTypes = {
  onFilterOpen: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  isFilterActive: PropTypes.bool,
};
