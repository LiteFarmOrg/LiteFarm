import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { currentLogSelector, logSelector } from '../selectors';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from '../Utility/parseFields';
import { deleteLog, editLog } from '../Utility/actions';
import parseCrops from '../Utility/parseCrops';
import ConfirmModal from '../../../components/Modals/Confirm';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';

class OtherLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.otherLog'));

    this.state = {
      date: moment(),
      showModal: false,
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    dispatch(actions.change('logReducer.forms.otherLog.notes', selectedLog.notes));
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, selectedLog, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'other',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(editLog(formValue));
  }

  render() {
    const { crops, fields, selectedLog } = this.props;
    const selectedFields = selectedLog.field.map((f) => ({
      value: f.field_id,
      label: f.field_name,
    }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({
      value: fc.field_crop_id,
      label: this.props.t(`crop:${fc.crop.crop_translation_key}`),
      field_id: fc.field_id,
    }));

    return (
      <div className="page-container">
        <PageTitle
          backUrl="/log"
          title={`${this.props.t('common:EDIT')} ${this.props.t('LOG_OTHER.TITLE')}`}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('LOG_COMMON.CHOOSE_DATE')}
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.otherLog)}
        >
          <DefaultLogForm
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            parent="logReducer.forms"
            model=".otherLog"
            fields={fields}
            crops={crops}
            notesField={true}
            isCropNotRequired={true}
          />
          <LogFooter edit={true} onClick={() => this.setState({ showModal: true })} />
        </Form>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
          message={this.props.t('LOG_COMMON.DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(OtherLog));
