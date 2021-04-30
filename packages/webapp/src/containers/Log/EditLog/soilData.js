import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle/v2';
import { currentLogSelector, logSelector, soilDataLogStateSelector } from '../selectors';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Control, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import DropDown from '../../../components/Inputs/DropDown';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.module.scss';
import parseFields from '../Utility/parseFields';
import parseCrops from '../Utility/parseCrops';
import {
  convertFromMetric,
  convertToMetric,
  getUnit,
  roundToFourDecimal,
  roundToTwoDecimal,
} from '../../../util';
import { deleteLog, editLog } from '../Utility/actions';
import ConfirmModal from '../../../components/Modals/Confirm';
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
  { label: '0-2in', value: 5 },
  { label: '0-10cm', value: 10 },
  { label: '0-4in', value: 10 },
  { label: '0-20cm', value: 20 },
  { label: '0-8in', value: 20 },
  { label: '21-30cm', value: 30 },
  { label: '8-12in', value: 30 },
  { label: '30-50cm', value: 50 },
  { label: '12-20in', value: 50 },
  { label: '50-100cm', value: 100 },
  { label: '20-40in', value: 100 },
];

const lookupValueTable = {
  texture: {},
  depth: {},
};

class soilDataLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreInfo: false,
      date: moment(),
      depth_unit: getUnit(this.props.farm, 'cm', 'in'),
      bulk_density_numerator: getUnit(this.props.farm, 'kg', 'lb'),
      bulk_density_denominator: getUnit(this.props.farm, 'm3', 'ft3'),
      cec_denominator: getUnit(this.props.farm, 'kg', 'lb'),
    };
    this.props.dispatch(actions.reset('logReducer.forms.soilDataLog'));
    this.props.dispatch(actions.reset('logReducer.forms.unit'));
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleMoreInfo = this.toggleMoreInfo.bind(this);
  }

  componentDidMount() {
    // mapping my lookup table on componentdidmount so it doesnt repeatedly do it if i call it outside
    parsedTextureOptions(this.props.t).forEach((currTexture) => {
      lookupValueTable['texture'][currTexture.value] = currTexture.label;
    });
    const filteredDepth = parsedDepthOptions.filter(o => o.label.includes(this.state.depth_unit));
    filteredDepth.forEach((currDepth) => {
      lookupValueTable['depth'][currDepth.value] = currDepth.label;
    });
    this.setState({depthOptions: filteredDepth})

    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date),
    });
    const bulkDensity = roundToFourDecimal(
      convertFromMetric(
        convertFromMetric(
          parseFloat(selectedLog.soilDataLog['bulk_density_kg/m3']),
          this.state.bulk_density_numerator,
          'kg',
        ),
        this.state.bulk_density_denominator,
        'm3',
        true,
      ),
    );

    const depth_cm = selectedLog.soilDataLog.depth_cm;
    const depthCmObj = {
      label: grabLabelFromValue(depth_cm, 'depth'),
      value: depth_cm,
    };

    const texture = selectedLog.soilDataLog.texture;
    const textureObj = {
      label: grabLabelFromValue(texture, 'texture'),
      value: texture,
    };

    const cec = roundToTwoDecimal(
      convertFromMetric(selectedLog.soilDataLog.cec, this.state.cec_denominator, 'kg', true),
    );

    let options = [
      'k',
      'p',
      'n',
      'om',
      'ph',
      'organic_carbon',
      'inorganic_carbon',
      'total_carbon',
      's',
      'c',
      'ca',
      'mg',
      'na',
      'zn',
      'mn',
      'fe',
      'cu',
      'b',
    ];
    options.forEach((o) => {
      dispatch(
        actions.change(
          `logReducer.forms.soilDataLog.${o}`,
          selectedLog.soilDataLog[o] && selectedLog.soilDataLog[o].toString(),
        ),
      );
    });
    dispatch(actions.change('logReducer.forms.soilDataLog.bulk_density_kg/m3', bulkDensity));
    dispatch(actions.change('logReducer.forms.soilDataLog.texture', textureObj));
    dispatch(actions.change('logReducer.forms.soilDataLog.depth_cm', depthCmObj));
    dispatch(actions.change('logReducer.forms.soilDataLog.notes', selectedLog.notes));
    dispatch(actions.change('logReducer.forms.soilDataLog.cec', cec));
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

    const { dispatch, crops, locations, selectedLog } = this.props;
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
      activity_id: selectedLog.activity_id,
      activity_kind: 'soilData',
      date: this.state.date,
      crops: selectedCrops,
      locations: selectedFields,
      notes: log.notes || '',
      depth_cm: log.depth_cm.value.toString(),
      texture: log.texture.value,
      k: log.k || null,
      p: log.p || null,
      n: log.n || null,
      om: log.om || null,
      ph: log.ph || null,
      'bulk_density_kg/m3': bulkDensity || null,
      organic_carbon: log.organic_carbon || null,
      inorganic_carbon: log.inorganic_carbon || null,
      total_carbon: log.total_carbon || null,
      s: log.s || null,
      c: log.c || null,
      ca: log.ca || null,
      mg: log.mg || null,
      na: log.na || null,
      zn: log.zn || null,
      mn: log.mn || null,
      fe: log.fe || null,
      cu: log.cu || null,
      b: log.b || null,
      cec: convertToMetric(log.cec, cec_unit, 'kg') || null,
      user_id: localStorage.getItem('user_id'),
    };
    if (!this.state.showModal) dispatch(editLog(formValue));
  }

  render() {
    const { crops, locations, selectedLog } = this.props;
    const selectedFields = selectedLog.location.map((f) => ({
      value: f.location_id,
      label: f.name,
    }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({
      value: fc.field_crop_id,
      label: this.props.t(`crop:${fc.crop.crop_translation_key}`),
      location_id: fc.location_id,
    }));

    const customFieldset = () => {
      return (
        <div>
          <div className={styles.defaultFormDropDown}>
            <label>{this.props.t('LOG_SOIL.DEPTH')}</label>
            <Control
              model=".depth_cm"
              component={DropDown}
              options={this.state.depthOptions || []}
              placeholder="select depth"
            />
          </div>
          <div className={styles.defaultFormDropDown}>
            <label>{this.props.t('LOG_SOIL.TEXTURE')}</label>
            <Control
              model=".texture"
              component={DropDown}
              options={parsedTextureOptions(this.props.t) || []}
              placeholder="select texture"
            />
          </div>
          <Unit model=".k" title="K" type="%" />
          <Unit model=".p" title="P" type="%" />
          <Unit model=".n" title="N" type="%" />
          <Unit model=".om" title={this.props.t('LOG_SOIL.OM')} type="%" />
          <Unit model=".ph" title="ph" />
          <Unit
            model=".bulk_density_kg/m3"
            title="Bulk Density"
            type={`${this.state.bulk_density_numerator}/${this.state.bulk_density_denominator}`}
            canBeEmpty={true}
          />
        </div>
      );
    };

    return (
      <div className="page-container">
        <PageTitle
          onGoBack={() => this.props.history.push('/log')}
          style={{ paddingBottom: '24px' }}
          title={`${this.props.t('LOG_COMMON.EDIT_A_LOG')}`}
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
            parent="logReducer.forms"
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            model=".soilDataLog"
            locations={locations}
            crops={crops}
            isCropNotNeeded={true}
            notesField={true}
            customFieldset={customFieldset}
          />
          <Underlined style={{ paddingTop: '40px' }} onClick={this.toggleMoreInfo}>
            {this.state.showMoreInfo
              ? this.props.t('LOG_COMMON.HIDE')
              : this.props.t('LOG_COMMON.SHOW')}{' '}
            {this.props.t('LOG_SOIL.MORE_INFO')}
          </Underlined>
          {this.state.showMoreInfo && (
            <div style={{ paddingTop: '24px' }}>
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
          <LogFooter disabled={!this.props.formState.$form.valid} edit={true} onClick={() => this.setState({ showModal: true })} />
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
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: cropLocationsSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
    farm: userFarmSelector(state),
    formState: soilDataLogStateSelector(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const grabLabelFromValue = (value, type) => {
  return lookupValueTable[type][value];
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(soilDataLog));
