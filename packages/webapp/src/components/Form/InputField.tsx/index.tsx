import { Error, Info, Label, TextWithExternalLink } from '../../Typography';
import styles from '../Input/input.module.scss';
import clsx from 'clsx';
import Infoi from '../../Tooltip/Infoi';
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';
import { useTranslation } from 'react-i18next';
import { ComponentPropsWithoutRef } from 'react';

export type CommonInputFieldProps = {
  label?: string;
  optional?: boolean;
  hasLeaf?: boolean;
  toolTipContent?: string;
  isSearchBar?: boolean;
  errors?: string;
  info?: string;
  textWithExternalLink?: string;
  link?: string;
  classes?: {
    input: React.CSSProperties;
    label: React.CSSProperties;
    container: React.CSSProperties;
    info: React.CSSProperties;
    errors: React.CSSProperties;
  };
};

type InputFieldProps = CommonInputFieldProps & ComponentPropsWithoutRef<'input'>;

export default function InputField({
  label,
  optional,
  hasLeaf,
  toolTipContent,
  isSearchBar,
  errors,
  info,
  textWithExternalLink,
  link,
  classes,
  ...inputProps
}: InputFieldProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <div className={styles.labelContainer}>
          <Label style={{ position: 'absolute', bottom: 0 }}>
            {label}
            {optional && (
              <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                {t('common:OPTIONAL')}
              </Label>
            )}
            {hasLeaf && <Leaf className={styles.leaf} />}
          </Label>
          {toolTipContent && (
            <div className={styles.tooltipIconContainer}>
              <Infoi content={toolTipContent} />
            </div>
          )}
          {/* {icon && <span className={styles.icon}>{icon}</span>} */}
        </div>
      )}
      <input
        className={clsx(styles.input, isSearchBar && styles.searchBar, errors && styles.inputError)}
        {...inputProps}
      />
      {info && !errors && <Info style={classes?.info}>{info}</Info>}
      {errors && (
        <Error data-cy="error" style={classes?.errors}>
          {errors}
        </Error>
      )}
      {textWithExternalLink && link && (
        <TextWithExternalLink link={link}>{textWithExternalLink}</TextWithExternalLink>
      )}
    </div>
  );
}
