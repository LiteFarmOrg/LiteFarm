import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Label, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../assets/theme';
import Infoi from '../../Tooltip/Infoi';

export const styles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'var(--green100)',
    },
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    paddingLeft: '10px',
  }),
  groupHeading: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    paddingLeft: '10px',
    '&:hover': {
      backgroundColor: 'var(--green100)',
    },
    textTransform: 'capitalize',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
  }),

  indicatorSeparator: () => ({}),

  control: (provided, state) => ({
    display: 'flex',
    border: `1px solid var(--grey400)`,
    boxShadow: 'none',
    boxSizing: 'border-box',
    borderRadius: '4px',
    minHeight: '48px',
    paddingLeft: '0',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    borderColor: state.isFocused ? 'var(--inputActive)' : 'var(--grey400)',
    '&:hover': {
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

  multiValueLabel: (provided, state) => ({
    ...provided,
    fontSize: '12px',
    lineHeight: '16px',
  }),
  multiValue: (provided, state) => ({
    ...provided,
    height: '24px',
    margin: '4px',
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: '8px',
    maxHeight: '144px',
    overflowY: 'scroll',
    '::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    alignItems: 'flex-start',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    paddingTop: '14px',
  }),
  clearIndicator: () => ({}),
};

const ReactSelect = React.forwardRef(
  (
    { label, optional, placeholder, options, toolTipContent, icon, style, autoOpen, components, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    return (
      <div style={style}>
        {(label || toolTipContent || icon) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              height: '20px',
            }}
          >
            <Label>{label}
            {
              optional && (
                <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                  {t('common:OPTIONAL')}
                </Label>
              )
            }
            </Label>
            {toolTipContent && <Infoi content={toolTipContent} autoOpen={autoOpen} />}
            {icon && <span className={styles.icon}>{icon}</span>}
          </div>
        )}{' '}
        <Select
          customStyles
          styles={{ ...styles, container: (provided, state) => ({ ...provided }) }}
          placeholder={placeholder}
          options={options}
          components={{
            ClearIndicator: ({ innerProps }) => (
              <Underlined
                {...innerProps}
                style={{ position: 'absolute', right: 0, bottom: '-20px', color: colors.brown700 }}
              >
                {t('REACT_SELECT.CLEAR_ALL')}
              </Underlined>
            ),
            ...components,
          }}
          isSearchable={options?.length > 8}
          inputRef={ref}
          {...props}
        />
      </div>
    );
  },
);

ReactSelect.propTypes = {
  label: PropTypes.string,
  toolTipContent: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  placeholder: PropTypes.string,
  autoOpen: PropTypes.bool,
  style: PropTypes.objectOf(PropTypes.string),
  /**
   To use with react-hook-form see page https://react-hook-form.com/api/#Controller and sandbox https://codesandbox.io/s/react-hook-form-controller-079xx?file=/src/index.js:3850-3861
   */
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
  components: PropTypes.object,
};
export default ReactSelect;
