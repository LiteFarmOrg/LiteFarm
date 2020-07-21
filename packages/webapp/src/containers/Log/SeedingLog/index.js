import React, {Component} from "react";
import {connect} from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {fieldSelector, cropSelector, farmSelector} from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Control, Form} from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from "../Utility/parseFields";
import {addLog} from "../Utility/actions";
import parseCrops from "../Utility/parseCrops";
import {convertToMetric, getUnit} from "../../../util";

class SeedingLog extends Component {
  constructor(props) {
    super(props);
    const farm = this.props.farm || {};

    this.props.dispatch(actions.reset('logReducer.forms.seedLog'));

    this.state = {
      date: moment(),
      space_unit: getUnit(farm, 'cm', 'in'),
      rate_unit: getUnit(farm, 'm2', 'ft2')
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
    const {dispatch, crops, fields} = this.props;
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
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(addLog(formValue));
  }

  render() {
    const {crops, fields} = this.props;

    return (
      <div className="page-container">
        <PageTitle backUrl="/new_log" title="Seeding Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer}
              onSubmit={(val) => this.handleSubmit(val.seedLog)}>
          <DefaultLogForm
            model=".seedLog"
            fields={fields}
            crops={crops}
            notesField={false}
            isCropNotRequired={false}
          />
          <Unit model='.seedLog.space_depth_cm' title='Space Depth' type={this.state.space_unit}/>
          <Unit model='.seedLog.space_length_cm' title='Space Length' type={this.state.space_unit}/>
          <Unit model='.seedLog.space_width_cm' title='Space Width' type={this.state.space_unit}/>
          <Unit model='.seedLog.rate_seeds/m2' title='Rate' type={`seeds/${this.state.rate_unit}`}/>
          <div>
            <div className={styles.noteTitle}>
              Notes
            </div>
            <div className={styles.noteContainer}>
              <Control.textarea model=".seedLog.notes"/>
            </div>
          </div>
          <LogFooter/>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SeedingLog);
