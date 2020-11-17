import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { cropSelector, fieldSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Errors, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import DropDown from '../../../components/Inputs/DropDown';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from '../Utility/parseFields';
import parseCrops from '../Utility/parseCrops';
import { addLog } from '../Utility/actions';
import { convertToMetric, getUnit } from '../../../util';
import { userFarmSelector } from '../../userFarmSlice';

const parsedTextureOptions = [
  {label: 'Sand', value: 'sand'},
  {label: 'Loamy Sand', value: 'loamySand'},
  {label: 'Sandy Loam', value: 'sandyLoam'},
  {label: 'Loam', value: 'loam'},
  {label: 'Silt Loam', value: 'siltLoam'},
  {label: 'Silt', value: 'silt'},
  {label: 'Sandy Clayloam', value: 'sandyClayLoam'},
  {label: 'Clay Loam', value: 'clayLoam'},
  {label: 'Silty Clayloam', value: 'siltyClayLoam'},
  {label: 'Sandy Clay', value: 'sandyClay'},
  {label: 'Silty Clay', value: 'siltyClay'},
  {label: 'Clay', value: 'clay'}
];

const parsedDepthOptions = [
  {label: '0-5cm', value: 5},
  {label: '0-10cm', value: 10},
  {label: '0-20cm', value: 20},
  {label: '21-30cm', value: 30},
  {label: '30-50cm', value: 50},
  {label: '51-100cm', value: 100}
];

class soilDataLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      showMoreInfo: false,
      depth_unit: getUnit(this.props.farm, 'cm', 'in'),
      bulk_density_numerator: getUnit(this.props.farm, 'kg', 'lb'),
      bulk_density_denominator: getUnit(this.props.farm, 'm3', 'ft3'),
      cec_denominator: getUnit(this.props.farm, 'kg', 'lb'),
    };
    this.props.dispatch(actions.reset('logReducer.forms.soilDataLog'));
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleMoreInfo = this.toggleMoreInfo.bind(this);
  }

  toggleMoreInfo() {
    const {showMoreInfo} = this.state;
    this.setState({showMoreInfo: !showMoreInfo});
  }
  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(logForm) {
    const log = logForm.soilDataLog;
    let cec_unit = this.state.cec_denominator;

    const {dispatch, crops, fields} = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log, crops);

    const bulkDensity = convertToMetric(convertToMetric(parseFloat(log['bulk_density_kg/m3']), this.state.bulk_density_numerator, 'kg'), this.state.bulk_density_denominator, 'm3', true);
    let formValue = {
      activity_kind: 'soilData',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes || '',
      depth_cm: convertToMetric(log.depth_cm.value, this.state.depth_unit, 'cm').toString() || '',
      texture: log.texture.value,
      k: parseInt(log.k, 10) || 0,
      p: parseInt(log.p, 10) || 0,
      n: parseInt(log.n, 10) || 0,
      om: parseInt(log.om, 10) || 0,
      ph: parseInt(log.ph, 10) || 0,
      'bulk_density_kg/m3': bulkDensity || 0,
      organic_carbon: parseInt(log.organic_carbon, 10) || 0,
      inorganic_carbon: parseInt(log.inorganic_carbon, 10) || 0,
      total_carbon: parseInt(log.total_carbon, 10) || 0,
      s: parseInt(log.s, 10) || 0,
      c: parseInt(log.c, 10) || 0,
      ca: parseInt(log.ca, 10) || 0,
      mg: parseInt(log.mg, 10) || 0,
      na: parseInt(log.na, 10) || 0,
      zn: parseInt(log.zn, 10) || 0,
      mn: parseInt(log.mn, 10) || 0,
      fe: parseInt(log.fe, 10) || 0,
      cu: parseInt(log.cu, 10) || 0,
      b: parseInt(log.b, 10) || 0,
      cec: convertToMetric(parseFloat(log.cec), cec_unit, 'kg') || 0,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(addLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const fields = this.props.fields;

    const customFieldset = () => {
      return (
        <div>
          <div className={styles.defaultFormDropDown}>
            <label>Depth</label>
            <Control model='.depth_cm'
                     component={DropDown}
                     options={parsedDepthOptions || []}
                     placeholder="Select Depth"
                     validators={{required: (val) => val && val.label && val.value}}
            />
            <Errors
              className='required'
              model={`.depth_cm`}
              show={{touched: true, focus: false}}
              messages={{
                required: 'Required'
              }}/>
          </div>
          <div className={styles.defaultFormDropDown}>
            <label>Texture</label>
            <Control
              model=".texture"
              component={DropDown}
              options={parsedTextureOptions || []}
              placeholder="Select Texture"
              validators={{required: (val) => val && val.label && val.value}}
            />
            <Errors
              className='required'
              model={`.texture`}
              show={{touched: true, focus: false}}
              messages={{
                required: 'Required'
              }}/>
          </div>
          <Unit model='.k' title='K' type='%'/>
          <Unit model='.p' title='P' type='%'/>
          <Unit model='.n' title='N' type='%'/>
          <Unit model='.om' title='OM' type='%'/>
          <Unit model='.ph' title='ph' type='%'/>
          <Unit model='.bulk_density_kg/m3' title='Bulk Density'
                type={`${this.state.bulk_density_numerator}/${this.state.bulk_density_denominator}`}/>
        </div>
      )
    };

    return (
      <div className="page-container">
        <PageTitle backUrl="/new_log" title="Soil Data Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer}
              onSubmit={(val) => this.handleSubmit(val)}>
          <DefaultLogForm
            model=".soilDataLog"
            fields={fields}
            crops={crops}
            notesField={true}
            customFieldset={customFieldset}
            isCropNotNeeded={true}
          />
          <div onClick={this.toggleMoreInfo} className={styles.greenTextButton}>{this.state.showMoreInfo ? 'Hide' : 'Show'} More Info</div>
          {this.state.showMoreInfo &&
          <div>
            <Unit model='.soilDataLog.organic_carbon' title='Organic Carbon' type='%'/>
            <Unit model='.soilDataLog.inorganic_carbon' title='Inorganic Carbon' type='%'/>
            <Unit model='.soilDataLog.total_carbon' title='Total Carbon' type='%'/>
            <Unit model='.soilDataLog.s' title='S' type='%'/>
            <Unit model='.soilDataLog.c' title='C' type='%'/>
            <Unit model='.soilDataLog.ca' title='Ca' type='%'/>
            <Unit model='.soilDataLog.mg' title='Mg' type='%'/>
            <Unit model='.soilDataLog.na' title='Na' type='%'/>
            <Unit model='.soilDataLog.zn' title='Zn' type='%'/>
            <Unit model='.soilDataLog.mn' title='Mn' type='%'/>
            <Unit model='.soilDataLog.fe' title='Fe' type='%'/>
            <Unit model='.soilDataLog.cu' title='Cu' type='%'/>
            <Unit model='.soilDataLog.b' title='B' type='%'/>
            <Unit model='.soilDataLog.cec' title='CEC' type={'cmolc/' + this.state.cec_denominator}/>
          </div>
          }
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
    farm: userFarmSelector(state).userFarm,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(soilDataLog);
