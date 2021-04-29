import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle/v2';

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
import { currentAndPlannedFieldCropsSelector } from '../../fieldCropSlice';
import { cropLocationsSelector } from '../../locationSlice';
import Input, { numberOnKeyDown } from '../../../components/Form/Input';
import { AddLink, Semibold, Underlined } from '../../../components/Typography';

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
    this.props.dispatch(
      actions.change('logReducer.forms.fertLog.n_percentage', fert.n_percentage ?? ''),
    );
    this.props.dispatch(actions.change('logReducer.forms.fertLog.nh4_n_ppm', fert.nh4_n_ppm ?? ''));
    this.props.dispatch(
      actions.change('logReducer.forms.fertLog.k_percentage', fert.k_percentage ?? ''),
    );
    this.props.dispatch(
      actions.change('logReducer.forms.fertLog.p_percentage', fert.p_percentage ?? ''),
    );
    this.props.dispatch(
      actions.change(
        'logReducer.forms.fertLog.moisture_percentage',
        fert.moisture_percentage ?? '',
      ),
    );
  }

  handleSubmit(fertLog) {
    const selectedCrops = parseCrops(fertLog);
    const selectedFields = parseFields(fertLog, this.props.locations);

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
      locations: selectedFields,
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
          fertOptions.push({
            value: f.fertilizer_id,
            label: this.props.t(`fertilizer:${f.fertilizer_translation_key}`),
          });
        }
      }

      fertOptions.sort(this.compareFert);
      customOptions.sort(this.compareFert);

      fertOptions = fertOptions.concat(customOptions);
    }

    return fertOptions;
  };

  render() {
    let locations = this.props.locations;
    let fertilizers = this.props.fertilizers;

    const fertilizerOptions = this.sortFert(fertilizers);

    return (
      <div className="page-container" style={{ styles }}>
        <PageTitle
          onGoBack={() => this.props.history.push('/new_log')}
          onCancel={() => this.props.history.push('/log')}
          style={{ paddingBottom: '24px' }}
          title={this.props.t('LOG_COMMON.ADD_A_LOG')}
        />
        <Semibold style={{ marginBottom: '24px' }}>
          {this.props.t('LOG_FERTILIZING.TITLE')}
        </Semibold>
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          label={this.props.t('common:DATE')}
          classes={{}}
        />
        {
          <>
            <Form
              className={styles.formContainer}
              model="logReducer.forms"
              onSubmit={(val) => this.handleSubmit(val.fertLog)}
            >
              <DefaultLogForm
                model=".fertLog"
                style={styles.labelContainer}
                isCropNotRequired={true}
                locations={locations}
              />
              <div className={styles.defaultFormDropDown}>
                <Control
                  label={this.props.t('LOG_COMMON.PRODUCT')}
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
                <Errors
                  className="required"
                  model={`.fertLog.fert_id`}
                  show={{ touched: true, focus: false }}
                  messages={{
                    required: this.props.t('common:REQUIRED'),
                  }}
                />
              </div>
              {[1, 2, 5].includes(this.props.farm.role_id) && (
                <AddLink
                  style={{ paddingBottom: '20px', transform: 'translateY(-8px)' }}
                  onClick={() => this.openEditModal()}
                >
                  {this.props.t('LOG_COMMON.ADD_CUSTOM_PRODUCT')}
                </AddLink>
              )}
              <Unit
                model=".fertLog.quantity_kg"
                title={this.props.t('LOG_COMMON.QUANTITY')}
                type={this.state.quantity_unit}
                validate
                defaultValue={''}
              />

              <div className={styles.noteContainer}>
                <Control
                  optional
                  label={this.props.t('common:NOTES')}
                  component={Input}
                  model=".fertLog.notes"
                />
              </div>
              <Underlined style={{ paddingTop: '8px' }} onClick={() => this.toggleChemInfo()}>
                {this.state.showChem
                  ? this.props.t('LOG_COMMON.HIDE')
                  : this.props.t('LOG_COMMON.SHOW')}{' '}
                {this.props.t('LOG_COMMON.PRODUCT_CHEMICAL_COMPOSITION')}
              </Underlined>
              {this.state.showChem && (
                <div>
                  <div className={styles.noteTitle}>
                    {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                  </div>
                  <Unit
                    model=".fertLog.n_percentage"
                    disabled={true}
                    title={this.props.t('LOG_COMMON.NITRATE')}
                    type="%"
                  />
                  <Unit
                    model=".fertLog.nh4_n_ppm"
                    disabled={true}
                    title={this.props.t('LOG_COMMON.AMMONIA')}
                    type="ppm"
                  />
                  <Unit
                    model=".fertLog.k_percentage"
                    disabled={true}
                    title={this.props.t('LOG_COMMON.POTASSIUM')}
                    type="%"
                  />
                  <Unit
                    model=".fertLog.p_percentage"
                    disabled={true}
                    title={this.props.t('LOG_COMMON.PHOSPHATE')}
                    type="%"
                  />
                  <Unit
                    model=".fertLog.moisture_percentage"
                    disabled={true}
                    title={this.props.t('LOG_COMMON.WATER')}
                    type="%"
                  />
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
                minHeight: '826px',
                height: '100%',
                padding: '92px 24px 0 24px',
                justifyContent: 'center',
                position: 'absolute',
              }}
              overlayStyle={{
                minHeight: '100%',
                top: 'auto',
                zIndex: 1,
                position: 'absolute',
              }}
            >
              <Form
                className={styles.formContainer}
                model="logReducer.forms"
                onSubmit={(val) => this.handleSubmit(val.fertLog)}
                style={{ maxWidth: '1024px' }}
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
                    placeholder={this.props.t('LOG_FERTILIZING.SELECT_TEMPLATE')}
                    onChange={this.setSelectedFert}
                  />
                </div>
                <div className={styles.textContainer}>
                  <label>{this.props.t('LOG_COMMON.PRODUCT_NAME')}</label>
                  <Control component={Input} model=".fertLog.product" />
                </div>
                <div className={styles.noteTitle}>
                  {this.props.t('LOG_COMMON.CHEMICAL_COMPOSITION')}:
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_COMMON.NITRATE')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".fertLog.n_percentage"
                  />
                  <span className={styles.unitSpan}>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_COMMON.AMMONIA')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".fertLog.nh4_n_ppm"
                  />
                  <span>ppm</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control.input
                    component={Input}
                    label={this.props.t('LOG_COMMON.POTASSIUM')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".fertLog.k_percentage"
                  />
                  <span>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_COMMON.PHOSPHATE')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".fertLog.p_percentage"
                  />
                  <span>%</span>
                </div>
                <div className={styles.chemContainer}>
                  <Control
                    component={Input}
                    label={this.props.t('LOG_COMMON.WATER')}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    step="any"
                    model=".fertLog.moisture_percentage"
                  />
                  <span>%</span>
                </div>
                <div className={styles.centerButton}>
                  <div className="btn btn-primary" onClick={this.saveCustomFert}>
                    {this.props.t('common:SAVE')}
                  </div>
                </div>
              </Form>
            </Popup>
          </>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: cropLocationsSelector(state),
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
