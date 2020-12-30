import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { currentLogSelector, logSelector } from '../selectors';
import { cropSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from '../Utility/parseFields';
import { deleteLog, editLog } from '../Utility/actions';
import parseCrops from '../Utility/parseCrops';
import { convertFromMetric, convertToMetric, getUnit, roundToFourDecimal } from '../../../util';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';

class SeedingLog extends Component {
  constructor(props) {
    super(props);
    const farm = this.props.farm || {};
    this.props.dispatch(actions.reset('logReducer.forms.seedLog'));

    this.state = {
      date: moment(),
      space_unit: getUnit(farm, 'cm', 'in'),
      rate_unit: getUnit(farm, 'm2', 'ft2'),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    dispatch(
      actions.change(
        'logReducer.forms.seedLog.space_depth_cm',
        roundToFourDecimal(
          convertFromMetric(selectedLog.seedLog.space_depth_cm, this.state.space_unit, 'cm'),
        ),
      ),
    );
    dispatch(
      actions.change(
        'logReducer.forms.seedLog.space_length_cm',
        roundToFourDecimal(
          convertFromMetric(selectedLog.seedLog.space_length_cm, this.state.space_unit, 'cm'),
        ),
      ),
    );
    dispatch(
      actions.change(
        'logReducer.forms.seedLog.space_width_cm',
        roundToFourDecimal(
          convertFromMetric(selectedLog.seedLog.space_width_cm, this.state.space_unit, 'cm'),
        ),
      ),
    );
    dispatch(
      actions.change(
        'logReducer.forms.seedLog.rate_seeds/m2',
        roundToFourDecimal(
          convertFromMetric(selectedLog.seedLog['rate_seeds/m2'], this.state.rate_unit, 'm2', true),
        ),
      ),
    );
    dispatch(actions.change('logReducer.forms.seedLog.notes', selectedLog.notes));
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, crops, fields, selectedLog } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log, crops);
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'seeding',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes || '',
      space_depth_cm: convertToMetric(log.space_depth_cm, this.state.space_unit, 'cm'),
      space_length_cm: convertToMetric(log.space_length_cm, this.state.space_unit, 'cm'),
      space_width_cm: convertToMetric(log.space_width_cm, this.state.space_unit, 'cm'),
      'rate_seeds/m2': convertToMetric(log['rate_seeds/m2'], this.state.rate_unit, 'm2', true),
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
          title={`${this.props.t('common:EDIT')} ${this.props.t('LOG_SEEDING.TITLE')}`}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder="Choose a date"
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.seedLog)}
        >
          <DefaultLogForm
            parent="logReducer.forms"
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            model=".seedLog"
            fields={fields}
            crops={crops}
            notesField={false}
            isCropNotRequired={false}
          />
          <Unit
            model=".seedLog.space_depth_cm"
            title={this.props.t('LOG_SEEDING.SPACE_DEPTH')}
            type={this.state.space_unit}
          />
          <Unit
            model=".seedLog.space_length_cm"
            title={this.props.t('LOG_SEEDING.SPACE_LENGTH')}
            type={this.state.space_unit}
          />
          <Unit
            model=".seedLog.space_width_cm"
            title={this.props.t('LOG_SEEDING.SPACE_WIDTH')}
            type={this.state.space_unit}
          />
          <Unit
            model=".seedLog.rate_seeds/m2"
            title={this.props.t('LOG_SEEDING.RATE')}
            type={`seeds/${this.state.rate_unit}`}
          />
          <div>
            <div className={styles.noteTitle}>{this.props.t('common:NOTES')}</div>
            <div className={styles.noteContainer}>
              <Control.textarea model=".harvestLog.notes" />
            </div>
          </div>
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
    farm: userFarmSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SeedingLog));
