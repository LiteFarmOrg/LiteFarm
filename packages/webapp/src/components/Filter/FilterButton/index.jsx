import { FiFilter } from 'react-icons/fi';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import TextButton from '../../Form/Button/TextButton';
import clsx from 'clsx';

const FilterButton = ({ isFilterActive, onClick }) => {
  return (
    <div className={clsx([styles.filterButtonContainer, isFilterActive && styles.active])}>
      <TextButton className={styles.filterButton} onClick={onClick}>
        <FiFilter data-cy="tasks-filter" className={styles.filterButtonIcon} />
      </TextButton>
      {isFilterActive && (
        <div className={styles.circleContainer}>
          <div className={styles.circle} />
        </div>
      )}
    </div>
  );
};

FilterButton.propTypes = {
  isFilterActive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default FilterButton;
