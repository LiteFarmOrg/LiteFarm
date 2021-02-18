import React from 'react';
import PropTypes from 'prop-types';
import OverlayTooltip from '../index';
import { BsQuestionCircle } from 'react-icons/bs';
import styles from './moreInfo.scss';

const MoreInfo = ({ content = 'LiteFarm', className, autoOpen, ...props }) => {
  return (
    <>
      <OverlayTooltip
        placement={'bottom-end'}
        content={content}
        styles={{
          floater: { filter: 'none' },
          arrow: { color: 'var(--grey400)', spread: 20, length: 10 },
        }}
        event="hover"
        offset={2}
        eventDelay={0}
        style={{ transform: 'translateX(-10px)' }}
        autoOpen={autoOpen}
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
