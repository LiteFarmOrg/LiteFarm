import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { currentLogSelector, logSelector } from '../selectors';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.module.scss';
import Checkbox from '../../../components/Inputs/Checkbox';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { deleteLog, editLog } from '../Utility/actions';
import ConfirmModal from '../../../components/Modals/Confirm';
import { withTranslation } from 'react-i18next';
import {
  currentAndPlannedFieldCropsSelector,
  locationsWithCurrentAndPlannedFieldCropSelector,
} from '../../fieldCropSlice';

class ScoutingLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.scoutingLog'));

    this.state = {
      date: moment(),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    const type = selectedLog.scoutingLog.type;
    dispatch(
      actions.change('logReducer.forms.scoutingLog.type', {
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      }),
    );
    dispatch(actions.change('logReducer.forms.scoutingLog.notes', selectedLog.notes));
    dispatch(
      actions.change('logReducer.forms.scoutingLog.action_needed', selectedLog.action_needed),
    );
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, locations } = this.props;
    let selectedFields = parseFields(log, locations);
    let selectedCrops = parseCrops(log);
    let selectedLog = this.props.selectedLog;
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'scouting',
      date: this.state.date,
      crops: selectedCrops,
      locations: selectedFields,
      action_needed: log.action_needed,
      type: log.type.value.toLowerCase(),
      notes: log.notes,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(editLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const locations = this.props.locations;
    const selectedFields = this.props.selectedLog.location.map((f) => ({
      value: f.location_id,
      label: f.name,
    }));
    const selectedCrops = this.props.selectedLog.fieldCrop.map((fc) => ({
      value: fc.field_crop_id,
      label: this.props.t(`crop:${fc.crop.crop_translation_key}`),
      location_id: fc.location_id,
    }));

    return (
      <div className="page-container">
        <PageTitle
          backUrl="/log"
          title={`${this.props.t('common:EDIT')} ${this.props.t('LOG_SCOUTING.TITLE')}`}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder="Choose a date"
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.scoutingLog)}
        >
          <DefaultLogForm
            parent="logReducer.forms"
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            model=".scoutingLog"
            locations={locations}
            crops={crops}
            notesField={true}
            typeField={true}
            typeOptions={['Harvest', 'Pest', 'Disease', 'Weed', 'Other']}
            isCropNotRequired={true}
            customFieldset={() => {
              return (
                <Checkbox
                  type="checkbox"
                  model=".action_needed"
                  title={this.props.t('LOG_SCOUTING.ACTION_NEEDED')}
                />
              );
            }}
          />
          <LogFooter edit={true} onClick={() => this.setState({ showModal: true })} />
        </Form>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => this.props.dispatch(deleteLog(this.props.selectedLog.activity_id))}
          message={this.props.t('LOG_COMMON.DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: locationsWithCurrentAndPlannedFieldCropSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ScoutingLog));
