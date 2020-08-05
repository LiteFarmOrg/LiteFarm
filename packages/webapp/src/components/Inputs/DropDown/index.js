import Select, {components} from 'react-select';
import React from 'react';
import vector from '../../../assets/images/vector-down.svg';

class DropDown extends React.Component {
  render() {
    const { className, options, defaultValue, isSearchable, placeholder, onChange, value, isMulti, styles } = this.props;
    const DropdownIndicator = (
        props: ElementConfig<typeof components.DropdownIndicator>
    ) => {
      return (
          <components.DropdownIndicator {...props}>
      <img src={vector} alt=""/>
      </components.DropdownIndicator>
    );
    };

    return (<Select
    components={{DropdownIndicator}}
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
