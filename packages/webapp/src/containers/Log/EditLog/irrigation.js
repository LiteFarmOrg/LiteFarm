import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { currentLogSelector, logSelector } from '../selectors';
import { cropSelector, fieldSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import { deleteLog, editLog } from '../Utility/actions';
import styles from '../styles.scss';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { convertFromMetric, convertToMetric, getUnit, roundToFourDecimal } from '../../../util';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';

// const customFieldset = () => {
//   return (<div>
//     <Unit model='.flow_rate' title='Flow Rate' type='l/min' dropdown={true} options={['l/min', 'l/hr', 'gal/min', 'gal/hr']}/>
//     <Unit model='.hours' title='Total Time' type='hrs'/>
//   </div>)
// };

class IrrigationLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.irrigationLog'));

    this.state = {
      date: moment(),
      ratePerMin: getUnit(this.props.farm, 'l/min', 'gal/min'),
      ratePerHr: getUnit(this.props.farm, 'l/h', 'gal/h'),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    dispatch(actions.change('logReducer.forms.irrigationLog.unit', this.state.ratePerMin));
    dispatch(
      actions.change('logReducer.forms.irrigationLog.type', {
        value: selectedLog.irrigationLog.type,
        label: selectedLog.irrigationLog.type,
      }),
    );
    dispatch(actions.change('logReducer.forms.irrigationLog.notes', selectedLog.notes));
    dispatch(
      actions.change(
        'logReducer.forms.irrigationLog.flow_rate_l/min',
        roundToFourDecimal(
          convertFromMetric(
            selectedLog.irrigationLog['flow_rate_l/min'],
            this.state.ratePerMin,
            'l/min',
          ),
        ),
      ),
    );
    dispatch(
      actions.change('logReducer.forms.irrigationLog.hours', selectedLog.irrigationLog.hours),
    );
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(irrigationLog) {
    const { dispatch, fields } = this.props;
    let selectedCrops = parseCrops(irrigationLog);
    let selectedFields = parseFields(irrigationLog, fields);
    let selectedLog = this.props.selectedLog;
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'irrigation',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      type: irrigationLog.type.value,
      notes: irrigationLog.notes,
      'flow_rate_l/min': convertToMetric(
        irrigationLog['flow_rate_l/min'],
        irrigationLog.unit,
        'l/min',
      ),
      hours: irrigationLog.hours,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(editLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const fields = this.props.fields;
    const { selectedLog } = this.props;
    const selectedFields = selectedLog.field.map((f) => ({
      value: f.field_id,
      label: f.field_name,
    }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({
      value: fc.field_crop_id,
      label: fc.crop.crop_common_name,
      field_id: fc.field_id,
    }));
    const rateOptions = [this.state.ratePerMin, this.state.ratePerHr];
    //const rateOptions = [this.state.ratePerMin, this.state.ratePerHr];

    const customFieldset = () => {
      return (
        <div>
          <Unit
            model=".flow_rate_l/min"
            title={this.props.t('LOG_IRRIGATION.FLOW_RATE')}
            dropdown={true}
            options={rateOptions}
          />
          <Unit model=".hours" title={this.props.t('LOG_IRRIGATION.TOTAL_TIME')} type="hrs" />
        </div>
      );
    };

    return (
      <div className="page-container">
        <PageTitle
          backUrl="/log"
          title={`${this.props.t('common:EDIT')} ${this.props.t('LOG_IRRIGATION.TITLE')}`}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('LOG_COMMON.CHOOSE_DATE')}
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.irrigationLog)}
        >
          <DefaultLogForm
            selectedCrops={selectedCrops}
            parent="logReducer.forms"
            selectedFields={selectedFields}
            style={styles.labelContainer}
            model=".irrigationLog"
            fields={fields}
            crops={crops}
            notesField={true}
            isCropNotRequired={true}
            typeField={true}
            typeOptions={['sprinkler', 'drip', 'subsurface', 'flood']}
            customFieldset={customFieldset}
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
    crops: cropSelector(state),
    fields: fieldSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(IrrigationLog));
