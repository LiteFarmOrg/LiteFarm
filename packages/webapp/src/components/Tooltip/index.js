import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';


const OverlayTooltip = ({
  children = 'LiteFarm',
  content = 'LiteFarm',
}) => {
  return (
    <>
      <style type="text/css">
        {`.tooltip .arrow::before {
            border-bottom-color: var(--iconDefault);
            border-width: 0 10px 10px;
          }

          .tooltip-inner {
            background-color: var(--iconDefault);
            padding: 12px 16px;
            font-size: 14px;
            line-height: 24px;
            color: var(--tooltipFont);
            box-shadow: 2px 6px 12px rgba(102, 115, 138, 0.2);
            border-radius: 4px;
            text-align: left;
            max-width: 264px;
          }

          .tooltip {
            margin-top: 12px;
          }
          .arrow {
            transform: translateX(16px) !important;
          }
`}
      </style>
      <OverlayTrigger
        placement={'bottom-start'}
        overlay={
          <Tooltip id={'toolkit-bottom'}>
            {content}
          </Tooltip>
        }
      >
        {children}
      </OverlayTrigger>
    </>
  );
};

OverlayTooltip.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  content: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default OverlayTooltip;