import React, { ReactNode } from 'react';
import styles from './typography.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Infoi from '../Tooltip/Infoi';
import { ReactComponent as Leaf } from '../../assets/images/farmMapFilter/Leaf.svg';
import { ReactComponent as Pencil } from '../../assets/images/managementPlans/pencil.svg';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ExternalLinkIcon } from '../../assets/images/icon_external_link.svg';

type TypographyProps = {
  style?: object;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
};

export const Underlined = ({
  children = 'Link',
  className = '',
  style = {},
  ...props
}: TypographyProps) => {
  return (
    <p className={clsx(styles.underlined, className)} style={style} {...props}>
      {children}
    </p>
  );
};

type IconLinkProps = TypographyProps & {
  icon?: ReactNode;
  isIconClickable?: boolean;
};
export const IconLink = ({
  children = 'IconLink',
  className = '',
  style,
  onClick,
  icon,
  isIconClickable = false,
  ...props
}: IconLinkProps) => {
  return (
    <p
      style={style}
      className={clsx(styles.addLinkContainer, className, isIconClickable && styles.clickable)}
      onClick={isIconClickable ? onClick : undefined}
      {...props}
    >
      {icon}{' '}
      <span
        className={clsx(styles.underlined, styles.iconLinkText)}
        onClick={isIconClickable ? undefined : onClick}
      >
        {children}
      </span>
    </p>
  );
};

export const AddLink = ({
  children = 'AddLink',
  className = '',
  style,
  onClick,
  ...props
}: TypographyProps) => {
  return (
    <IconLink className={className} style={style} onClick={onClick} icon={'+'} {...props}>
      {children}
    </IconLink>
  );
};

type SubtractLinkProps = TypographyProps & {
  color?: string;
};
export const SubtractLink = ({
  children = 'SubtractLink',
  className = '',
  style,
  onClick,
  color,
  ...props
}: SubtractLinkProps) => {
  return (
    <IconLink className={className} style={style} onClick={onClick} icon={'-'} {...props}>
      {children}
    </IconLink>
  );
};

export const EditLink = ({
  children = 'Link',
  className = '',
  style,
  onClick,
  ...props
}: TypographyProps) => {
  return (
    <p style={style} className={clsx(styles.editLinkContainer, className)} {...props}>
      <Pencil className={styles.pencil} />
      <span className={clsx(styles.underlined)} onClick={onClick}>
        {children}
      </span>
    </p>
  );
};

export const Title = ({ children = 'Title', className = '', style, ...props }: TypographyProps) => {
  return (
    <h3 className={clsx(styles.title, className)} style={style} {...props}>
      {children}
    </h3>
  );
};

type TypographySmProps = TypographyProps & { sm?: boolean };

export const Semibold = ({
  children = 'Semibold',
  className = '',
  style,
  sm,
  ...props
}: TypographySmProps) => {
  return (
    <h4 className={clsx(styles.semibold, sm && styles.sm, className)} style={style} {...props}>
      {children}
    </h4>
  );
};

export const Label = ({
  children = 'Label',
  className = '',
  sm = false,
  style,
  ...props
}: TypographySmProps) => {
  return sm ? (
    <span className={clsx(styles.smLabel, className)} style={style} {...props}>
      {children}
    </span>
  ) : (
    <h5 className={clsx(styles.label, className)} style={style} {...props}>
      {children}
    </h5>
  );
};

export const Error = ({ children = 'Error', className = '', style, ...props }: TypographyProps) => {
  return (
    <p className={clsx(styles.error, className)} style={style} {...props}>
      {children}
    </p>
  );
};

Error.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const Info = ({ children = 'Info', className = '', style, ...props }: TypographyProps) => {
  return (
    <p className={clsx(styles.info, className)} style={style} {...props}>
      {children}
    </p>
  );
};

type MainProps = TypographyProps & {
  hasLeaf?: boolean;
  tooltipContent?: string | undefined;
};

export const Main = ({
  children = 'Main',
  tooltipContent,
  hasLeaf,
  className = '',
  style,
  ...props
}: MainProps) => {
  return (
    <p className={clsx(styles.main, className)} style={style} {...props}>
      {children}
      {hasLeaf && <Leaf style={{ marginLeft: '8px', transform: 'translateY(3px)' }} />}
      {tooltipContent && (
        <>
          &nbsp;&nbsp;
          <Infoi
            style={{ fontSize: '18px', transform: 'translateY(3px)' }}
            content={tooltipContent}
          />
        </>
      )}
    </p>
  );
};

Main.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  tooltipContent: PropTypes.string,
  hasLeaf: PropTypes.bool,
};

export const Text = ({ children = 'Text', className = '', style, ...props }: TypographyProps) => {
  return (
    <p className={clsx(styles.text, className)} style={style} {...props}>
      {children}
    </p>
  );
};

type TextWithExternalLinkProps = TypographyProps & {
  link: string;
};

export const TextWithExternalLink = ({
  children = 'SubText',
  className = '',
  style,
  link,
  ...props
}: TextWithExternalLinkProps) => {
  const { t } = useTranslation(['translation', 'common', 'crop']);

  return (
    <>
      <div
        className={styles.info}
        style={{ width: 'fit-content', display: 'inline-block' }}
        {...props}
      >
        {children}

        <div
          className={clsx(styles.text, className)}
          style={{ width: 'fit-content', display: 'inline-block', ...style }}
          {...props}
        >
          <Underlined
            onClick={() => window.open(link, '_blank')}
            style={{ width: 'fit-content', display: 'inline-block', marginLeft: '3px' }}
          >
            {t('common:HERE').toLowerCase()}
          </Underlined>
          <ExternalLinkIcon
            style={{
              width: '15px',
              height: '15px',
              marginLeft: '2px',
              position: 'absolute',
              bottom: '4px',
            }}
          />
        </div>
      </div>
    </>
  );
};
