import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle/v2';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Errors, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import DropDown from '../../../components/Inputs/DropDown';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.module.scss';
import parseFields from '../Utility/parseFields';
import parseCrops from '../Utility/parseCrops';
import { addLog } from '../Utility/actions';
import { convertToMetric, getUnit } from '../../../util';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedFieldCropsSelector } from '../../fieldCropSlice';
import { cropLocationsSelector } from '../../locationSlice';
import { Semibold, Underlined } from '../../../components/Typography';

const parsedTextureOptions = (t) => [
  { label: t('soil:SAND'), value: 'sand' },
  { label: t('soil:LOAMY_SAND'), value: 'loamySand' },
  { label: t('soil:SANDY_LOAM'), value: 'sandyLoam' },
  { label: t('soil:LOAM'), value: 'loam' },
  { label: t('soil:SILT_LOAM'), value: 'siltLoam' },
  { label: t('soil:SILT'), value: 'silt' },
  { label: t('soil:SANDY_CLAYLOAM'), value: 'sandyClayLoam' },
  { label: t('soil:CLAY_LOAM'), value: 'clayLoam' },
  { label: t('soil:SILTY_CLAYLOAM'), value: 'siltyClayLoam' },
  { label: t('soil:SANDY_CLAY'), value: 'sandyClay' },
  { label: t('soil:SILTY_CLAY'), value: 'siltyClay' },
  { label: t('soil:CLAY'), value: 'clay' },
];

const parsedDepthOptions = [
  { label: '0-5cm', value: 5 },
  { label: '0-10cm', value: 10 },
  { label: '0-20cm', value: 20 },
  { label: '21-30cm', value: 30 },
  { label: '30-50cm', value: 50 },
  { label: '51-100cm', value: 100 },
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
    const { showMoreInfo } = this.state;
    this.setState({ showMoreInfo: !showMoreInfo });
  }
  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(logForm) {
    const log = logForm.soilDataLog;
    let cec_unit = this.state.cec_denominator;

    const { dispatch, crops, locations } = this.props;
    let selectedFields = parseFields(log, locations);
    let selectedCrops = parseCrops(log, crops);

    const bulkDensity = convertToMetric(
      convertToMetric(
        parseFloat(log['bulk_density_kg/m3']),
        this.state.bulk_density_numerator,
        'kg',
      ),
      this.state.bulk_density_denominator,
      'm3',
      true,
    );
    let formValue = {
      activity_kind: 'soilData',
      date: this.state.date,
      crops: selectedCrops,
      locations: selectedFields,
      notes: log.notes || '',
      depth_cm: convertToMetric(log.depth_cm.value, this.state.depth_unit, 'cm').toString() || '',
      texture: log.texture.value,
      k: log.k || 0,
      p: log.p || 0,
      n: log.n || 0,
      om: log.om || 0,
      ph: log.ph || 0,
      'bulk_density_kg/m3': bulkDensity || 0,
      organic_carbon: log.organic_carbon || 0,
      inorganic_carbon: log.inorganic_carbon || 0,
      total_carbon: log.total_carbon || 0,
      s: log.s || 0,
      c: log.c || 0,
      ca: log.ca || 0,
      mg: log.mg || 0,
      na: log.na || 0,
      zn: log.zn || 0,
      mn: log.mn || 0,
      fe: log.fe || 0,
      cu: log.cu || 0,
      b: log.b || 0,
      cec: convertToMetric(parseFloat(log.cec), cec_unit, 'kg') || 0,
    };
    dispatch(addLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const locations = this.props.locations;

    const customFieldset = () => {
      return (
        <div>
          <div className={styles.defaultFormDropDown}>
            <label>{this.props.t('LOG_SOIL.DEPTH')}</label>
            <Control
              model=".depth_cm"
              component={DropDown}
              options={parsedDepthOptions || []}
              placeholder={this.props.t('LOG_SOIL.SELECT_DEPTH')}
              validators={{ required: (val) => val && val.label && val.value }}
            />
            <Errors
              className="required"
              model={`.depth_cm`}
              show={{ touched: true, focus: false }}
              messages={{
                required: this.props.t('common:REQUIRED'),
              }}
            />
          </div>
          <div className={styles.defaultFormDropDown}>
            <label>{this.props.t('LOG_SOIL.TEXTURE')}</label>
            <Control
              model=".texture"
              component={DropDown}
              options={parsedTextureOptions(this.props.t) || []}
              placeholder={this.props.t('LOG_SOIL.SELECT_TEXTURE')}
              validators={{ required: (val) => val && val.label && val.value }}
            />
            <Errors
              className="required"
              model={`.texture`}
              show={{ touched: true, focus: false }}
              messages={{
                required: this.props.t('common:REQUIRED'),
              }}
            />
          </div>
          <Unit model=".k" title="K" type="%" />
          <Unit model=".p" title="P" type="%" />
          <Unit model=".n" title="N" type="%" />
          <Unit model=".om" title={this.props.t('LOG_SOIL.OM')} type="%" />
          <Unit model=".ph" title="ph" />
          <Unit
            model=".bulk_density_kg/m3"
            title={this.props.t('LOG_SOIL.BULK_DENSITY')}
            type={`${this.state.bulk_density_numerator}/${this.state.bulk_density_denominator}`}
          />
        </div>
      );
    };

    return (
      <div className="page-container">
        <PageTitle
          onGoBack={() => this.props.history.push('/new_log')}
          onCancel={() => this.props.history.push('/log')}
          style={{ paddingBottom: '24px' }}
          title={this.props.t('LOG_COMMON.ADD_A_LOG')}
        />
        <Semibold style={{ marginBottom: '24px' }}>{this.props.t('LOG_SOIL.TITLE')}</Semibold>
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          label={this.props.t('common:DATE')}
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val)}
        >
          <DefaultLogForm
            model=".soilDataLog"
            locations={locations}
            crops={crops}
            notesField={true}
            customFieldset={customFieldset}
            isCropNotNeeded={true}
          />

          <Underlined style={{ paddingTop: '8px' }} onClick={this.toggleMoreInfo}>
            {this.state.showMoreInfo
              ? this.props.t('LOG_COMMON.HIDE')
              : this.props.t('LOG_COMMON.SHOW')}{' '}
            {this.props.t('LOG_SOIL.MORE_INFO')}
          </Underlined>
          {this.state.showMoreInfo && (
            <div>
              <Unit
                model=".soilDataLog.organic_carbon"
                title={this.props.t('LOG_SOIL.ORGANIC_CARBON')}
                type="%"
              />
              <Unit
                model=".soilDataLog.inorganic_carbon"
                title={this.props.t('LOG_SOIL.INORGANIC_CARBON')}
                type="%"
              />
              <Unit
                model=".soilDataLog.total_carbon"
                title={this.props.t('LOG_SOIL.TOTAL_CARBON')}
                type="%"
              />
              <Unit model=".soilDataLog.s" title="S" type="%" />
              <Unit model=".soilDataLog.c" title="C" type="%" />
              <Unit model=".soilDataLog.ca" title="Ca" type="%" />
              <Unit model=".soilDataLog.mg" title="Mg" type="%" />
              <Unit model=".soilDataLog.na" title="Na" type="%" />
              <Unit model=".soilDataLog.zn" title="Zn" type="%" />
              <Unit model=".soilDataLog.mn" title="Mn" type="%" />
              <Unit model=".soilDataLog.fe" title="Fe" type="%" />
              <Unit model=".soilDataLog.cu" title="Cu" type="%" />
              <Unit model=".soilDataLog.b" title="B" type="%" />
              <Unit
                model=".soilDataLog.cec"
                title="CEC"
                type={'cmolc/' + this.state.cec_denominator}
              />
            </div>
          )}
          <LogFooter />
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: cropLocationsSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(soilDataLog));
