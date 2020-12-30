import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { cropSelector, fieldSelector } from '../../selector';
import { fertSelector, fertTypeSelector } from './selectors';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import DropDown from '../../../components/Inputs/DropDown';
import { actions, Control, Errors, Form } from 'react-redux-form';
import { addFertilizer, addFertilizerLog, getFertilizers } from './actions';
import Popup from 'reactjs-popup';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import closeButton from '../../../assets/images/grey_close_button.png';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import { convertToMetric, getUnit } from '../../../util';
import Unit from '../../../components/Inputs/Unit';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';

class FertilizingLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.fertLog'));
    this.state = {
      date: moment(),
      showChem: false,
      showCustomProduct: false,
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
    };

    this.setDate = this.setDate.bind(this);
    this.setSelectedFert = this.setSelectedFert.bind(this);
    this.toggleChemInfo = this.toggleChemInfo.bind(this);
    this.openEditModal = this.openEditModal.bind(this);
    this.saveCustomFert = this.saveCustomFert.bind(this);
  }

  openEditModal = () => {
    this.setState({ showCustomProduct: true });
  };
  closeEditModal = () => {
    this.setState({ showCustomProduct: false });
  };

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  componentDidMount() {
    this.props.dispatch(getFertilizers());
  }

  toggleChemInfo() {
    this.setState({
      showChem: !this.state.showChem,
    });
  }

  // change the chem values on fert select
  setSelectedFert(option) {
    let fert_id = parseInt(option.value, 10);
    let fert = null;

    for (let fertilizer of this.props.fertilizers) {
      if (fertilizer.fertilizer_id === fert_id) {
        fert = fertilizer;
      }
    }
    if (fert === null) {
      alert('failed to retrieve fertilizer values.');
      return;
    }
    this.props.dispatch(
      actions.change('logReducer.forms.fertLog.fert_id', {
        value: fert_id,
        label: this.props.t(`fertilizer:${fert.fertilizer_type}`),
      }),
    );
    this.props.dispatch(actions.change('logReducer.forms.fertLog.n_percentage', fert.n_percentage));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', fert.nh4_n_ppm));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.k_percentage', fert.k_percentage));
    this.props.dispatch(actions.change('logReducer.forms.fertLog.p_percentage', fert.p_percentage));
    this.props.dispatch(
      actions.change('logReducer.forms.fertLog.moisture_percentage', fert.moisture_percentage),
    );
  }

  handleSubmit(fertLog) {
    const selectedCrops = parseCrops(fertLog);
    const selectedFields = parseFields(fertLog, this.props.fields);

    let fertConfig = {
      activity_kind: 'fertilizing',
      date: this.state.date,
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
    this.props.dispatch(addFertilizerLog(fertConfig));
  }

  saveCustomFert() {
    let fertLog = this.props.fertLog;
    if (!fertLog.product || fertLog.product === '') {
      alert('Missing product name');
      return;
    }
    let fertConfig = {
      moisture_percentage:
        fertLog.moisture_percentage === (null || '') ? 0 : fertLog.moisture_percentage,
      n_percentage: fertLog.n_percentage === (null || '') ? 0 : fertLog.n_percentage,
      p_percentage: fertLog.p_percentage === (null || '') ? 0 : fertLog.p_percentage,
      nh4_n_ppm: fertLog.nh4_n_ppm === (null || '') ? 0 : fertLog.nh4_n_ppm,
      k_percentage: fertLog.k_percentage === (null || '') ? 0 : fertLog.k_percentage,
      fertilizer_type: fertLog.product,
    };

    this.props.dispatch(addFertilizer(fertConfig));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.fert_id'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.product'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.n_percentage'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.nh4_n_ppm'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.k_percentage'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.p_percentage'));
    this.props.dispatch(actions.reset('logReducer.forms.fertLog.moisture_percentage'));
    this.closeEditModal();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.fertilizers !== prevProps.fertilizers) {
      let productName = 'CUSTOM - ' + this.props.fertLog.product;
      for (let fert of this.props.fertilizers) {
        if (productName === fert.fertilizer_type) {
          this.props.dispatch(
            actions.change('logReducer.forms.fertLog.fert_id', fert.fertilizer_id),
          );
          this.props.dispatch(
            actions.change('logReducer.forms.fertLog.n_percentage', fert.n_percentage),
          );
          this.props.dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', fert.nh4_n_ppm));
          this.props.dispatch(
            actions.change('logReducer.forms.fertLog.k_percentage', fert.k_percentage),
          );
          this.props.dispatch(
            actions.change('logReducer.forms.fertLog.p_percentage', fert.p_percentage),
          );
          this.props.dispatch(
            actions.change(
              'logReducer.forms.fertLog.moisture_percentage',
              fert.moisture_percentage,
            ),
          );
        }
      }
    }

    const { fertilizers } = this.props;
    if (fertilizers && prevProps.fertilizers && fertilizers.length > prevProps.fertilizers.length) {
      const fertilizer = fertilizers[fertilizers.length - 1];
      this.setSelectedFert({ value: fertilizer.fertilizer_id });
    }
  }

  compareFert = (a, b) => {
    if (a.label.toLowerCase() < b.label.toLowerCase()) {
      return -1;
    }
    if (a.label.toLowerCase() > b.label.toLowerCase()) {
      return 1;
    }
    return 0;
  };

  sortFert = (fert) => {
    let fertOptions = [];
    let customOptions = [];
    if (fert) {
      for (let f of fert) {
        if (f.fertilizer_type.startsWith('CUSTOM')) {
          customOptions.push({
            value: f.fertilizer_id,
            label: f.fertilizer_type,
          });
        } else {
          fertOptions.push({ value: f.fertilizer_id, label: this.props.t(`fertilizer:${f.fertilizer_type}`) });
        }
      }

      fertOptions.sort(this.compareFert);
      customOptions.sort(this.compareFert);

      fertOptions = fertOptions.concat(customOptions);
    }

    return fertOptions;
  };

  render() {
    let fields = this.props.fields;
    let fertilizers = this.props.fertilizers;

    const fertilizerOptions = this.sortFert(fertilizers);

    return (
      <div className="page-container" style={{ styles }}>
        <PageTitle backUrl="/new_log" title={this.props.t('LOG_FERTILIZING.TITLE')} />
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
              onSubmit={(val) => this.handleSubmit(val.fertLog)}
            >
              <DefaultLogForm
                model=".fertLog"
                style={styles.labelContainer}
                isCropNotRequired={true}
              />
              <div className={styles.defaultFormDropDown}>
                <label>{this.props.t('LOG_COMMON.PRODUCT')}</label>
                <Control
                  model=".fertLog.fert_id"
                  component={DropDown}
                  options={fertilizerOptions || []}
                  placeholder={this.props.t('LOG_COMMON.SELECT_PRODUCT')}
                  onChange={this.setSelectedFert}
                  validators={{
                    required: (val) => {
                      return val && val.label && val.value;
                    },
                  }}
                />
              </div>
              <Errors
                className="required"
                model={`.fertLog.fert_id`}
                show={{ touched: true, focus: false }}
                messages={{
                  required: 'Required',
                }}
              />
              <div>
                <div className={styles.greenTextButton} onClick={() => this.openEditModal()}>
                  {' '}
                  + {this.props.t('LOG_COMMON.ADD_CUSTOM_PRODUCT')}
                </div>
              </div>
              <Unit
                model=".fertLog.quantity_kg"
                title={this.props.t('LOG_COMMON.QUANTITY')}
                type={this.state.quantity_unit}
                validate
              />
              <div className={styles.noteTitle}>{this.props.t('common:NOTES')}</div>
              <div className={styles.noteContainer}>
                <Control.textarea model=".fertLog.notes" />
              </div>
              <div className={styles.greenTextButton} onClick={() => this.toggleChemInfo()}>
                {this.state.showChem ? 'Hide' : 'Show'}{' '}
                {this.props.t('LOG_COMMON.PRODUCT_CHEMICAL_COMPOSITION')}
              </div>
              {this.state.showChem && (
                <div>
                  <div className={styles.noteTitle}>
                    {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_COMMON.NITRATE')}</label>
                    <Control.text model=".fertLog.n_percentage" disabled={true} />
                    <span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_COMMON.AMMONIA')}</label>
                    <Control.text model=".fertLog.nh4_n_ppm" disabled={true} />
                    <span>ppm</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_COMMON.POTASSIUM')}</label>
                    <Control.text model=".fertLog.k_percentage" disabled={true} />
                    <span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_COMMON.PHOSPHATE')}</label>
                    <Control.text model=".fertLog.p_percentage" disabled={true} />
                    <span>%</span>
                  </div>
                  <div className={styles.chemContainer}>
                    <label>{this.props.t('LOG_COMMON.WATER')}</label>
                    <Control.text model=".fertLog.moisture_percentage" disabled={true} />
                    <span>%</span>
                  </div>
                </div>
              )}
              <LogFooter />
            </Form>

            <Popup
              open={this.state.showCustomProduct}
              closeOnDocumentClick
              onClose={this.closeEditModal}
              contentStyle={{
                display: 'flex',
                width: '100%',
                height: '100vh',
                padding: '0 5%',
              }}
              overlayStyle={{ zIndex: '1060', height: '100vh' }}
            >
              <Form
                className={styles.formContainer}
                model="logReducer.forms"
                onSubmit={(val) => this.handleSubmit(val.fertLog)}
              >
                <div className={styles.modal}>
                  <div className={styles.popupTitle}>
                    <a className={styles.close} onClick={this.closeEditModal}>
                      <img src={closeButton} alt="" />
                    </a>
                    <h3>{this.props.t('LOG_FERTILIZING.ADD_FERTILIZER')}</h3>
                  </div>
                </div>
                <div className={styles.defaultFormDropDown}>
                  <label>{this.props.t('LOG_COMMON.DEFAULT_PRODUCT')}</label>
                  <Control
                    model=".fertLog.fert_id"
                    component={DropDown}
                    options={fertilizerOptions || []}
                    placeholder="select product template"
                    onChange={this.setSelectedFert}
                  />
                </div>
                <div className={styles.textContainer}>
                  <label>{this.props.t('LOG_COMMON.PRODUCT_NAME')}</label>
                  <Control.text model=".fertLog.product" />
                </div>
                <div className={styles.noteTitle}>
                  {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_COMMON.NITRATE')}</label>
                  <Control.input type="number" step="any" model=".fertLog.n_percentage" />
                  <span className={styles.unitSpan}>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_COMMON.AMMONIA')}</label>
                  <Control.input type="number" step="any" model=".fertLog.nh4_n_ppm" />
                  <span>ppm</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_COMMON.POTASSIUM')}</label>
                  <Control.input type="number" step="any" model=".fertLog.k_percentage" />
                  <span>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_COMMON.PHOSPHATE')}</label>
                  <Control.input type="number" step="any" model=".fertLog.p_percentage" />
                  <span>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <label>{this.props.t('LOG_COMMON.WATER')}</label>
                  <Control.input type="number" step="any" model=".fertLog.moisture_percentage" />
                  <span>%</span>
                </div>
                <div className={styles.centerButton}>
                  <div className="btn btn-primary" onClick={this.saveCustomFert}>
                    {this.props.t('common:SAVE')}
                  </div>
                </div>
              </Form>
            </Popup>
          </div>
        }
        {(!fields || !fertilizers) && <p>{this.props.t('LOG_COMMON.ERROR_MISSING_FIELDS')}</p>}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    farm: userFarmSelector(state),
    fertilizers: fertSelector(state),
    fertLog: fertTypeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FertilizingLog));
