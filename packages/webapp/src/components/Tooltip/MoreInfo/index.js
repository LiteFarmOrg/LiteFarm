import React from 'react';
import PropTypes from 'prop-types';
import OverlayTooltip from '../index';
import { BsQuestionCircle } from 'react-icons/bs';
import styles from './moreInfo.module.scss';

const MoreInfo = ({ content = 'LiteFarm', className, autoOpen, ...props }) => {
  return (
    <>
      <OverlayTooltip
        placement={'bottom-end'}
        content={content}
        event="hover"
        eventDelay={0}
        style={{ transform: 'translateX(-10px)' }}
        autoOpen={autoOpen}
        isChildrenIcon
        {...props}
      >
        <BsQuestionCircle className={styles.icon} />
      </OverlayTooltip>
    </>
  );
};

MoreInfo.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  autoOpen: PropTypes.bool,
};

export default MoreInfo;
