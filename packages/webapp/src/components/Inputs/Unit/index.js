import React from 'react';
import {Control, Errors} from 'react-redux-form';
import styles from '../styles.scss';

class Unit extends React.Component {
  render() {
    const { model, title, dropdown, options, type, validate, hideLabel } = this.props;
    let showLabel;
    if(!hideLabel){
      showLabel = true;
    }else{
      showLabel = false;
    }

    return (
        <div className={styles.textContainer}>
          {showLabel && <label>{title}</label>}
          {dropdown && <div className={styles.selectContainer}>
            <Control.input data-test='unit-input' type='number' step="any" model={model} />
            <Control.select data-test='unit-select' model=".unit">
              {options.map((o, index) => {
                return (<option key={'option-' + index} value={o}>{o}</option>)
              })}
            </Control.select>
          </div>}
          {!dropdown && !validate && <div className={styles.inputNunit}><Control.input
              data-test='unit-input'
              type='number'
              step="any"
              model={model}
          />{type}</div>}
          {!dropdown && validate && <div><div className={styles.inputNunit}>
            <Control.input
              data-test='unit-input'
              type='number'
              step="any"
              model={model}
              validators={{required: (val) => val}}
            />{type}</div>
          <Errors
            className='required'
            model={model}
            show={{touched: true, focus: false}}
            messages={{
            required: 'Required',
          }}
          /></div>
          }
        </div>
    )
  }
}

export default Unit;
