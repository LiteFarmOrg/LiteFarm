import React, { Component } from "react";
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { fieldSelector, cropSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Form} from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import Checkbox from '../../../components/Inputs/Checkbox';
import styles from '../styles.scss';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { addLog } from "../Utility/actions";

class ScoutingLog extends Component{
  constructor(props) {
    super(props);
    this.state = {
      date: moment()
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.props.dispatch(actions.reset('logReducer.forms.scoutingLog'));
  }

  setDate(date){
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_kind: 'scouting',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      action_needed: log.action_needed,
      type: log.type.value.toLowerCase(),
      notes: log.notes || '',
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(addLog(formValue));
  }

  render(){
    const crops = this.props.crops;
    const fields = this.props.fields;

    return(
      <div className="page-container">
        <PageTitle backUrl="/new_log" title="Scouting Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.scoutingLog)}>
          <DefaultLogForm
            model=".scoutingLog"
            fields={fields}
            crops={crops}
            isCropNotRequired={true}
            notesField={true}
            typeField={true}
            typeOptions={['Harvest', 'Pest', 'Disease', 'Weed', 'Other']}
            customFieldset={() => {
              return (
                <Checkbox type="checkbox" model='.action_needed' title='Action Needed'/>
              )
            }}
          />
          <LogFooter />
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ScoutingLog);
