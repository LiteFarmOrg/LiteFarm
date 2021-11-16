import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Square from '../Square';
import PropTypes from 'prop-types';
import { StatusLabel } from '../CardWithStatus/StatusLabel';
import { managementPlanStatusText } from '../CardWithStatus/ManagementPlanCard/ManagementPlanCard';

export default function PureCropTile({
  className,
  title,
  onClick,
  style,
  cropCount,
  needsPlan,
  src,
  alt,
  isPastVariety,
  isCropTemplate,
  children,
  isSelected,
  status,
}) {
  return (
    <div
      className={clsx(
        styles.container,
        isPastVariety && styles.pastVarietyContainer,
        isCropTemplate && styles.cropTemplateContainer,
        isSelected && styles.selectedContainer,
        className,
      )}
      style={style}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={styles.img}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'crop-images/default.jpg';
        }}
      />

      {cropCount && (
        <div className={styles.cropCountContainer}>
          <Square isCropTile>{cropCount.active}</Square>
          <Square color={'planned'} isCropTile>
            {cropCount.planned}
          </Square>
          <Square color={'past'} isCropTile>
            {cropCount.past}
          </Square>
        </div>
      )}
      {status && (
        <div className={styles.cropCountContainer}>
          <StatusLabel
            style={{
              borderRadius: '4px 4px 4px 4px',
            }}
            color={status}
            label={managementPlanStatusText[status]}
            sm
          />
        </div>
      )}

      {needsPlan && (
        <div className={styles.needsPlanContainer}>
          <Square color={'needsPlan'} isCropTile style={{ borderBottomRightRadius: '4px' }} />
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.infoMain}>{title}</div>
        {children}
      </div>
    </div>
  );
}

PureCropTile.prototype = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
  cropCount: PropTypes.exact({
    active: PropTypes.number,
    planned: PropTypes.number,
    past: PropTypes.number,
  }),
  needsPlan: PropTypes.bool,
  title: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string,
  isPastVariety: PropTypes.bool,
  isCropTemplate: PropTypes.bool,
  status: PropTypes.oneOf(['active', 'planned', 'completed', 'abandoned']),
};
