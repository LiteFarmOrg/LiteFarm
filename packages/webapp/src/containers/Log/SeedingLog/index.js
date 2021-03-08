import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from '../Utility/parseFields';
import { addLog } from '../Utility/actions';
import parseCrops from '../Utility/parseCrops';
import { convertToMetric, getUnit } from '../../../util';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import TextArea from '../../../components/Form/TextArea';

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

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, crops, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log, crops);
    let formValue = {
      activity_kind: 'seeding',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes,
      space_depth_cm: convertToMetric(log.space_depth_cm, this.state.space_unit, 'cm'),
      space_length_cm: convertToMetric(log.space_length_cm, this.state.space_unit, 'cm'),
      space_width_cm: convertToMetric(log.space_width_cm, this.state.space_unit, 'cm'),
      'rate_seeds/m2': convertToMetric(log['rate_seeds/m2'], this.state.rate_unit, 'm2', true),
    };
    dispatch(addLog(formValue));
  }

  render() {
    const { crops, fields } = this.props;

    return (
      <div className="page-container">
        <PageTitle backUrl="/new_log" title={this.props.t('LOG_SEEDING.TITLE')} />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('LOG_COMMON.CHOOSE_DATE')}
          classes={{ container: { marginBottom: '24px' } }}
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.seedLog)}
        >
          <DefaultLogForm
            model=".seedLog"
            fields={fields}
            crops={crops}
            notesField={false}
            isCropNotRequired={false}
          />
          <Unit
            model=".seedLog.space_depth_cm"
            title={this.props.t('LOG_SEEDING.SEEDING_DEPTH')}
            type={this.state.space_unit}
          />
          <Unit
            model=".seedLog.space_length_cm"
            title={this.props.t('LOG_SEEDING.SEED_SPACING')}
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
              <Control component={TextArea} model=".seedLog.notes" />
            </div>
          </div>
          <LogFooter />
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SeedingLog));
