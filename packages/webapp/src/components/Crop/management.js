import Layout from '../Layout';
import CropHeader from './cropHeader';
import RouterTab from '../RouterTab';
import React from 'react';
import { AddLink, Semibold } from '../Typography';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function PureCropManagement({
  history,
  match,
  onBack,
  variety,
  onAddManagementPlan,
  managementPlanCardContents,
}) {
  const { t } = useTranslation();
  return (
    <Layout>
      <CropHeader {...variety} onBackClick={onBack} />
      <RouterTab
        classes={{ container: { margin: '24px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={[
          {
            label: t('CROP_DETAIL.MANAGEMENT_TAB'),
            path: `/crop/${match.params.variety_id}/management`,
          },
          {
            label: t('CROP_DETAIL.DETAIL_TAB'),
            path: `/crop/${match.params.variety_id}/detail`,
          },
        ]}
      />
      <Semibold style={{ marginBottom: '16px' }}>{t('CROP_DETAIL.MANAGEMENT_PLANS')}</Semibold>
      <AddLink onClick={onAddManagementPlan}> {t('CROP_DETAIL.ADD_PLAN')}</AddLink>
    </Layout>
  );
}

export default PureCropManagement;

PureCropManagement.propTypes = {
  managementPlanCardContents: PropTypes.arrayOf(
    PropTypes.shape({
      managementPlanName: PropTypes.string,
      locationName: PropTypes.string,
      notes: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      numberOfPendingTask: PropTypes.number,
      status: PropTypes.string,
    }),
  ),
  history: PropTypes.object,
  match: PropTypes.object,
  onBack: PropTypes.func,
  variety: PropTypes.object,
  onAddManagementPlan: PropTypes.object,
};
