import Layout from '../Layout';
import CropHeader from './CropHeader';
import RouterTab from '../RouterTab';
import React, { useMemo, useState } from 'react';
import { AddLink, Semibold } from '../Typography';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CardWithStatusContainer } from '../CardWithStatus/CardWithStatusContainer/CardWithStatusContainer';
import { ManagementPlanCard } from '../CardWithStatus/ManagementPlanCard/ManagementPlanCard';
import Input from '../Form/Input';

export default function PureCropManagement({
  history,
  match,
  onBack,
  variety,
  onAddManagementPlan,
  managementPlanCardContents,
  isAdmin,
  location,
}) {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const searchStringOnChange = (e) => setSearchString(e.target.value);
  const filteredManagementPlanCardContents = useMemo(() => {
    return searchString
      ? managementPlanCardContents.filter(
          ({ locationName, managementPlanName, status }) =>
            locationName?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            managementPlanName?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            status?.toLowerCase()?.includes(searchString?.toLowerCase()),
        )
      : managementPlanCardContents;
  }, [searchString, managementPlanCardContents]);

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
            state: location?.state,
          },
          {
            label: t('CROP_DETAIL.DETAIL_TAB'),
            path: `/crop/${match.params.variety_id}/detail`,
            state: location?.state,
          },
        ]}
      />
      <Semibold style={{ marginBottom: '16px' }}>{t('CROP_DETAIL.MANAGEMENT_PLANS')}</Semibold>
      {managementPlanCardContents?.length > 2 && (
        <Input
          style={{ paddingBottom: '16px' }}
          value={searchString}
          onChange={searchStringOnChange}
          isSearchBar
        />
      )}
      {isAdmin && (
        <AddLink data-cy="crop-addPlan" onClick={onAddManagementPlan}>
          {' '}
          {t('CROP_DETAIL.ADD_PLAN')}
        </AddLink>
      )}
      {managementPlanCardContents && (
        <CardWithStatusContainer style={{ paddingTop: '16px' }}>
          {filteredManagementPlanCardContents.map((managementPlan, index) => (
            <ManagementPlanCard
              onClick={() =>
                history.push(
                  `/crop/${variety.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/tasks`,
                  location.state,
                )
              }
              {...managementPlan}
              key={index}
            />
          ))}
        </CardWithStatusContainer>
      )}
    </Layout>
  );
}

PureCropManagement.propTypes = {
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
    }),
  ),
  history: PropTypes.object,
  match: PropTypes.object,
  onBack: PropTypes.func,
  variety: PropTypes.object,
  onAddManagementPlan: PropTypes.func,
  isAdmin: PropTypes.bool,
};
