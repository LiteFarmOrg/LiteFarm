/* eslint-disable */
import React, { Component } from "react";
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { fieldSelector, cropSelector, farmSelector } from '../../selector';
import { fertSelector, fertTypeSelector } from "../FertilizingLog/selectors";
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import DropDown from '../../../components/Inputs/DropDown';
import { Control, Form } from 'react-redux-form';
import  { getFertilizers, addFertilizer, editFertilizerLog } from '../FertilizingLog/actions';
import { actions } from 'react-redux-form';
import Popup from "reactjs-popup";
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import closeButton from '../../../assets/images/grey_close_button.png';
import parseCrops from "../Utility/parseCrops";
import parseFields from "../Utility/parseFields";
import {currentLogSelector, logSelector} from "../selectors";
import { getUnit, convertToMetric, convertFromMetric, roundToFourDecimal } from '../../../util';
import {deleteLog} from "../Utility/actions";
import ConfirmModal from "../../../components/Modals/Confirm";
import Unit from '../../../components/Inputs/Unit';



class FertilizingLog extends Component{
  constructor(props){
    super(props);
    this.state={
      date : moment(),
      showChem: false,
      showCustomProduct: false,
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
    };
    this.props.dispatch(actions.reset('logReducer.forms.fertLog'));

    this.setDate = this.setDate.bind(this);
    this.setSelectedFert = this.setSelectedFert.bind(this);
    this.toggleChemInfo = this.toggleChemInfo.bind(this);
    this.openEditModal = this.openEditModal.bind(this);
    this.saveCustomFert = this.saveCustomFert.bind(this);
  }

  componentDidMount(){
    const { selectedLog, dispatch } = this.props;
    dispatch(getFertilizers());
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date)
    });

    const {fertilizers} = this.props;

    if (fertilizers) {
      const selectedFertilizer = fertilizers.filter((f) => f.fertilizer_id === selectedLog.fertilizerLog.fertilizer_id)[0];
      console.log('ahshadh', selectedLog);
      dispatch(actions.change('logReducer.forms.fertLog.fert_id', { value: selectedFertilizer.fertilizer_id, label: selectedFertilizer.fertilizer_type}));
      dispatch(actions.change('logReducer.forms.fertLog.n_percentage', selectedFertilizer.n_percentage));
      dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', selectedFertilizer.nh4_n_ppm));
      dispatch(actions.change('logReducer.forms.fertLog.k_percentage', selectedFertilizer.k_percentage));
      dispatch(actions.change('logReducer.forms.fertLog.p_percentage', selectedFertilizer.p_percentage));
      dispatch(actions.change('logReducer.forms.fertLog.moisture_percentage', selectedFertilizer.moisture_percentage));
      dispatch(actions.change('logReducer.forms.fertLog.quantity_kg', roundToFourDecimal(convertFromMetric(parseFloat(selectedLog.fertilizerLog.quantity_kg), this.state.quantity_unit, 'kg')).toString()));
      dispatch(actions.change('logReducer.forms.fertLog.notes', selectedLog.notes));
    }
  }

  openEditModal = () => {
    this.setState({ showCustomProduct: true });
  };
  closeEditModal = () => {
    this.setState({ showCustomProduct: false });
  };

  setDate(date){
    this.setState({
      date: date,
    });
  }

  toggleChemInfo(){
    this.setState({
      showChem: !this.state.showChem
    });
  }

  // change the chem values on fert select
  setSelectedFert(option){
    let fert_id = parseInt(option.value, 10);
    let fert = null;

    for(let fertilizer of this.props.fertilizers){
      if(fertilizer.fertilizer_id === fert_id){
        fert = fertilizer;
      }
    }
    if(fert === null) {
      alert('failed to retrieve fertilizer values.');
      return;
    }
    this.props.dispatch(actions.change('logReducer.forms.fertLog.fert_id', fert_id));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.n_percentage', fert.n_percentage));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', fert.nh4_n_ppm));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.k_percentage', fert.k_percentage));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.p_percentage', fert.p_percentage));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.moisture_percentage', fert.moisture_percentage));
  }

  handleSubmit(fertLog){
    const selectedCrops = parseCrops(fertLog);
    const selectedFields = parseFields(fertLog, this.props.fields);
    const { selectedLog } = this.props;

    let fertConfig = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'fertilizing',
      date : this.state.date,
      fertilizer_id: fertLog.fert_id.value,
      notes: fertLog.notes,
      quantity_kg: convertToMetric(parseFloat(fertLog.quantity_kg), this.state.quantity_unit, 'kg'),
      moisture_percentage: fertLog.moisture_percentage,
      n_percentage: fertLog.n_percentage,
      p_percentage: fertLog.p_percentage,
      nh4_n_ppm: fertLog.nh4_n_ppm,
      k_percentage: fertLog.k_percentage,
      fields: selectedFields,
      crops: selectedCrops,
      fertilizer_type: fertLog.product,
    };
    this.props.dispatch(editFertilizerLog(fertConfig));

  }


  saveCustomFert(){
    let fertLog = this.props.fertLog;
    if(!fertLog.product || fertLog.product === ''){
      alert('Missing product name');
      return;
    }
    let fertConfig = {
      moisture_percentage: fertLog.moisture_percentage,
      n_percentage: fertLog.n_percentage,
      p_percentage: fertLog.p_percentage,
      nh4_n_ppm: fertLog.nh4_n_ppm,
      k_percentage: fertLog.k_percentage,
      fertilizer_type: fertLog.product,
    };
    this.props.dispatch(addFertilizer(fertConfig));
    this.closeEditModal();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.fertilizers !== prevProps.fertilizers) {
      let productName = 'CUSTOM - ' + this.props.fertLog.product;
      for(let fert of this.props.fertilizers){
        if(productName === fert.fertilizer_type){
          this.props.dispatch(actions.change('logReducer.forms.fertLog.fert_id', { value: fert.fertilizer_id, label: fert.fertilizer_type}));
          this.props.dispatch(actions.change('logReducer.forms.fertLog.n_percentage', fert.n_percentage));
          this.props.dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', fert.nh4_n_ppm));
          this.props.dispatch(actions.change('logReducer.forms.fertLog.k_percentage', fert.k_percentage));
          this.props.dispatch(actions.change('logReducer.forms.fertLog.p_percentage', fert.p_percentage));
          this.props.dispatch(actions.change('logReducer.forms.fertLog.moisture_percentage', fert.moisture_percentage));
        }
      }
    }
  }

  compareFert = ( a, b ) => {
    if ( a.label.toLowerCase() < b.label.toLowerCase() ){
      return -1;
    }
    if ( a.label.toLowerCase() > b.label.toLowerCase() ){
      return 1;
    }
    return 0;
  };

  sortFert = (fert) => {
    let fertOptions = [];
    let customOptions = [];
    if(fert){
      for(let f of fert){
        if(f.fertilizer_type.startsWith("CUSTOM")){
          customOptions.push(
            { value: f.fertilizer_id, label: f.fertilizer_type }
          )
        }else{
          fertOptions.push(
            { value: f.fertilizer_id, label: f.fertilizer_type }
          )
        }
      }

      fertOptions.sort(this.compareFert);
      customOptions.sort(this.compareFert);

      fertOptions= fertOptions.concat(customOptions);
    }

    return fertOptions;
  };



  render(){
    const { crops, fields, fertilizers, selectedLog} = this.props;

    const fertilizerOptions = this.sortFert(fertilizers);
    const selectedFields = selectedLog.field.map((f) => ({ value: f.field_id, label: f.field_name }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({ value: fc.field_crop_id, label: fc.crop.crop_common_name, field_id: fc.field_id }));

    return(
      <div className="page-container" style={{styles}}>
        <PageTitle backUrl="/log" title="Edit Fertilizing Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        {
          (
            <div>
              <Form className={styles.formContainer}  model="logReducer.forms" onSubmit={(val) => this.handleSubmit(val.fertLog)}>
                <DefaultLogForm
                  selectedCrops={selectedCrops}
                  selectedFields={selectedFields}
                  parent='logReducer.forms'
                  model=".fertLog"
                  style={styles.labelContainer}
                  isCropNotRequired={true}
                />
                <div className={styles.defaultFormDropDown}>
                  <label>Product</label>
                  <Control
                    model=".fertLog.fert_id"
                    component={DropDown}
                    options={fertilizerOptions || []}
                    placeholder="select product"
                    onChange={this.setSelectedFert}
                  />
                </div>
                <div>
                  <div className={styles.greenTextButton} onClick={()=>this.openEditModal()}> + Add a custom product </div>
                </div>
                <Unit model='.fertLog.quantity_kg' title='Quantity' type={this.state.quantity_unit} validate/>
                <div className={styles.noteTitle}>
                  Notes
                </div>
                <div className={styles.noteContainer}>
                  <Control.textarea model=".fertLog.notes"/>
                </div>
                <div className={styles.greenTextButton} onClick={()=>this.toggleChemInfo()}>{this.state.showChem ? 'Hide' : 'Show' } Product Chemical Composition</div>
                {this.state.showChem && (
                  <div>
                    <div className={styles.noteTitle}>
                      Chemical composition:
                    </div>
                    <div className={styles.chemContainer}>
                      <label>NO3(Nitrate)</label>
                      <Control.text model=".fertLog.n_percentage"  disabled={true} /><span>%</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>NH4(Ammonia)</label>
                      <Control.text model=".fertLog.nh4_n_ppm" disabled={true} /><span>ppm</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>K(Potassium)</label>
                      <Control.text model=".fertLog.k_percentage" disabled={true} /><span>%</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>P(Phosphate)</label>
                      <Control.text model=".fertLog.p_percentage" disabled={true} /><span>%</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>H2O</label>
                      <Control.text model=".fertLog.moisture_percentage" disabled={true} /><span>%</span>
                    </div>

                  </div>
                )}
                <LogFooter edit={true} onClick={() => this.setState({ showModal: true })}/>
              </Form>
              <ConfirmModal
                open={this.state.showModal}
                onClose={() => this.setState({ showModal: false })}
                onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
                message='Are you sure you want to delete this log?'
              />

              <Popup
                open={this.state.showCustomProduct}
                closeOnDocumentClick
                onClose={this.closeEditModal}
                contentStyle={{display:'flex', width:'100%', height:'100vh', padding:'0 5%'}}
                overlayStyle={{zIndex: '1060', height:'100vh'}}
              >

                <Form className={styles.formContainer}  model="logReducer.forms" onSubmit={(val) => this.handleSubmit(val.fertLog)}>
                  <div className={styles.modal}>
                    <div className={styles.popupTitle}>
                      <a className={styles.close} onClick={this.closeEditModal}>
                        <img src={closeButton} alt=""/>
                      </a>
                      <h3>Add a Fertilizer</h3>
                    </div>
                  </div>
                  <div className={styles.defaultFormDropDown}>
                    <label>Default Product</label>
                    <Control
                      model=".fertLog.fert_id"
                      component={DropDown}
                      options={fertilizerOptions || []}
                      placeholder="select product template"
                      onChange={this.setSelectedFert}
                    />
                  </div>
                  <div className={styles.textContainer}>
                    <label>Product Name</label>
                    <Control.text model=".fertLog.product"/>
                  </div>
                  <div className={styles.noteTitle}>
                    Chemical composition:
                  </div>
                  <div className={styles.chemContainer}>
                    <label>NO3(Nitrate)</label>
                    <Control.input type="number" step="any" model=".fertLog.n_percentage" /><span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>NH4(Ammonia)</label>
                    <Control.input type="number" step="any" model=".fertLog.nh4_n_ppm" /><span>ppm</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>K(Potassium)</label>
                    <Control.input type="number" step="any" model=".fertLog.k_percentage" /><span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>P(Phosphate)</label>
                    <Control.input type="number" step="any" model=".fertLog.p_percentage" /><span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>H2O</label>
                    <Control.input type="number" step="any" model=".fertLog.moisture_percentage" /><span>%</span>
                  </div>
                  <div className={styles.centerButton}>
                    <div className="btn btn-primary" onClick={this.saveCustomFert}>Save</div>
                  </div>
                </Form>
              </Popup>

            </div>
          )
        }
        {
          (!crops || !fields || !fertilizers) && <p>Error: Missing Crops or fields</p>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    farm: farmSelector(state),
    fertilizers: fertSelector(state),
    fertLog: fertTypeSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(FertilizingLog);
