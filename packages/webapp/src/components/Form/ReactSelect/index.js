import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';


export const styles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused? 'var(--green100)':'white',
    color: 'var(--fontColor)',
    // borderBottom: '1px dotted pink',
    // color: state.isSelected ? 'red' : 'blue',
    // padding: 20,
  }),
  // control: () => ({
  //   // none of react-select's styles are passed to <Control />
  //   // width: 200,
  // }),
  // singleValue: (provided, state) => {
  //   // const opacity = state.isDisabled ? 0.5 : 1;
  //   // const transition = 'opacity 300ms';
  //   // return { ...provided, opacity, transition };
  // }
}


export const ReactSelect = ({
  ...props
}) => {
  return (
    <Select customStyles styles={styles} {...props}/>
  );
};

ReactSelect.propTypes = {

}
