import React from 'react';
import { Control, Errors } from 'react-redux-form';
import styles from '../styles.module.scss';
import Input, { numberOnKeyDown } from '../../Form/Input';
import { withTranslation } from 'react-i18next';

class Unit extends React.Component {
  parseNumber(val) {
    //TODO: Redux form will fail if val is set to -1 and then set to empty string
    if (val) {
      return val;
    } else if (val === 0) {
      return 0;
    } else if (val === '') {
      return '';
    } else {
      return undefined;
    }
  }

  isPositive(val) {
    return val === undefined || val >= 0;
  }

  isTwoDecimalPlaces(val) {
    let decimals;
    if (val) {
      const decimalIndex = val.toString().indexOf('.');
      val = val.toString();
      if (decimalIndex > -1) {
        decimals = val.split('.')[1].length;
      }
    }
    return !decimals || decimals < 3;
  }

  render() {
    const {
      model,
      title,
      dropdown,
      options,
      type,
      validate,
      hideLabel,
      isHarvestAllocation,
      defaultValue,
      disabled,
    } = this.props;
    let showLabel = !hideLabel;

    return (
      <div
        style={isHarvestAllocation ? { fontSize: '14px' } : { fontSize: '18px' }}
        className={styles.textContainer}
      >
        {dropdown && (
          <>
            <div className={styles.selectContainer}>
              <Control
                data-test="unit-input"
                type="number"
                onKeyDown={numberOnKeyDown}
                step="any"
                model={model}
                validators={{ positive: this.isPositive }}
                parser={this.parseNumber}
                component={Input}
                classes={{ container: { flexGrow: 1 } }}
                label={title}
              />
              <Control.select
                data-test="unit-select"
                model=".unit"
                className={styles.select}
                defaultValue={options[0]}
                style={{ color: 'var(--fontColor)', paddingLeft: '4px' }}
              >
                {options.map((o, index) => {
                  return (
                    <option key={'option-' + index} value={o}>
                      {o}
                    </option>
                  );
                })}
              </Control.select>
            </div>
            <Errors
              className="required"
              model={model}
              show={{ touched: true, focus: false }}
              messages={{
                positive: this.props.t('COMMON_ERRORS.UNIT.NON_NEGATIVE'),
              }}
            />
          </>
        )}
        {!dropdown && !validate && (
          <>
            <div className={styles.inputNunit}>
              <Control
                data-test="unit-input"
                type="number"
                onKeyDown={numberOnKeyDown}
                step="any"
                model={model}
                validators={{ positive: this.isPositive }}
                parser={this.parseNumber}
                component={Input}
                classes={{ container: { flexGrow: 1 } }}
                label={title}
                disabled={disabled}
              />
              <div className={styles.typeUnit}>{type}</div>
            </div>

            <Errors
              className="required"
              model={model}
              show={{ touched: true, focus: false }}
              messages={{
                positive: this.props.t('COMMON_ERRORS.UNIT.NON_NEGATIVE'),
              }}
            />
          </>
        )}
        {!dropdown && validate && (
          <>
            <div className={styles.inputNunit}>
              <Control
                data-test="unit-input"
                type="number"
                onKeyDown={numberOnKeyDown}
                step="any"
                model={model}
                defaultValue={defaultValue}
                validators={{
                  required: (val) => val,
                  positive: this.isPositive,
                  twoDecimalPlaces: this.isTwoDecimalPlaces,
                }}
                parser={this.parseNumber}
                component={Input}
                classes={{ container: { flexGrow: 1 } }}
                label={title}
                disabled={disabled}
              />
              <div
                style={isHarvestAllocation ? { color: '#9FAABE' } : {}}
                className={styles.typeUnit}
              >
                {type}
              </div>
            </div>

            <Errors
              className="required"
              model={model}
              show={{ touched: true, focus: false }}
              messages={{
                required: this.props.t('COMMON_ERRORS.UNIT.REQUIRED'),
                positive: this.props.t('COMMON_ERRORS.UNIT.NON_NEGATIVE'),
                twoDecimalPlaces: this.props.t('COMMON_ERRORS.UNIT.TWO_DECIMALS'),
              }}
            />
          </>
        )}
      </div>
    );
  }
}

export default withTranslation()(Unit);
