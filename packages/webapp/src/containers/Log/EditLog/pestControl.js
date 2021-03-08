import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';

import { diseaseSelector, pesticideSelector, pestLogSelector } from '../PestControlLog/selectors';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import { actions, Control, Form } from 'react-redux-form';
import {
  addDiseases,
  addPesticide,
  editPestControlLog,
  getDiseases,
  getPesticides,
} from '../PestControlLog/actions';
import Popup from 'reactjs-popup';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import closeButton from '../../../assets/images/grey_close_button.png';
import DropDown from '../../../components/Inputs/DropDown';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { currentLogSelector, logSelector } from '../selectors';
import { convertFromMetric, convertToMetric, getUnit, roundToFourDecimal } from '../../../util';
import { deleteLog } from '../Utility/actions';
import ConfirmModal from '../../../components/Modals/Confirm';
import Select from 'react-select';
import Unit from '../../../components/Inputs/Unit';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { numberOnKeyDown } from '../../../components/Form/Input';
import TextArea from '../../../components/Form/TextArea';

class PestControlLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      showChem: false,
      showCustomDisease: false,
      showCustomPesticide: false,
      diseaseGroup: [
        'Other',
        'Fungus',
        'Insect',
        'Bacteria',
        'Virus',
        'Deficiency',
        'Mite',
        'Weed',
      ],
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
      original_disease: null,
    };
    this.props.dispatch(actions.reset('logReducer.forms.pestControlLog'));

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
    const { selectedLog, dispatch, pesticides, diseases } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    dispatch(getPesticides());
    dispatch(getDiseases());

    const type = this.state.controlType
      .filter((t) => t === selectedLog.pestControlLog.type)
      .map((type) => {
        let typeName = type.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
        let regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        return { value: type, label: regularName };
      });
    const pesticide = pesticides.filter(
      (p) => p.pesticide_id === selectedLog.pestControlLog.pesticide_id,
    );
    const disease = diseases.filter(
      (d) => d.disease_id === selectedLog.pestControlLog.target_disease_id,
    );
    // dispatch(actions.change('logReducer.forms.pestControlLog.entry_interval', pesticide.entry_interval));
    // dispatch(actions.change('logReducer.forms.pestControlLog.harvest_interval', pesticide.harvest_interval));
    // dispatch(actions.change('logReducer.forms.pestControlLog.active_ingredients', pesticide.active_ingredients));
    // dispatch(actions.change('logReducer.forms.pestControlLog.concentration', pesticide.concentration));
    dispatch(actions.change('logReducer.forms.pestControlLog.notes', selectedLog.notes));
    dispatch(
      actions.change(
        'logReducer.forms.pestControlLog.quantity_kg',
        roundToFourDecimal(
          convertFromMetric(
            parseFloat(selectedLog.pestControlLog.quantity_kg),
            this.state.quantity_unit,
            'kg',
          ),
        ).toString(),
      ),
    );
    dispatch(actions.change('logReducer.forms.pestControlLog.disease_id', disease[0].disease_id));
    dispatch(
      actions.change('logReducer.forms.pestControlLog.pesticide_id', {
        value: pesticide[0].pesticide_id,
        label: pesticide[0].pesticide_name,
      }),
    );
    this.setSelectedPesticide({
      value: pesticide[0].pesticide_id,
      label: pesticide[0].pesticide_name,
    });
    dispatch(actions.change('logReducer.forms.pestControlLog.type', type));
    this.setState({
      original_disease: {
        value: disease[0].disease_id,
        label: this.props.t(`disease:name.${disease[0].disease_name_translation_key}`),
      },
    });
  }

  toggleChemInfo() {
    this.setState({
      showChem: !this.state.showChem,
    });
  }

  // change the chem values on fert select
  setSelectedPesticide(option) {
    if (option.value) {
      let pesticide_id = parseInt(option.value, 10);
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
    const selectedFields = parseFields(pestControlLog, this.props.fields);
    const { selectedLog } = this.props;

    let pcConfig = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'pestControl',
      date: this.state.date,
      notes: pestControlLog.notes,
      quantity_kg: convertToMetric(
        parseFloat(pestControlLog.quantity_kg),
        this.state.quantity_unit,
        'kg',
      ),
      fields: selectedFields,
      crops: selectedCrops,
      target_disease_id: Number(parseInt(pestControlLog.disease_id, 10)),
      pesticide_id: Number(parseInt(pestControlLog.pesticide_id.value, 10)),
      type: pestControlLog.type.value,
    };
    this.props.dispatch(editPestControlLog(pcConfig));
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
      disease_group: pestControlLog.custom_disease_group,
    };

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
      entry_interval: parseFloat(pestControlLog.entry_interval),
      harvest_interval: parseFloat(pestControlLog.entry_interval),
      active_ingredients: pestControlLog.active_ingredients,
      concentration: pestControlLog.concentration,
    };

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
              value: pesticide.pesticide_id,
              label: pesticide.pesticide_name,
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
    this.setState({
      original_disease: selectedOption,
    });
    this.props.dispatch(
      actions.change('logReducer.forms.pestControlLog.disease_id', selectedOption.value),
    );
  };

  render() {
    const { crops, fields, diseases, pesticides, selectedLog } = this.props;
    const { original_disease } = this.state;

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
    const selectedFields = selectedLog.field.map((f) => ({
      value: f.field_id,
      label: f.field_name,
    }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({
      value: fc.field_crop_id,
      label: this.props.t(`crop:${fc.crop.crop_translation_key}`),
      field_id: fc.field_id,
    }));

    return (
      <div className="page-container" style={{ styles }}>
        <PageTitle
          backUrl="/log"
          title={`${this.props.t('common:EDIT')} ${this.props.t('LOG_PESTICIDE.TITLE')}`}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('LOG_COMMON.CHOOSE_DATE')}
        />
        {
          <div>
            <Form
              className={styles.formContainer}
              model="logReducer.forms"
              onSubmit={(val) => this.handleSubmit(val.pestControlLog)}
            >
              <DefaultLogForm
                parent="logReducer.forms"
                selectedCrops={selectedCrops}
                selectedFields={selectedFields}
                model={'.pestControlLog'}
                style={styles.labelContainer}
                fields={fields}
                crops={crops}
                isCropNotRequired={true}
              />
              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_PESTICIDE.PESTICIDE_LABEL')}</label>
                <Control
                  model=".pestControlLog.pesticide_id"
                  component={DropDown}
                  options={pesticideOptions || []}
                  placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_TARGET_PLACEHOLDER')}
                  onChange={this.setSelectedPesticide}
                />
              </div>
              <div>
                <div className={styles.greenTextButton} onClick={() => this.openPesticideModal()}>
                  {' '}
                  + {this.props.t('LOG_PESTICIDE.ADD_CUSTOM_PESTICIDE')}{' '}
                </div>
              </div>
              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_PESTICIDE.TYPE')}</label>
                <Control
                  model=".pestControlLog.type"
                  component={DropDown}
                  options={typeOptions || []}
                  placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_TYPE_PLACEHOLDER')}
                />
              </div>
              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_PESTICIDE.DISEASE_TARGET')}</label>
                <Select
                  isSearchable={true}
                  value={original_disease}
                  options={diseaseOptions}
                  className="basic-single"
                  classNamePrefix="select"
                  onChange={(selectedOption) => this.handleTargetSelect(selectedOption)}
                />
              </div>
              <div>
                <div className={styles.greenTextButton} onClick={() => this.openDiseaseModal()}>
                  {' '}
                  + {this.props.t('LOG_PESTICIDE.ADD_CUSTOM_DISEASE')}
                </div>
              </div>

              <Unit
                model=".pestControlLog.quantity_kg"
                title={this.props.t('LOG_COMMON.QUANTITY')}
                type={this.state.quantity_unit}
                validate
              />

              <div className={styles.noteTitle}>{this.props.t('common:NOTES')}</div>
              <div className={styles.noteContainer}>
                <Control component={TextArea} model=".pestControlLog.notes" />
              </div>
              <div className={styles.greenTextButton} onClick={() => this.toggleChemInfo()}>
                {this.state.showChem
                  ? this.props.t('LOG_COMMON.HIDE')
                  : this.props.t('LOG_COMMON.SHOW')}{' '}
                {this.props.t('LOG_PESTICIDE.PESTICIDE_LABEL')}{' '}
                {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}
              </div>
              {this.state.showChem && (
                <div>
                  <div className={styles.noteTitle}>
                    {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_PESTICIDE.ENTRY_INTERVAL')}</label>
                    <Control.text model=".pestControlLog.entry_interval" disabled={true} />
                    <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_PESTICIDE.HARVEST_INTERVAL')}</label>
                    <Control.text model=".pestControlLog.harvest_interval" disabled={true} />
                    <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_PESTICIDE.ACTIVE_INGREDIENTS')}</label>
                    <Control.text model=".pestControlLog.active_ingredients" disabled={true} />
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_PESTICIDE.CONCENTRATION')}</label>
                    <Control.text model=".pestControlLog.concentration" disabled={true} />
                    <span>%</span>
                  </div>
                </div>
              )}
              <LogFooter edit={true} onClick={() => this.setState({ showModal: true })} />
            </Form>
            <ConfirmModal
              open={this.state.showModal}
              onClose={() => this.setState({ showModal: false })}
              onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
              message={this.props.t('LOG_COMMON.DELETE_CONFIRMATION')}
            />

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
                <div className={styles.defaultFormDropDown}>
                  <label>{this.props.t('LOG_PESTICIDE.PESTICIDE_LABEL')}</label>
                  <Control
                    model=".pestControlLog.pesticide_id"
                    component={DropDown}
                    options={pesticideOptions || []}
                    placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_TARGET_PLACEHOLDER')}
                    onChange={this.setSelectedPesticide}
                  />
                </div>
                <div className={styles.textContainer}>
                  <label>{this.props.t('LOG_PESTICIDE.PESTICIDE_NAME_LABEL')}</label>
                  <Control.text model=".pestControlLog.custom_pesticide_name" />
                </div>
                <div className={styles.noteTitle}>
                  {this.props.t('LOG_PESTICIDE.PESTICIDE_INFO_LABEL')}:
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_PESTICIDE.ENTRY_INTERVAL')}</label>
                  <Control.input
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".pestControlLog.entry_interval"
                    placeholder="optional"
                  />
                  <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_PESTICIDE.HARVEST_INTERVAL')}</label>
                  <Control.input
                    type="number"
                    step="any"
                    model=".pestControlLog.harvest_interval"
                    placeholder="optional"
                    onKeyDown={numberOnKeyDown}
                  />
                  <span>{this.props.t('LOG_PESTICIDE.DAYS')}</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_PESTICIDE.ACTIVE_INGREDIENTS')}</label>
                  <Control.text model=".pestControlLog.active_ingredients" placeholder="optional" />
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_PESTICIDE.CONCENTRATION')}</label>
                  <Control.input
                    type="number"
                    step="any"
                    model=".pestControlLog.concentration"
                    placeholder="optional"
                    onKeyDown={numberOnKeyDown}
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
                  <label>{this.props.t('LOG_PESTICIDE.DISEASE_GROUP')}</label>
                  <Control
                    model=".pestControlLog.custom_disease_group"
                    component={DropDown}
                    options={this.state.diseaseGroup.map((d) => ({
                      value: d,
                      label: this.props.t(`disease:group.${d.toUpperCase()}`),
                    }))}
                    placeholder={this.props.t('LOG_PESTICIDE.CHOOSE_GROUP_PLACEHOLDER')}
                  />
                </div>
                <div className={styles.textContainerColumn}>
                  <label>{this.props.t('LOG_PESTICIDE.COMMON_NAME')}</label>
                  <Control.text model=".pestControlLog.custom_disease_common_name" />
                </div>

                <div className={styles.textContainerColumn}>
                  <label>{this.props.t('LOG_PESTICIDE.SCIENTIFIC_NAME')}:</label>
                  <Control.text
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
          </div>
        }
        {(!crops || !fields || !diseases || !pesticides) && (
          <p>{this.props.t('LOG_PESTICIDE.MISSING_DATA')}</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
    farm: userFarmSelector(state),
    diseases: diseaseSelector(state),
    pesticides: pesticideSelector(state),
    pestControlLog: pestLogSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PestControlLog));
