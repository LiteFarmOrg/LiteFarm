import styles from './styles.module.scss';
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import InputBaseLabel from './InputBaseLabel';
import InputBaseField from './InputBaseField';
import { Error, Info, TextWithExternalLink } from '../../Typography';
import { Cross } from '../../Icons';

export type InputBaseProps = {
  label?: string;
  optional?: boolean;
  hasLeaf?: boolean;
  toolTipContent?: string;
  icon?: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  onCrossClick?: () => void;
  info?: string;
  error?: string;
  link?: string;
  textWithExternalLink?: string;
  classes?: Record<'input' | 'label' | 'container' | 'info' | 'errors', React.CSSProperties>;
};

export default function InputBase({
  label,
  optional,
  hasLeaf,
  toolTipContent,
  error,
  info,
  textWithExternalLink,
  link,
  icon,
  leftSection,
  rightSection,
  onCrossClick,
  classes,
  ...inputProps
}: InputBaseProps & ComponentPropsWithoutRef<'input'>) {
  return (
    <div className={styles.inputWrapper}>
      <label>
        {label && (
          <InputBaseLabel
            label={label}
            icon={icon}
            hasLeaf={hasLeaf}
            optional={optional}
            toolTipContent={toolTipContent}
          />
        )}
        <InputBaseField
          leftSection={leftSection}
          rightSection={rightSection}
          inputProps={inputProps}
          crossIcon={!!error ? <Cross isClickable onClick={onCrossClick} /> : undefined}
        />
      </label>
      {info && !error && <Info style={classes?.info}>{info}</Info>}
      {error && (
        <Error data-cy="error" style={classes?.errors}>
          {error}
        </Error>
      )}
      {textWithExternalLink && link && (
        <TextWithExternalLink link={link}>{textWithExternalLink}</TextWithExternalLink>
      )}
    </div>
  );
}
