import Select, { components } from 'react-select';
import React from 'react';
import vector from '../../../assets/images/vector-down.svg';
import ReactSelect from '../../Form/ReactSelect';

class DropDown extends React.Component {
  render() {
    const {
      className,
      options,
      defaultValue,
      isSearchable,
      placeholder,
      onChange,
      value,
      isMulti,
      styles,
      ...props
    } = this.props;
    const DropdownIndicator = (props) => {
      return (
        <components.DropdownIndicator {...props}>
          <img src={vector} alt="" />
        </components.DropdownIndicator>
      );
    };

    return (
      <ReactSelect
        data-test="dropdown"
        isMulti={isMulti}
        options={options}
        defaultValue={defaultValue}
        isSearchable={isSearchable ? isSearchable : false}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        {...props}
      />
    );
  }
}

export default DropDown;
