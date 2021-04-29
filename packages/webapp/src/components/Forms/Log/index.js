import React from 'react';
import { actions, Control, Errors, Fieldset } from 'react-redux-form';
import DropDown from '../../Inputs/DropDown';
import styles from '../../../containers/Log/styles.module.scss';
import { connect } from 'react-redux';
import moment from 'moment';
import { getFieldCrops, getLocations } from '../../../containers/saga';
import { currentAndPlannedFieldCropsSelector } from '../../../containers/fieldCropSlice';
import { withTranslation } from 'react-i18next';
import { Label } from '../../Typography';
import PureWarningBox from '../../WarningBox';
import Input from '../../Form/Input';

class DefaultLogForm extends React.Component {
  constructor(props) {
    super(props);
    const { selectedFields, selectedCrops, dispatch, parent, model } = this.props;
    dispatch(getFieldCrops());
    dispatch(getLocations());

    let selectedCropsMap = {};
    // this is only called if DefaultLogForm is in an edit form
    if (selectedCrops) {
      selectedCrops.forEach((sc) => {
        if (!selectedCropsMap[sc.location_id]) {
          selectedCropsMap[sc.location_id] = [];
        }
        selectedCropsMap[sc.location_id].push(sc);
      });
    }

    this.state = {
      cropOptionsMap: {},
      selectedCropsMap,
      selectedFields: selectedFields || [],
      cropValue: null,
      crops: [],
      fieldOptions: [],
      fieldOptionsWithoutAll: [],
      displayLiveCropMessage: false,
    };
    this.setCropsOnFieldSelect = this.setCropsOnFieldSelect.bind(this);

    if (selectedFields) {
      this.setCropsOnFieldSelect(selectedFields);
      Object.keys(this.state.selectedCropsMap).forEach((k) => {
        dispatch(actions.change(`${parent}${model}.crop.${k}`, this.state.selectedCropsMap[k]));
      });
    }
  }

  hasSameCrop = (fieldCrop) => {
    const { crops } = this.state;

    for (let c of crops) {
      if (
        c.field_crop_id !== fieldCrop.field_crop_id &&
        c.crop_id === fieldCrop.crop_id &&
        c.location_id === fieldCrop.location_id
      ) {
        return true;
      }
    }
    return false;
  };

  setCropsOnFieldSelect(selectedOptions) {
    const { locations, parent, model } = this.props;
    const { crops } = this.props;
    let cropOptionsMap = JSON.parse(JSON.stringify(this.state.cropOptionsMap));
    let selectedFields;
    const options = selectedOptions || [];

    // remove associated crop selections for field if field is removed from dropdown
    const activeFields = options.map((o) => o.value);
    const removedFields = locations.filter((f) => activeFields.indexOf(f.location_id) === -1).map(f=> f.location_id);
    removedFields &&
      removedFields.map((rm) => {
        return this.props.dispatch(actions.change(`${parent}${model}.crop.${rm}`, null));
      });

    // map field_crops to locations that are selected in dropdown
    if (options.find((o) => o.value === 'all')) {
      selectedFields = this.state.fieldOptionsWithoutAll;
      locations.map((f) => {
        return (cropOptionsMap[f.location_id] = crops
          .filter((c) => c.location_id === f.location_id)
          .map((c) => {
            let hasDup = this.hasSameCrop(c);
            if (hasDup) {
              return {
                value: c.field_crop_id,
                label: `${this.props.t(`crop:${c.crop_translation_key}`)}  (${moment(
                  c.start_date,
                ).format('YYYY-MM-DD')})`,
              };
            } else
              return {
                value: c.field_crop_id,
                label: this.props.t(`crop:${c.crop_translation_key}`),
              };
          }));
      });
    } else {
      options.map((o) => {
        return (cropOptionsMap[o.value] = crops
          .filter((c) => c.location_id === o.value)
          .map((c) => {
            let hasDup = this.hasSameCrop(c);
            if (hasDup) {
              return {
                value: c.field_crop_id,
                label: `${this.props.t(`crop:${c.crop_translation_key}`)}  (${moment(
                  c.start_date,
                ).format('YYYY-MM-DD')})`,
              };
            } else
              return {
                value: c.field_crop_id,
                label: this.props.t(`crop:${c.crop_translation_key}`),
              };
          }));
      });
    }
    this.setState({
      selectedFields: selectedFields || options,
      cropOptionsMap,
      fieldSelected: true,
      cropValue: undefined,
    });
  }

  componentDidMount() {
    const { model, parent } = this.props;
    this.filterLiveCrops();
    // if 'all' is selected in fields dropdown, set field in redux state with all field options instead of option 'all'
    this.props.dispatch(actions.change(`${parent}${model}.field`, this.state.selectedFields));
  }

  filterLiveCrops = () => {
    const crops = this.props.crops;
    const locations = this.props.locations;
    const model = this.props.model;

    let displayLiveCropMessage = false;

    if (model === '.seedLog' || model === '.irrigationLog') {
      if (crops.length < 1) {
        displayLiveCropMessage = true;
      }
    }

    this.setState({
      crops,
      displayLiveCropMessage,
    });
    this.filterFieldOptions(crops, locations, model);
  };

  filterFieldOptions = (crops, locations, model) => {
    let included = [];
    let filteredFields = [];
    if (model === '.seedLog' && model === '.irrigationLog') {
      if (locations && crops) {
        for (let c of crops) {
          if (!included.includes(c.location_id)) {
            included.push(c.location_id);
            filteredFields.push({ value: c.location_id, label: c.name });
          }
        }
      }
    } else {
      if (locations) {
        for (let f of locations) {
          filteredFields.push({ value: f.location_id, label: f.name });
        }
      }
    }

    let fieldOptionsWithoutAll = JSON.parse(JSON.stringify(filteredFields));
    filteredFields.unshift({ value: 'all', label: this.props.t('LOG_COMMON.ALL_LOCATIONS') });

    this.setState({
      fieldOptions: filteredFields,
      fieldOptionsWithoutAll: fieldOptionsWithoutAll,
    });
  };

  render() {
    const {
      model,
      notesField,
      typeField,
      typeOptions,
      customFieldset,
      isCropNotRequired,
      isCropNotNeeded,
    } = this.props;

    // 'plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing'
    const { fieldOptions, displayLiveCropMessage } = this.state;
    const typeLabels = {
      plow: this.props.t('LOG_FIELD_WORK.PLOW'),
      ridgeTill:  this.props.t('LOG_FIELD_WORK.RIDGE_TILL'),
      zoneTill:  this.props.t('LOG_FIELD_WORK.ZONE_TILL'),
      mulchTill:  this.props.t('LOG_FIELD_WORK.MULCH_TILL'),
      ripping: this.props.t('LOG_FIELD_WORK.RIPPING'),
      discing: this.props.t('LOG_FIELD_WORK.DISCING'),
      sprinkler: this.props.t('LOG_IRRIGATION.SPRINKLER'),
      drip: this.props.t('LOG_IRRIGATION.DRIP'),
      subsurface: this.props.t('LOG_IRRIGATION.SUBSURFACE'),
      flood: this.props.t('LOG_IRRIGATION.FLOOD'),
      Harvest: this.props.t('LOG_HARVEST.HARVEST'),
      Pest: this.props.t('LOG_HARVEST.PEST'),
      Disease: this.props.t('LOG_HARVEST.DISEASE'),
      Weed: this.props.t('LOG_HARVEST.WEED'),
      Other: this.props.t('LOG_HARVEST.OTHER')
    };
    // format options for react-select dropdown components
    //const fieldOptions = fields && fields.map((f) => ({ value: f.location_id, label: f.name }));

    let parsedTypeOptions = typeOptions && typeOptions.map((t) => ({ value: t, label: typeLabels[t] }));

    return (
      <Fieldset model={model}>
        {displayLiveCropMessage && (
          // <Alert variant="warning">{this.props.t('LOG_COMMON.WARNING')}</Alert>
          <PureWarningBox style={{ marginBottom: '12px' }}>
            <Label>{this.props.t('LOG_COMMON.WARNING')}</Label>
          </PureWarningBox>
        )}
        <div className={styles.defaultFormDropDown}>
          <label>{this.props.t('LOG_COMMON.LOCATIONS')}</label>
          <Control
            model=".field"
            onChange={this.setCropsOnFieldSelect}
            component={DropDown}
            options={fieldOptions || []}
            placeholder={this.props.t('LOG_COMMON.SELECT_LOCATIONS')}
            isMulti
            isSearchable={false}
            value={this.state.selectedFields}
            validators={{ required: (val) => val && val.length }}
          />
          <Errors
            className="required"
            model=".field"
            show={{ touched: true, focus: false }}
            messages={{
              required: this.props.t('common:REQUIRED'),
            }}
          />
        </div>
        {!isCropNotNeeded &&
          this.state.selectedFields &&
          this.state.selectedFields.map((f, index) => {
            return (
              <div key={'crop-' + index} className={styles.defaultFormDropDown}>
                <label>
                  {this.props.t('LOG_COMMON.CROP')}
                  <label style={{ fontSize: 12, color: '#028577', marginLeft: '4px' }}>
                    {f.label}
                  </label>
                </label>
                <Control
                  model={`.crop.${f.value}`}
                  component={DropDown}
                  options={this.state.cropOptionsMap[f.value]}
                  placeholder={this.props.t('LOG_COMMON.SELECT_CROP')}
                  isMulti
                  isSearchable={false}
                  validators={
                    isCropNotRequired
                      ? {}
                      : {
                          required: (val) => {
                            return val && val.length;
                          },
                        }
                  }
                />
                <Errors
                  className="required"
                  model={`.crop.${f.value}`}
                  show={{ touched: true, focus: false }}
                  messages={{
                    required: this.props.t('common:REQUIRED'),
                  }}
                />
              </div>
            );
          })}
        {typeField && (
          <div className={styles.defaultFormDropDown}>
            <label>{this.props.t('LOG_COMMON.TYPE')}</label>
            <Control
              model=".type"
              component={DropDown}
              options={parsedTypeOptions || []}
              placeholder={this.props.t('LOG_COMMON.SELECT_TYPE')}
              validators={{ required: (val) => val && val.value }}
            />
            <Errors
              className="required"
              model=".type"
              show={{ touched: true, focus: false }}
              messages={{
                required: this.props.t('common:REQUIRED'),
              }}
            />
          </div>
        )}
        {customFieldset && customFieldset()}
        {notesField && (
          <div>
            <div className={styles.noteContainer}>
              <Control model=".notes" component={Input} label={this.props.t('LOG_COMMON.NOTES')} />
            </div>
          </div>
        )}
      </Fieldset>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DefaultLogForm));
