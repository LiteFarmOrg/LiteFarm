import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Square from '../Square';
import PropTypes from 'prop-types';

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
}) {
  return (
    <div
      className={clsx(
        styles.container,
        isPastVariety && styles.pastVarietyContainer,
        isCropTemplate && styles.cropTemplateContainer,
        className,
      )}
      style={style}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
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

      {needsPlan && (
        <div className={styles.cropCountContainer}>
          <Square color={'needsPlan'} isCropTile />
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
};
