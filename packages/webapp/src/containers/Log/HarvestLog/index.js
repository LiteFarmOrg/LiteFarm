import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { cropSelector, } from '../../selector';
import { getFieldCrops } from '../../../containers/actions';
import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Form } from 'react-redux-form';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import { addLog } from '../Utility/actions';
import { convertToMetric, getUnit } from '../../../util';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import LogFormOneCrop from '../../../components/Forms/LogFormOneCrop';
import Unit from '../../../components/Inputs/Unit';
import { userFarmSelector } from '../../userFarmSlice';
import { fieldsSelector } from '../../fieldSlice';

class HarvestLog extends Component {
  constructor(props) {
    super(props);
    const {farm, dispatch} = this.props;

    this.props.dispatch(actions.reset('logReducer.forms.harvestLog'));

    this.state = {
      date: moment(),
      quantity_unit: getUnit(farm, 'kg', 'lb'),
    };
    this.setDate = this.setDate.bind(this);
    dispatch(getFieldCrops());
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const {dispatch, fields} = this.props;
    const selectedCrops = parseCrops(log);
    const selectedFields = parseFields(log, fields);

    //let selectedFields = parseFields(log, fields);
    //let selectedCrops = parseCrops(log);
    let formValue = {
      activity_kind: 'harvest',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes,
      user_id: localStorage.getItem('user_id'),
      quantity_kg: convertToMetric(log.quantity_kg, this.state.quantity_unit, 'kg'),
    };
    dispatch(addLog(formValue));
  }

  render() {
    const {crops, fields} = this.props;
    return (
      <div className="page-container">
        <PageTitle backUrl="/new_log" title="Harvest Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.harvestLog)}>
          <LogFormOneCrop
            model=".harvestLog"
            fields={fields}
            crops={crops}
            notesField={false}
          />
          <Unit model='.harvestLog.quantity_kg' title='Quantity' type={this.state.quantity_unit} validate/>
          <div>
            <div className={styles.noteTitle}>
              Notes
            </div>
            <div className={styles.noteContainer}>
              <Control.textarea model=".harvestLog.notes"/>
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
    fields: fieldsSelector(state),
    farm: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HarvestLog);
