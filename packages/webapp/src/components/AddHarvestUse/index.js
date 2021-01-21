// import Floater from 'react-floater';
import React from 'react';
import { Title } from '../Typography';
// import ModalComponent from './ModalComponent';

export default function PureAddHarvestUse({
  title,
  inputHeader,
}) {
  return (
    <>
      {/* <div className={styles.modal}>
        <div className={styles.popupTitle}>
          <a className={styles.close} onClick={this.closeAddModal}>
            <img src={closeButton} alt="" />
          </a>
          <h3>{this.props.t('SHIFT.EDIT_SHIFT.ADD_TASK')}</h3>
        </div>
        <div className={styles.customContainer}>
          <div className={styles.taskTitle}>{this.props.t('SHIFT.EDIT_SHIFT.NAME_TASK')}</div>
          <div className={styles.taskInput}>
            <input type="text" maxLength="20" onChange={this.customTaskName} />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button onClick={this.addCustomTask}>{this.props.t('common:FINISH')}</Button>
        </div>
      </div> */}
      {/* <Title>{title}</Title> */}
      <div>
        {"hello"}
      </div>
    </>
  );
}

PureChooseFarmScreen.prototype = {
  // farms: PropTypes.arrayOf(
  //   PropTypes.exact({
  //     farmName: PropTypes.string,
  //     address: PropTypes.arrayOf(PropTypes.string),
  //     farm_id: PropTypes.string,
  //     coordinate: PropTypes.exact({
  //       lon: PropTypes.number,
  //       lat: PropTypes.number,
  //     }),
  //     ownerName: PropTypes.string,
  //   }),
  // ),
  // onGoBack: PropTypes.func,
  // onProceed: PropTypes.func,
  // onSelectFarm: PropTypes.func,
  // onCreateFarm: PropTypes.func,
  // isOnBoarding: PropTypes.bool,
  // isSearchable: PropTypes.bool,
  // onFilterChange: PropTypes.func,
  // disabled: PropTypes.bool,
  title: PropTypes.string,
  inputHeader: PropTypes.string
};
