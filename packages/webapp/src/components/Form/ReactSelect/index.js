import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Label } from '../../Typography';


export const styles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--green100)' : 'white',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    paddingLeft: '10px',
  }),

  indicatorSeparator: () => ({}),

  control: (provided, state) => ({
    display: 'flex',
    border: `2px solid var(--border)`,
    boxSizing: 'border-box',
    borderRadius: '4px',
    height: '48px',
    paddingLeft: '0',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    '&:focus': {
      borderColor: 'var(--inputActive)',
    },
  }),

  menu: (provided, state) => ({
    ...provided,
    marginTop: '4px',
    padding: '4px 0',
    boxShadow: '0px 1px 2px rgba(102, 115, 138, 0.25)',
    borderColor: 'transparent',
  }),

  placeholder: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--iconDefault)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
  }),

  singleValue: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
  }),
}

const ReactSelect = ({
  label,
  placeholder,
  options,
  ...props
}) => {
  return (<>
    {label && <Label>{label}</Label>}
    <Select customStyles styles={styles} placeholder={placeholder} options={options} {...props}/>
  </>);
};

ReactSelect.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  /**
   To use with react-hook-form see page https://react-hook-form.com/api/#Controller and sandbox https://codesandbox.io/s/react-hook-form-controller-079xx?file=/src/index.js:3850-3861
   */
  options: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
}
export default ReactSelect;