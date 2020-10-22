import React, { Component } from "react";
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { fieldSelector, cropSelector, farmSelector } from '../../selector';
import { diseaseSelector, pesticideSelector, pestLogSelector } from "./selectors";
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import {Control, Errors, Form} from 'react-redux-form';
import  { getDiseases, getPesticides, addPestControlLog, addDiseases, addPesticide } from './actions';
import { actions } from 'react-redux-form';
import Popup from "reactjs-popup";
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import closeButton from '../../../assets/images/grey_close_button.png';
import DropDown from "../../../components/Inputs/DropDown";
import parseCrops from "../Utility/parseCrops";
import parseFields from "../Utility/parseFields";
import {convertToMetric, getUnit} from "../../../util";
import Select from 'react-select';
import Unit from '../../../components/Inputs/Unit';


class PestControlLog extends Component{
  constructor(props){
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog'));
    this.state={
      date : moment(),
      showChem: false,
      showCustomDisease: false,
      showCustomPesticide: false,
      diseaseGroup: ['Other', 'Fungus', 'Insect', 'Bacteria', 'Virus', 'Mite', 'Weed'],
      controlType: ['systemicSpray', 'foliarSpray', 'handPick', 'biologicalControl', 'burning', 'soilFumigation', 'heatTreatment'],
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
    };

    this.setDate = this.setDate.bind(this);
    this.setSelectedPesticide = this.setSelectedPesticide.bind(this);
    this.toggleChemInfo = this.toggleChemInfo.bind(this);
    this.saveCustomDisease = this.saveCustomDisease.bind(this);
    this.saveCustomPesticide = this.saveCustomPesticide.bind(this);
  }

  openPesticideModal = () => {
    this.setState({ showCustomPesticide: true });
  };
  closePesticideModal = () => {
    this.setState({ showCustomPesticide: false });
  };

  openDiseaseModal = () => {
    this.setState({ showCustomDisease: true });
  };
  closeDiseaseModal = () => {
    this.setState({ showCustomDisease: false });
  };

  setDate(date){
    this.setState({
      date: date,
    });
  }

  componentDidMount(){
    this.props.dispatch(getPesticides());
    this.props.dispatch(getDiseases());
  }

  toggleChemInfo(){
    this.setState({
      showChem: !this.state.showChem
    });
  }

  // change the chem values on fert select
  setSelectedPesticide(option){
    if(option.value){
      let pesticide_id = Number(parseInt(option.value, 10));
      let pesticide = null;
      for(let pesticideObj of this.props.pesticides){
        if(pesticideObj.pesticide_id === pesticide_id){
          pesticide = pesticideObj;
        }
      }
      if(pesticide === null) {
        alert('failed to retrieve pesticide values.');
        return;
      }
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.pesticide_id', option));
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.entry_interval', pesticide.entry_interval));
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.harvest_interval', pesticide.harvest_interval));
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.active_ingredients', pesticide.active_ingredients));
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.concentration', pesticide.concentration));
    }
  }

  handleSubmit(pestControlLog){
    const selectedCrops = parseCrops(pestControlLog);
    const selectedFields = parseFields(pestControlLog, this.props.fields);

    let pcConfig = {
      activity_kind: 'pestControl',
      date : this.state.date,
      notes: pestControlLog.notes,
      quantity_kg: convertToMetric(parseFloat(pestControlLog.quantity_kg), this.state.quantity_unit, 'kg'),
      fields: selectedFields,
      crops: selectedCrops,
      target_disease_id: Number(parseInt(pestControlLog.disease_id, 10)),
      pesticide_id: Number(parseInt(pestControlLog.pesticide_id.value, 10)),
      type: pestControlLog.type.value,
    };
    this.props.dispatch(addPestControlLog(pcConfig));

  }


  saveCustomDisease(){
    let pestControlLog = this.props.pestControlLog;
    if(pestControlLog.custom_disease_common_name === ''){
      alert('needs disease name');
      return;
    }
    let diseaseConfig = {
      disease_common_name: 'CUSTOM - ' + pestControlLog.custom_disease_common_name,
      disease_scientific_name: pestControlLog.custom_disease_scientific_name,
      disease_group: pestControlLog.custom_disease_group.value,
    };

    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog.custom_disease_common_name'));
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog.custom_disease_scientific_name'));
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog.custom_disease_group'));
    this.props.dispatch(addDiseases(diseaseConfig));
    this.closeDiseaseModal();
  }

  saveCustomPesticide(){
    let pestControlLog = this.props.pestControlLog;
    if(pestControlLog.custom_pesticide_name === ''){
      alert('needs pesticide name');
      return;
    }
    let pesticideConfig = {
      pesticide_name: 'CUSTOM - ' + pestControlLog.custom_pesticide_name,
      entry_interval: Number(parseFloat(pestControlLog.entry_interval).toFixed(2)),
      harvest_interval: Number(parseFloat(pestControlLog.entry_interval).toFixed(2)),
      active_ingredients: pestControlLog.active_ingredients,
      concentration: Number(pestControlLog.concentration),
    };

    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog.custom_pesticide_name'));
    this.props.dispatch(addPesticide(pesticideConfig));
    this.closePesticideModal();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.pesticides !== prevProps.pesticides) {
      let pesticideName = 'CUSTOM - ' + this.props.pestControlLog.custom_pesticide_name;
      for(let pesticide of this.props.pesticides){
        if(pesticideName === pesticide.pesticide_name){
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.pesticide_id', {label: pesticideName, value: pesticide.pesticide_id}));
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.entry_interval', pesticide.entry_interval));
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.harvest_interval', pesticide.harvest_interval));
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.active_ingredients', pesticide.active_ingredients));
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.concentration', pesticide.concentration));
        }
      }
    }

    if (this.props.diseases !== prevProps.diseases) {
      let diseaseName = 'CUSTOM - ' + this.props.pestControlLog.custom_disease_common_name;
      for(let disease of this.props.diseases){
        if(diseaseName === disease.disease_common_name){
          this.props.dispatch(actions.change('logReducer.forms.pestControlLog.disease_id', disease.disease_id));
        }
      }
    }
  }

  handleTargetSelect = (selectedOption) => {
    this.props.dispatch(actions.change('logReducer.forms.pestControlLog.disease_id', selectedOption.value));
  };

  render(){
    let crops = this.props.crops;
    let fields = this.props.fields;
    let diseases;
    if(this.props.diseases) {
      diseases = this.props.diseases.filter((disease) => {
        return !disease.disease_common_name.toLowerCase().includes('deficiency')
          && !disease.disease_common_name.toLowerCase().includes('fertilizer')
      });
    }
    let pesticides = this.props.pesticides;

    const pesticideOptions = pesticides && pesticides.map((p) => ({ value: p.pesticide_id, label: p.pesticide_name }));
    const typeOptions = this.state.controlType.map((type) => {
      let typeName = type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
      let regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      return { value: type, label: regularName }
    });
    const diseaseOptions = diseases && diseases.map((d) => ({ value: d.disease_id, label: d.disease_common_name }));
    return(
      <div className="page-container" style={{styles}}>
        <PageTitle backUrl="/new_log" title="Pest Control Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        {
          (
            <div>
              <Form className={styles.formContainer}  model="logReducer.forms" onSubmit={(val) => this.handleSubmit(val.pestControlLog)}>
                <DefaultLogForm isCropNotRequired={true} model={".pestControlLog"} style={styles.labelContainer} fields={fields} crops={crops}/>
                <div className={styles.targetDropDown}>
                  <label>Target</label>
                  {/*<Control*/}
                    {/*model=".pestControlLog.disease_id"*/}
                    {/*component={DropDown}*/}
                    {/*options={diseaseOptions || []}*/}
                    {/*placeholder="Choose Target"*/}
                    {/*validators={{required: (val) => val && val.length}}*/}
                  {/*/>*/}
                  <Select
                    isSearchable={true}
                    options={diseaseOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Search Target"
                    onChange={(selectedOption) => this.handleTargetSelect(selectedOption)}
                  />
                </div>

                <Errors
                  className='required'
                  model={`.pestControlLog.disease_id`}
                  show={{touched: true, focus: false}}
                  messages={{
                    required: 'Required'
                  }} />
                <div className={styles.defaultFormDropDown}>
                  <label>Type</label>
                  <Control
                    model=".pestControlLog.type"
                    component={DropDown}
                    options={typeOptions || []}
                    placeholder="Select Type"
                    validators={{required: (val) => val && val.label && val.value}}
                  />
                </div>
                <Errors
                  className='required'
                  model={`.pestControlLog.type`}
                  show={{touched: true, focus: false}}
                  messages={{
                    required: 'Required'
                  }} />
                <div className={styles.defaultFormDropDown}>
                  <label>Product</label>
                  <Control
                    model=".pestControlLog.pesticide_id"
                    component={DropDown}
                    options={pesticideOptions || []}
                    placeholder="Select Product"
                    onChange={this.setSelectedPesticide}
                    validators={{required: (val) => val && val.label && val.value}}
                  />
                </div>
                <Errors
                  className='required'
                  model={`.pestControlLog.pesticide_id`}
                  show={{touched: true, focus: false}}
                  messages={{
                    required: 'Required'
                  }} />
                <Unit model='.pestControlLog.quantity_kg' title='Quantity' type={this.state.quantity_unit} validate/>
                <div>
                  <div className={styles.greenTextButton} onClick={()=>this.openDiseaseModal()}> + Add a Target</div>
                </div>
                <div>
                  <div className={styles.greenTextButton} onClick={()=>this.openPesticideModal()}> + Add a Custom Product </div>
                </div>
                <div className={styles.noteTitle}>
                  Notes
                </div>
                <div className={styles.noteContainer}>
                  <Control.textarea model=".pestControlLog.notes"/>
                </div>
                <div className={styles.greenTextButton} onClick={()=>this.toggleChemInfo()}>{this.state.showChem ? 'Hide' : 'Show' } Pesticide Product Details</div>
                {this.state.showChem && (
                  <div>
                    <div className={styles.noteTitle}>
                      Chemical composition:
                    </div>
                    <div className={styles.chemContainer}>
                      <label>Entry Interval</label>
                      <Control.text model=".pestControlLog.entry_interval"  disabled={true} /><span>days</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>Harvest Interval</label>
                      <Control.text model=".pestControlLog.harvest_interval" disabled={true} /><span>days</span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>Active Ingredient</label>
                      <Control.text model=".pestControlLog.active_ingredients" disabled={true} /><span> </span>
                    </div>
                    <div className={styles.chemContainer}>
                      <label>Concentration</label>
                      <Control.text model=".pestControlLog.concentration" disabled={true} /><span>%</span>
                    </div>
                  </div>
                )}
                <LogFooter />
              </Form>

              <Popup
                open={this.state.showCustomPesticide}
                closeOnDocumentClick
                onClose={this.closePesticideModal}
                contentStyle={{display:'flex', width:'100%', height:'100vh', padding:'0 5%'}}
                overlayStyle={{zIndex: '1060', height:'100vh'}}
              >

                <Form className={styles.formContainer}  model="logReducer.forms" >
                  <div className={styles.modal}>
                    <div className={styles.popupTitle}>
                      <a className={styles.close} onClick={this.closePesticideModal}>
                        <img src={closeButton} alt=""/>
                      </a>
                      <h3>Add a Pesticide</h3>
                    </div>
                  </div>
                  {/*<div className={styles.defaultFormDropDown}>*/}
                    {/*<children>Pesticide</children>*/}
                    {/*<Control*/}
                      {/*model=".pestControlLog.pesticide_id"*/}
                      {/*component={DropDown}*/}
                      {/*options={pesticideOptions || []}*/}
                      {/*placeholder="Choose a target"*/}
                      {/*onChange={this.setSelectedPesticide}*/}
                    {/*/>*/}
                  {/*</div>*/}
                  <div className={styles.textContainer}>
                    <label>Pesticide Name</label>
                    <Control.text model=".pestControlLog.custom_pesticide_name"/>
                  </div>
                  <div className={styles.noteTitle}>
                    Pesticide info:
                  </div>
                  <div className={styles.chemContainer}>
                    <label>Entry Interval</label>
                    <Control.input type="number" step="any" model=".pestControlLog.entry_interval" placeholder="optional"/><span>days</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>Harvest Interval</label>
                    <Control.input type="number" step="any" model=".pestControlLog.harvest_interval" placeholder="optional"/><span>days</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>Active Ingredients</label>
                    <Control.text model=".pestControlLog.active_ingredients" placeholder="optional"/><span></span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>Concentration</label>
                    <Control.input type="number" step="any" model=".pestControlLog.concentration" placeholder="optional"/><span>%</span>
                  </div>
                  <div className={styles.centerButton}>
                    <div className="btn btn-primary" onClick={()=> this.saveCustomPesticide()}>Save</div>
                  </div>
                </Form>
              </Popup>

              {/*disease popup*/}
              <Popup
                open={this.state.showCustomDisease}
                closeOnDocumentClick
                onClose={this.closeDiseaseModal}
                contentStyle={{display:'flex', width:'100%', height:'100vh', padding:'0 5%'}}
                overlayStyle={{zIndex: '1060', height:'100vh'}}
              >

                <Form className={styles.formContainer}  model="logReducer.forms" >
                  <div className={styles.modal}>
                    <div className={styles.popupTitle}>
                      <a className={styles.close} onClick={this.closeDiseaseModal}>
                        <img src={closeButton} alt=""/>
                      </a>
                      <h3>Add a Disease</h3>
                    </div>
                  </div>
                  <div className={styles.defaultFormDropDown}>
                    <label>Target Group</label>
                    <Control
                      model=".pestControlLog.custom_disease_group"
                      component={DropDown}
                      options={this.state.diseaseGroup.map((d) => ({ value: d, label: d }))}
                      placeholder="Add a target"
                    />
                  </div>
                  <div className={styles.textContainerColumn}>
                    <label>Common Name:</label>
                    <Control.text model=".pestControlLog.custom_disease_common_name"  />
                  </div>

                  <div className={styles.textContainerColumn}>
                    <label>
                      Scientific Name (if known):
                    </label>
                    <Control.text model=".pestControlLog.custom_disease_scientific_name" placeholder="optional"/>
                  </div>
                  <div className={styles.centerButton}>
                    <div className="btn btn-primary" onClick={()=> this.saveCustomDisease()}>Save</div>
                  </div>
                </Form>
              </Popup>

            </div>
          )
        }
        {
          (!crops || !fields || !diseases || !pesticides) && <p>Error: Missing data</p>
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
    diseases: diseaseSelector(state),
    pesticides: pesticideSelector(state),
    pestControlLog: pestLogSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(PestControlLog);
