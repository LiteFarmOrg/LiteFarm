import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle/v2';

import { diseaseSelector, pesticideSelector, pestLogSelector } from './selectors';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import { actions, Control, Errors, Form } from 'react-redux-form';
import {
  addDiseases,
  addPestControlLog,
  addPesticide,
  getDiseases,
  getPesticides,
} from './actions';
import Popup from 'reactjs-popup';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import closeButton from '../../../assets/images/grey_close_button.png';
import DropDown from '../../../components/Inputs/DropDown';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { convertToMetric, getUnit } from '../../../util';
import Unit from '../../../components/Inputs/Unit';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import {
  currentAndPlannedFieldCropsSelector,
  locationsWithCurrentAndPlannedFieldCropSelector,
} from '../../fieldCropSlice';
import Input, { numberOnKeyDown } from '../../../components/Form/Input';
import ReactSelect from '../../../components/Form/ReactSelect';
import { AddLink, Semibold, Underlined } from '../../../components/Typography';

class PestControlLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog'));
    this.state = {
      date: moment(),
      showChem: false,
      showCustomDisease: false,
      showCustomPesticide: false,
      diseaseGroup: ['Other', 'Fungus', 'Insect', 'Bacteria', 'Virus', 'Mite', 'Weed'],
      controlType: [
        'systemicSpray',
        'foliarSpray',
        'handPick',
        'biologicalControl',
        'burning',
        'soilFumigation',
        'heatTreatment',
      ],
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

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  componentDidMount() {
    this.props.dispatch(getPesticides());
    this.props.dispatch(getDiseases());
  }

  toggleChemInfo() {
    this.setState({
      showChem: !this.state.showChem,
    });
  }

  // change the chem values on fert select
  setSelectedPesticide(option) {
    if (option.value) {
      let pesticide_id = Number(parseInt(option.value, 10));
      let pesticide = null;
      for (let pesticideObj of this.props.pesticides) {
        if (pesticideObj.pesticide_id === pesticide_id) {
          pesticide = pesticideObj;
        }
      }
      if (pesticide === null) {
        alert('failed to retrieve pesticide values.');
        return;
      }
      this.props.dispatch(actions.change('logReducer.forms.pestControlLog.pesticide_id', option));
      this.props.dispatch(
        actions.change('logReducer.forms.pestControlLog.entry_interval', pesticide.entry_interval),
      );
      this.props.dispatch(
        actions.change(
          'logReducer.forms.pestControlLog.harvest_interval',
          pesticide.harvest_interval,
        ),
      );
      this.props.dispatch(
        actions.change(
          'logReducer.forms.pestControlLog.active_ingredients',
          pesticide.active_ingredients,
        ),
      );
      this.props.dispatch(
        actions.change('logReducer.forms.pestControlLog.concentration', pesticide.concentration),
      );
    }
  }

  handleSubmit(pestControlLog) {
    const selectedCrops = parseCrops(pestControlLog);
    const selectedFields = parseFields(pestControlLog, this.props.locations);

    let pcConfig = {
      activity_kind: 'pestControl',
      date: this.state.date,
      notes: pestControlLog.notes,
      quantity_kg: convertToMetric(
        parseFloat(pestControlLog.quantity_kg),
        this.state.quantity_unit,
        'kg',
      ),
      locations: selectedFields,
      crops: selectedCrops,
      target_disease_id: Number(parseInt(pestControlLog.disease_id, 10)),
      pesticide_id: Number(parseInt(pestControlLog.pesticide_id.value, 10)),
      type: pestControlLog.type.value,
    };
    this.props.dispatch(addPestControlLog(pcConfig));
  }

  saveCustomDisease() {
    let pestControlLog = this.props.pestControlLog;
    if (pestControlLog.custom_disease_common_name === '') {
      alert('needs disease name');
      return;
    }
    let diseaseConfig = {
      disease_common_name: 'CUSTOM - ' + pestControlLog.custom_disease_common_name,
      disease_scientific_name: pestControlLog.custom_disease_scientific_name,
      disease_group: pestControlLog.custom_disease_group.value,
    };

    this.props.dispatch(
      actions.reset('logReducer.forms.pestControlLog.custom_disease_common_name'),
    );
    this.props.dispatch(
      actions.reset('logReducer.forms.pestControlLog.custom_disease_scientific_name'),
    );
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog.custom_disease_group'));
    this.props.dispatch(addDiseases(diseaseConfig));
    this.closeDiseaseModal();
  }

  saveCustomPesticide() {
    let pestControlLog = this.props.pestControlLog;
    if (pestControlLog.custom_pesticide_name === '') {
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
      for (let pesticide of this.props.pesticides) {
        if (pesticideName === pesticide.pesticide_name) {
          this.props.dispatch(
            actions.change('logReducer.forms.pestControlLog.pesticide_id', {
              label: pesticideName,
              value: pesticide.pesticide_id,
            }),
          );
          this.props.dispatch(
            actions.change(
              'logReducer.forms.pestControlLog.entry_interval',
              pesticide.entry_interval,
            ),
          );
          this.props.dispatch(
            actions.change(
              'logReducer.forms.pestControlLog.harvest_interval',
              pesticide.harvest_interval,
            ),
          );
          this.props.dispatch(
            actions.change(
              'logReducer.forms.pestControlLog.active_ingredients',
              pesticide.active_ingredients,
            ),
          );
          this.props.dispatch(
            actions.change(
              'logReducer.forms.pestControlLog.concentration',
              pesticide.concentration,
            ),
          );
        }
      }
    }

    if (this.props.diseases !== prevProps.diseases) {
      let diseaseName = 'CUSTOM - ' + this.props.pestControlLog.custom_disease_common_name;
      for (let disease of this.props.diseases) {
        if (diseaseName === disease.disease_common_name) {
          this.props.dispatch(
            actions.change('logReducer.forms.pestControlLog.disease_id', disease.disease_id),
          );
        }
      }
    }
  }

  handleTargetSelect = (selectedOption) => {
    this.props.dispatch(
      actions.change('logReducer.forms.pestControlLog.disease_id', selectedOption.value),
    );
  };
  render() {
    let crops = this.props.crops;
    let locations = this.props.locations;
    let diseases;
    if (this.props.diseases) {
      diseases = this.props.diseases.filter((disease) => {
        return (
          !disease.disease_common_name.toLowerCase().includes('deficiency') &&
          !disease.disease_common_name.toLowerCase().includes('fertilizer')
        );
      });
    }
    let pesticides = this.props.pesticides;

    const pesticideOptions =
      pesticides &&
      pesticides.map((p) => ({
        value: p.pesticide_id,
        label: p.pesticide_name,
      }));
    const typeOptions = this.state.controlType.map((type) => {
      let typeName = type.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
      let regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      return { value: type, label: regularName };
    });
    const diseaseOptions =
      diseases &&
      diseases.map((d) => ({
        value: d.disease_id,
        label: d.farm_id
          ? d.disease_common_name
          : this.props.t(`disease:name.${d.disease_name_translation_key}`),
      }));
    const isAdmin =
      this.props.farm.role_id === 1 ||
      this.props.farm.role_id === 2 ||
      this.props.farm.role_id === 5;
    return (
      <div className="page-container" style={{ styles }}>
        <PageTitle
          onGoBack={() => this.props.history.push('/new_log')}
          onCancel={() => this.props.history.push('/log')}
          style={{ paddingBottom: '24px' }}
          title={this.props.t('LOG_COMMON.ADD_A_LOG')}
        />
        <Semibold style={{ marginBottom: '24px' }}>{this.props.t('LOG_PESTICIDE.TITLE')}</Semibold>
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          label={this.props.t('common:DATE')}
        />
        {
          <>
            <Form
              className={styles.formContainer}
              model="logReducer.forms"
              onSubmit={(val) => this.handleSubmit(val.pestControlLog)}
            >
              <DefaultLogForm
                isCropNotRequired={true}
                model={'.pestControlLog'}
                style={styles.labelContainer}
                locations={locations}
                crops={crops}
              />
              <div className={styles.targetDropDown}>
                <ReactSelect
                  label={this.props.t('LOG_PESTICIDE.TARGET')}
                  isSearchable={true}
                  options={diseaseOptions}
                  className="basic-single"
                  classNamePrefix="select"
                  placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_TARGET_PLACEHOLDER')}
                  onChange={(selectedOption) => this.handleTargetSelect(selectedOption)}
                />
                <Errors
                  className="required"
                  model={`.pestControlLog.disease_id`}
                  show={{ touched: true, focus: false }}
                  messages={{
                    required: this.props.t('common:REQUIRED'),
                  }}
                />
              </div>

              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_PESTICIDE.TYPE')}</label>
                <Control
                  model=".pestControlLog.type"
                  component={DropDown}
                  options={typeOptions || []}
                  placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_TYPE_PLACEHOLDER')}
                  validators={{
                    required: (val) => val && val.label && val.value,
                  }}
                />
                <Errors
                  className="required"
                  model={`.pestControlLog.type`}
                  show={{ touched: true, focus: false }}
                  messages={{
                    required: this.props.t('common:REQUIRED'),
                  }}
                />
              </div>
              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_COMMON.PRODUCT')}</label>
                <Control
                  model=".pestControlLog.pesticide_id"
                  component={DropDown}
                  options={pesticideOptions || []}
                  placeholder={this.props.t('LOG_COMMON.SELECT_PRODUCT')}
                  onChange={this.setSelectedPesticide}
                  validators={{
                    required: (val) => val && val.label && val.value,
                  }}
                />
                <Errors
                  className="required"
                  model={`.pestControlLog.pesticide_id`}
                  show={{ touched: true, focus: false }}
                  messages={{
                    required: this.props.t('common:REQUIRED'),
                  }}
                />
              </div>
              <Unit
                model=".pestControlLog.quantity_kg"
                title={this.props.t('LOG_COMMON.QUANTITY')}
                type={this.state.quantity_unit}
                validate
              />
              {isAdmin && (
                <AddLink
                  style={{ paddingBottom: '8px', transform: 'translateY(-8px)' }}
                  onClick={() => this.openDiseaseModal()}
                >
                  {this.props.t('LOG_PESTICIDE.ADD_DISEASE')}
                </AddLink>
              )}
              {isAdmin && (
                <AddLink
                  style={{ paddingBottom: '20px', transform: 'translateY(-8px)' }}
                  onClick={() => this.openPesticideModal()}
                >
                  {this.props.t('LOG_PESTICIDE.ADD_CUSTOM_PESTICIDE')}
                </AddLink>
              )}

              <div className={styles.noteContainer}>
                <Control
                  optional
                  label={this.props.t('common:NOTES')}
                  component={Input}
                  model=".pestControlLog.notes"
                />
              </div>
              <Underlined style={{ paddingTop: '8px' }} onClick={() => this.toggleChemInfo()}>
                {this.state.showChem
                  ? this.props.t('LOG_COMMON.HIDE')
                  : this.props.t('LOG_COMMON.SHOW')}{' '}
                {this.props.t('LOG_PESTICIDE.PESTICIDE_DETAILS')}
              </Underlined>
              {this.state.showChem && (
                <div>
                  <div className={styles.noteTitle}>
                    {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                  </div>
                  <div className={styles.chemContainer}>
                    {' '}
                    <Control
                      label={this.props.t('LOG_PESTICIDE.ENTRY_INTERVAL')}
                      component={Input}
                      model=".pestControlLog.entry_interval"
                      disabled={true}
                    />
                    <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <Control
                      label={this.props.t('LOG_PESTICIDE.HARVEST_INTERVAL')}
                      component={Input}
                      model=".pestControlLog.harvest_interval"
                      disabled={true}
                    />
                    <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <Control
                      label={this.props.t('LOG_PESTICIDE.ACTIVE_INGREDIENTS')}
                      component={Input}
                      model=".pestControlLog.active_ingredients"
                      disabled={true}
                    />
                    <span> </span>
                  </div>
                  <div className={styles.chemContainer}>
                    <Control
                      label={this.props.t('LOG_PESTICIDE.CONCENTRATION')}
                      component={Input}
                      model=".pestControlLog.concentration"
                      disabled={true}
                    />
                    <span>%</span>
                  </div>
                </div>
              )}
              <LogFooter />
            </Form>

            <Popup
              open={this.state.showCustomPesticide}
              closeOnDocumentClick
              onClose={this.closePesticideModal}
              contentStyle={{
                display: 'flex',
                width: '100%',
                minHeight: '100vh',
                padding: '92px 24px 0 24px',
                justifyContent: 'center',
                position: 'absolute',
              }}
              overlayStyle={{
                minHeight: '100vh',
                top: 'auto',
                zIndex: 1,
              }}
            >
              <Form className={styles.formContainer} model="logReducer.forms">
                <div className={styles.modal}>
                  <div className={styles.popupTitle}>
                    <a className={styles.close} onClick={this.closePesticideModal}>
                      <img src={closeButton} alt="" />
                    </a>
                    <h3>{this.props.t('LOG_PESTICIDE.ADD_PESTICIDE')}</h3>
                  </div>
                </div>
                {/*<div className={styles.defaultFormDropDown}>*/}
                {/*<label>Pesticide</label>*/}
                {/*<Control*/}
                {/*model=".pestControlLog.pesticide_id"*/}
                {/*component={DropDown}*/}
                {/*options={pesticideOptions || []}*/}
                {/*placeholder="Choose a target"*/}
                {/*onChange={this.setSelectedPesticide}*/}
                {/*/>*/}
                {/*</div>*/}
                <div className={styles.textContainer}>
                  <Control
                    label={this.props.t('LOG_PESTICIDE.PESTICIDE_NAME_LABEL')}
                    component={Input}
                    model=".pestControlLog.custom_pesticide_name"
                  />
                </div>
                <div className={styles.noteTitle}>
                  {this.props.t('LOG_PESTICIDE.PESTICIDE_INFO_LABEL')}:
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_PESTICIDE.ENTRY_INTERVAL')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".pestControlLog.entry_interval"
                    placeholder="optional"
                  />
                  <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    label={this.props.t('LOG_PESTICIDE.HARVEST_INTERVAL')}
                    component={Input}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".pestControlLog.harvest_interval"
                    placeholder="optional"
                  />
                  <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    label={this.props.t('LOG_PESTICIDE.ACTIVE_INGREDIENTS')}
                    component={Input}
                    model=".pestControlLog.active_ingredients"
                    placeholder="optional"
                  />
                  <span></span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_PESTICIDE.CONCENTRATION')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".pestControlLog.concentration"
                    placeholder="optional"
                  />
                  <span>%</span>
                </div>
                <div className={styles.centerButton}>
                  <div className="btn btn-primary" onClick={() => this.saveCustomPesticide()}>
                    {this.props.t('common:SAVE')}
                  </div>
                </div>
              </Form>
            </Popup>

            {/*disease popup*/}
            <Popup
              open={this.state.showCustomDisease}
              closeOnDocumentClick
              onClose={this.closeDiseaseModal}
              contentStyle={{
                display: 'flex',
                width: '100%',
                minHeight: '100vh',
                padding: '92px 24px 0 24px',
                justifyContent: 'center',
                position: 'absolute',
              }}
              overlayStyle={{
                minHeight: '100vh',
                top: 'auto',
                zIndex: 1,
              }}
            >
              <Form className={styles.formContainer} model="logReducer.forms">
                <div className={styles.modal}>
                  <div className={styles.popupTitle}>
                    <a className={styles.close} onClick={this.closeDiseaseModal}>
                      <img src={closeButton} alt="" />
                    </a>
                    <h3>{this.props.t('LOG_PESTICIDE.ADD_DISEASE')}</h3>
                  </div>
                </div>
                <div className={styles.defaultFormDropDown}>
                  <label>{this.props.t('LOG_PESTICIDE.TARGET_GROUP')}</label>
                  <Control
                    model=".pestControlLog.custom_disease_group"
                    component={DropDown}
                    options={this.state.diseaseGroup.map((d) => ({
                      value: d,
                      label: d,
                    }))}
                    placeholder={this.props.t('LOG_PESTICIDE.ADD_TARGET')}
                  />
                </div>
                <div className={styles.textContainerColumn}>
                  <Control
                    label={this.props.t('LOG_PESTICIDE.COMMON_NAME')}
                    component={Input}
                    model=".pestControlLog.custom_disease_common_name"
                  />
                </div>

                <div className={styles.textContainerColumn}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_PESTICIDE.SCIENTIFIC_NAME')}
                    model=".pestControlLog.custom_disease_scientific_name"
                    placeholder="optional"
                  />
                </div>
                <div className={styles.centerButton}>
                  <div className="btn btn-primary" onClick={() => this.saveCustomDisease()}>
                    {this.props.t('common:SAVE')}
                  </div>
                </div>
              </Form>
            </Popup>
          </>
        }
        {(!crops || !locations || !diseases || !pesticides) && (
          <p>{this.props.t('LOG_PESTICIDE.MISSING_DATA')}</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: locationsWithCurrentAndPlannedFieldCropSelector(state),
    farm: userFarmSelector(state),
    diseases: diseaseSelector(state),
    pesticides: pesticideSelector(state),
    pestControlLog: pestLogSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PestControlLog));
