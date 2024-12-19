/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Main } from '../../Typography';
import ModalComponent from '../ModalComponent/v2';
import { ManagementPlanCard } from '../../CardWithStatus/ManagementPlanCard/ManagementPlanCard';
import { CardWithStatusContainer } from '../../CardWithStatus/CardWithStatusContainer/CardWithStatusContainer';
import useWindowInnerHeight from '../../../containers/hooks/useWindowInnerHeight';
import styles from './styles.module.scss';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

const MODAL_MARGIN = 32;
const MODAL_PADDING = 24;
const TITLE_HEIGHT = 42;

export default function CropPlansModal({ variety, managementPlanCardContents, dismissModal }) {
  let navigate = useNavigate();
  let location = useLocation();
  const { t } = useTranslation();
  const infoRef = useRef(null);

  const windowHeight = useWindowInnerHeight();
  const [hasAllIterations, setHasAllIterations] = useState(true);
  const [infoHeight, setInfoHeight] = useState(null);

  const contentHeight = useMemo(() => {
    return windowHeight - (MODAL_MARGIN * 2 + MODAL_PADDING * 2 + TITLE_HEIGHT + (infoHeight || 0));
  }, [windowHeight, infoHeight]);

  useEffect(() => {
    setHasAllIterations(
      managementPlanCardContents[0].repetition_count === managementPlanCardContents.length,
    );
  }, [managementPlanCardContents]);

  useEffect(() => {
    setInfoHeight(infoRef?.current?.offsetHeight || null);
  }, [hasAllIterations]);

  return (
    <ModalComponent
      title={managementPlanCardContents[0].managementPlanName}
      dismissModal={dismissModal}
    >
      {!hasAllIterations && (
        <div ref={infoRef}>
          <Main className={styles.infoText}>{t('CROP.REPEAT_PLAN_MODAL.DELETED_PLANS')}</Main>
        </div>
      )}
      <div className={styles.content} style={{ maxHeight: contentHeight }}>
        <CardWithStatusContainer style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
          {managementPlanCardContents.map((managementPlan, index) => {
            return (
              <ManagementPlanCard
                key={index}
                {...managementPlan}
                onClick={() =>
                  navigate(
                    `/crop/${variety.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/tasks`,
                    { state: location.state },
                  )
                }
              />
            );
          })}
        </CardWithStatusContainer>
      </div>
    </ModalComponent>
  );
}

CropPlansModal.propTypes = {
  managementPlanCardContents: PropTypes.arrayOf(
    PropTypes.shape({
      managementPlanName: PropTypes.string,
      locationName: PropTypes.string,
      notes: PropTypes.string,
      startDate: PropTypes.any,
      endDate: PropTypes.any,
      numberOfPendingTask: PropTypes.number,
      status: PropTypes.oneOf(['active', 'planned', 'completed', 'abandoned']),
      management_plan_id: PropTypes.number,
      management_plan_group_id: PropTypes.string,
      repetition_count: PropTypes.number,
      repetition_number: PropTypes.number,
    }),
  ).isRequired,
  variety: PropTypes.object.isRequired,
  dismissModal: PropTypes.func.isRequired,
};
