import React, { Component } from "react";
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {logSelector, currentLogSelector} from '../selectors';
import {fieldSelector, cropSelector, farmSelector} from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Control, Form} from 'react-redux-form';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import {convertFromMetric, convertToMetric, getUnit, roundToFourDecimal} from "../../../util";
import {deleteLog, editLog} from "../Utility/actions";
import {getFieldCrops} from "../../actions";
import ConfirmModal from "../../../components/Modals/Confirm";
import LogFormOneCrop from "../../../components/Forms/LogFormOneCrop";
import Unit from '../../../components/Inputs/Unit';

class HarvestLog extends Component{
  constructor(props) {
    super(props);
    const { farm, dispatch } = this.props;

    this.props.dispatch(actions.reset('logReducer.forms.harvestLog'));

    this.state = {
      date: moment(),
      quantity_unit: getUnit(farm, 'kg', 'lb'),
    };
    this.setDate = this.setDate.bind(this);
    dispatch(getFieldCrops());
  }

  setDate(date){
    this.setState({
      date: date,
    });
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    dispatch(actions.change('logReducer.forms.harvestLog.quantity_kg', roundToFourDecimal(convertFromMetric(parseFloat(selectedLog.harvestLog.quantity_kg), this.state.quantity_unit, 'kg')).toString()));
    dispatch(actions.change('logReducer.forms.harvestLog.notes', selectedLog.notes));
  }

  handleSubmit(log) {
    const { dispatch, selectedLog } = this.props;
    const selectedCrop = log['crop'];
    const selectedField = log['field'];
    const toSubmitCrop = {};
    const toSubmitField = {field_id: selectedField['value']};
    for (const key in selectedCrop) {
      if (key === selectedField.value) {
        if (Array.isArray(selectedCrop[key])) {
          toSubmitCrop['field_crop_id'] = selectedCrop[key][0]['value'];
        } else {
          toSubmitCrop['field_crop_id'] = selectedCrop[key]['value'];
        }
        break;
      }
    }

    //let selectedFields = parseFields(log, fields);
    //let selectedCrops = parseCrops(log);
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'harvest',
      date: this.state.date,
      crops: [toSubmitCrop],
      fields: [toSubmitField],
      notes: log.notes,
      user_id: localStorage.getItem('user_id'),
      quantity_kg: convertToMetric(parseFloat(log.quantity_kg), this.state.quantity_unit, 'kg'),
    };
    dispatch(editLog(formValue));
  }

  render(){
    const { crops, fields, selectedLog } = this.props;
    const selectedFields = selectedLog.field.map((f) => ({ value: f.field_id, label: f.field_name }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({ value: fc.field_crop_id, label: fc.crop.crop_common_name, field_id: fc.field_id }));


    return(
      <div className="page-container">
        <PageTitle backUrl="/log" title="Edit Harvest Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.harvestLog)}>
          <LogFormOneCrop
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            parent='logReducer.forms'
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
          <LogFooter edit={true} onClick={() => this.setState({ showModal: true })}/>
        </Form>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
          message='Are you sure you want to delete this log?'
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HarvestLog);
