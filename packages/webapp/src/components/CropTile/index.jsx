import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Square from '../Square';
import PropTypes from 'prop-types';
import { StatusLabel } from '../CardWithStatus/StatusLabel';
import { managementPlanStatusTranslateKey } from '../CardWithStatus/ManagementPlanCard/ManagementPlanCard';
import { useTranslation } from 'react-i18next';

export default function PureCropTile({
  className,
  title,
  onClick,
  style,
  cropCount = {},
  needsPlan,
  src,
  alt,
  isPastVariety,
  isCropTemplate,
  children,
  isSelected,
  status,
}) {
  const { active = 0, planned = 0, past = 0, noPlans = 0 } = cropCount;
  const { t } = useTranslation();
  return (
    <div
      data-cy="crop-tile"
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

      {planned + past + active !== 0 && (
        <div className={styles.cropCountContainer}>
          <Square isCropTile>{active}</Square>
          <Square color={'planned'} isCropTile>
            {planned}
          </Square>
          <Square color={'past'} isCropTile>
            {past}
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
            label={t(`MANAGEMENT_PLAN.STATUS.${managementPlanStatusTranslateKey[status]}`)}
            sm
          />
        </div>
      )}

      {noPlans !== 0 && (
        <div className={styles.needsPlanContainer}>
          <Square color={'needsPlan'} isCropTile style={{ borderBottomRightRadius: '4px' }}>
            {noPlans}
          </Square>
        </div>
      )}

      <div className={styles.info}>
        <div data-cy="crop-name" className={styles.infoMain}>
          {title}
        </div>
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
