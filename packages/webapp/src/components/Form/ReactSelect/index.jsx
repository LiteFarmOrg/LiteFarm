import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';
import { Label, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../assets/theme';
import Infoi from '../../Tooltip/Infoi';
import { BsX } from 'react-icons/bs';

export const styles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'var(--green100)',
    },
    fontSize: '16px',
    lineHeight: '24px',
    color: state.isDisabled ? 'var(--grey400)' : 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    paddingLeft: '10px',
    minHeight: '40px',
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

  placeholder: (provided) => ({
    ...provided,
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
  multiValueRemove: (provided, state) => ({
    ...provided,
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'white',
    },
  }),

  multiValueLabel: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    lineHeight: '24px',
    color: 'white',
    padding: 0,
  }),
  multiValue: (provided, state) => ({
    ...provided,
    borderRadius: '32px',
    padding: '0 12px',
    border: '1px solid var(--teal700)',
    fontWeight: 600,
    backgroundColor: colors.teal600,
    minHeight: '26px',
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

const ReactSelect = React.forwardRef(function ReactSelect(
  {
    label,
    optional,
    placeholder,
    createPromptText,
    options,
    toolTipContent,
    icon,
    style,
    autoOpen,
    components,
    isSearchable,
    defaultValue,
    creatable = false,
    isDisabled = false,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  if (!placeholder) placeholder = t('common:SELECT') + '...';
  if (!createPromptText) createPromptText = t('common:CREATE');

  return (
    <div data-cy="react-select" style={style}>
      {(label || toolTipContent || icon) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: '20px',
            position: 'relative',
          }}
        >
          <Label style={{ position: 'absolute', bottom: 0 }}>
            {label}
            {optional && (
              <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                {t('common:OPTIONAL')}
              </Label>
            )}
          </Label>
          {toolTipContent && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Infoi content={toolTipContent} autoOpen={autoOpen} />
            </div>
          )}
          {icon && (
            <span style={{ marginRight: 'auto', marginLeft: '8px' }} className={styles.icon}>
              {icon}
            </span>
          )}
        </div>
      )}{' '}
      {creatable && (
        <CreatableSelect
          customStyles
          formatCreateLabel={(userInput) => `${createPromptText} "${userInput}"`}
          menuPortalTarget={document.body}
          styles={{
            ...styles,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            singleValue: (provided, state) => ({
              ...provided,
              color: isDisabled ? 'var(--grey600)' : null,
            }),
            container: (provided, state) => ({
              ...provided,
              backgroundColor: isDisabled ? 'var(--inputDisabled)' : null,
            }),
          }}
          placeholder={placeholder}
          options={options}
          components={{
            ClearIndicator: ({ innerProps }) => (
              <Underlined
                {...innerProps}
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: '-20px',
                  color: colors.brown700,
                }}
              >
                {t('REACT_SELECT.CLEAR')}
              </Underlined>
            ),
            ...components,
          }}
          isSearchable={options?.length > 8 || isSearchable}
          ref={ref}
          defaultValue={defaultValue}
          isDisabled={isDisabled}
          isClearable={true}
          {...props}
        />
      )}
      {!creatable && (
        <Select
          customStyles
          menuPortalTarget={document.body}
          styles={{
            ...styles,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            singleValue: (provided, state) => ({
              ...provided,
              color: isDisabled ? 'var(--grey600)' : null,
            }),
            container: (provided, state) => ({
              ...provided,
              backgroundColor: isDisabled ? 'var(--inputDisabled)' : null,
            }),
          }}
          placeholder={placeholder}
          options={options}
          components={{
            ClearIndicator: ({ innerProps }) => (
              <Underlined
                {...innerProps}
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: '-20px',
                  color: colors.brown700,
                }}
              >
                {t('REACT_SELECT.CLEAR_ALL')}
              </Underlined>
            ),
            MultiValueRemove: ({ innerProps }) => (
              <div {...innerProps}>
                <BsX />
              </div>
            ),
            ...components,
          }}
          isSearchable={options?.length > 8 || isSearchable}
          ref={ref}
          defaultValue={defaultValue}
          isDisabled={isDisabled}
          {...props}
        />
      )}
    </div>
  );
});

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
