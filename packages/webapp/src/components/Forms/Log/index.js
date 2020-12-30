import React from 'react';
import { Fieldset, Control, actions, Errors } from 'react-redux-form';
import DropDown from '../../Inputs/DropDown';
import styles from '../../../containers/Log/styles.scss';
import { connect } from 'react-redux';
import moment from 'moment';
import { Alert } from 'react-bootstrap';
import { fieldsSelector } from '../../../containers/fieldSlice';
import { getFieldCrops, getFields } from '../../../containers/saga';
import { currentFieldCropsSelector } from '../../../containers/fieldCropSlice';
import { withTranslation } from 'react-i18next';

class DefaultLogForm extends React.Component {
  constructor(props) {
    super(props);
    const { selectedFields, selectedCrops, dispatch, parent, model } = this.props;
    dispatch(getFieldCrops());
    dispatch(getFields());

    let selectedCropsMap = {};
    // this is only called if DefaultLogForm is in an edit form
    if (selectedCrops) {
      selectedCrops.forEach((sc) => {
        if (!selectedCropsMap[sc.field_id]) {
          selectedCropsMap[sc.field_id] = [];
        }
        selectedCropsMap[sc.field_id].push(sc);
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
        c.field_id === fieldCrop.field_id
      ) {
        return true;
      }
    }
    return false;
  };

  setCropsOnFieldSelect(option) {
    const { fields, parent, model } = this.props;
    const { crops } = this.state;
    let cropOptionsMap = this.state.cropOptionsMap;
    let selectedFields;

    // remove associated crop selections for field if field is removed from dropdown
    const activeFields = option.map((o) => o.value);
    const removedFields = fields.filter((f) => activeFields.indexOf(f.field_id) === -1);
    removedFields &&
      removedFields.map((rm) => {
        return this.props.dispatch(actions.reset(`${parent}${model}.crop.${rm.field_id}`));
      });

    // map field_crops to fields that are selected in dropdown
    if (option.find((o) => o.value === 'all')) {
      selectedFields = this.state.fieldOptionsWithoutAll;
      fields.map((f) => {
        return (cropOptionsMap[f.field_id] = crops
          .filter((c) => c.field_id === f.field_id)
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
      option.map((o) => {
        return (cropOptionsMap[o.value] = crops
          .filter((c) => c.field_id === o.value)
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
      selectedFields: selectedFields || option,
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
    const fields = this.props.fields;
    const model = this.props.model;
    let filtered = [];

    for (let crop of crops) {
      if (moment().isBefore(moment(crop.end_date))) {
        filtered.push(crop);
      }
    }

    let displayLiveCropMessage = false;

    if (model === '.seedLog' || model === '.irrigationLog') {
      if (filtered.length < 1) {
        displayLiveCropMessage = true;
      }
    }

    this.setState({
      crops: filtered,
      displayLiveCropMessage,
    });
    this.filterFieldOptions(filtered, fields, model);
  };

  filterFieldOptions = (crops, fields, model) => {
    let included = [];
    let filteredFields = [];

    if (model === '.seedLog' && model === '.irrigationLog') {
      if (fields && crops) {
        for (let c of crops) {
          if (!included.includes(c.field_id)) {
            included.push(c.field_id);
            filteredFields.push({ value: c.field_id, label: c.field_name });
          }
        }
      }
    } else {
      if (fields) {
        for (let f of fields) {
          filteredFields.push({ value: f.field_id, label: f.field_name });
        }
      }
    }

    let fieldOptionsWithoutAll = JSON.parse(JSON.stringify(filteredFields));
    filteredFields.unshift({ value: 'all', label: 'All Fields' });

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
    const tillageTypeLabels = {
      plow: 'Plow',
      ridgeTill: 'Ridge Till',
      zoneTill: 'Zone Till',
      mulchTill: 'Mulch Till',
      ripping: 'Ripping',
      discing: 'Discing',
    };
    // format options for react-select dropdown components
    //const fieldOptions = fields && fields.map((f) => ({ value: f.field_id, label: f.field_name }));

    let parsedTypeOptions;
    if (typeOptions && typeOptions.includes('ridgeTill')) {
      parsedTypeOptions =
        typeOptions && typeOptions.map((t) => ({ value: t, label: tillageTypeLabels[t] }));
    } else parsedTypeOptions = typeOptions && typeOptions.map((t) => ({ value: t, label: t }));

    return (
      <Fieldset model={model}>
        {displayLiveCropMessage && (
          <Alert variant="warning">
            To use this type of log please add crops to fields. You can do this by navigating to
            Fields -> Your field -> New Field Crop
          </Alert>
        )}
        <div className={styles.defaultFormDropDown}>
          <label>Field</label>
          <Control
            model=".field"
            onChange={this.setCropsOnFieldSelect}
            component={DropDown}
            options={fieldOptions || []}
            placeholder="Select Field"
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
              required: 'Required',
            }}
          />
        </div>
        {!isCropNotNeeded &&
          this.state.selectedFields &&
          this.state.selectedFields.map((f, index) => {
            return (
              <div key={'crop-' + index} className={styles.defaultFormDropDown}>
                <label>
                  Crop
                  <label style={{ fontSize: 12, color: '#028577' }}>{f.label}</label>
                </label>
                <Control
                  model={`.crop.${f.value}`}
                  component={DropDown}
                  options={this.state.cropOptionsMap[f.value]}
                  placeholder="Select Field Crop"
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
                    required: 'Required',
                  }}
                />
              </div>
            );
          })}
        {typeField && (
          <div className={styles.defaultFormDropDown}>
            <label>Type</label>
            <Control
              model=".type"
              component={DropDown}
              options={parsedTypeOptions || []}
              placeholder="Select Type"
              validators={{ required: (val) => val && val.value }}
            />
            <Errors
              className="required"
              model=".type"
              show={{ touched: true, focus: false }}
              messages={{
                required: 'Required',
              }}
            />
          </div>
        )}
        {customFieldset && customFieldset()}
        {notesField && (
          <div>
            <div className={styles.noteTitle}>Notes</div>
            <div className={styles.noteContainer}>
              <Control.textarea model=".notes" />
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
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DefaultLogForm));
