import Select from 'react-select';
import React from 'react';


class DropDown extends React.Component {
  render() {
    const { className, options, defaultValue, isSearchable, placeholder, onChange, value, isMulti, styles } = this.props;
    return (<Select
      data-test="dropdown"
      isMulti={isMulti}
      className={className}
      options={options}
      defaultValue={defaultValue}
      isSearchable={isSearchable ? isSearchable : false}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      styles={styles}
    />)
  }
}

export default DropDown;
